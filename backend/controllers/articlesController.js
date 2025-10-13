const models = require('../models');
const { Op, Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { safeUnlink } = require('../utils/safeUnlink');
const { notifyAdminValidation } = require('../utils/notifyAdminValidation');
const { sequelize, Article, User, Like, Tag, Comment } = require('../models');

const { videoQueue } = require('../services/videoQueue');
const ffmpeg = require('fluent-ffmpeg'); // for a light preflight probe

// Quick preflight validation: cheap checks before enqueue
async function quickVideoPreflight(absFullPath) {
  // 1) existence + size
  const stat = fs.statSync(absFullPath);
  const maxBytes = 1_500_000_000; // 1.5 GB safety cap (tune if needed)
  if (stat.size <= 0) throw new Error('Empty file');
  if (stat.size > maxBytes) throw new Error('File too large for preflight');

  // 2) naive extension allowlist (you can expand later)
  const ext = path.extname(absFullPath).toLowerCase();
  const allowed = new Set(['.mp4', '.mov', '.m4v', '.webm']);
  if (!allowed.has(ext)) throw new Error(`Unsupported extension: ${ext}`);

  // 3) very light ffprobe to ensure we see at least one video stream
  const meta = await new Promise((resolve, reject) => {
    ffmpeg.ffprobe(absFullPath, (err, data) => (err ? reject(err) : resolve(data)));
  });

  const videoStream = meta?.streams?.find(s => s.codec_type === 'video');
  if (!videoStream) throw new Error('No video stream detected');
  // Optional: short duration sanity check (may be undefined on some files)
  // const duration = Number(meta?.format?.duration || 0);
  // if (Number.isFinite(duration) && duration <= 0) throw new Error('Invalid duration');
}

// helpers at top of file if not present:
const isDev = process.env.NODE_ENV === 'development';
function toAbs(rel) {
  if (!rel) return null;
  return isDev ? path.resolve(rel) : path.join('/app/public', rel);
}
async function purgeReactions(articleId) {
  try {
    await Like.destroy({ where: { articleId } })
    await Comment.destroy({ where: { articleId } })
  } catch (e) {
    console.warn('[purgeReactions] warn:', e?.message || e)
  }
}

module.exports = {
  indexValidated: async function (req, res, next) {
    try {
      const { limit = 10, offset = 0, tag, search, dateFrom, dateTo, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const whereClause = { isValid: true };

      if (!req.user?.isAdmin) {
        whereClause[Op.and] = [
          { isPrivate: false },
        ];
      }

      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      if (dateFrom && dateTo) {
        const startDate = new Date(dateFrom);
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);

        whereClause.createdAt = {
          [Op.between]: [startDate, endDate],
        };
      }

      const includeOptions = [
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
        {
          model: Comment,
          as: 'comments',
          attributes: ['id', 'content', 'userId', 'createdAt'],
          include: [{ model: User, attributes: ['id', 'pseudo'], as: 'user' }]
        }
      ];

      // Filtrage par tag si un tag est sélectionné
      if (tag) {
        includeOptions[0].where = { name: tag };
      }

      const articles = await Article.findAll({
        where: whereClause,
        attributes: {
          include: [
            [
              Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM Likes AS likes
                            WHERE likes.articleId = Article.id
                        )`),
              'likeCount'
            ]
          ]
        },
        include: includeOptions,
        order: [
          sortBy === 'likes' ? [Sequelize.literal('likeCount'), sortOrder] : ['createdAt', sortOrder]
        ],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.status(200).json({ articles });
    } catch (error) {
      console.error('Error fetching articles:', error.message);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  indexNotValidated: function (req, res, next) {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const whereClause = {
      [Op.and]: [
        {
          [Op.or]: [
            { isValid: false },
            { isValid: null }
          ]
        },
      ]
    };

    Article.findAll({
      offset,
      limit,
      where: whereClause,
      include: [
        {
          model: models.Like,
          as: 'likes',
          include: [
            {
              model: models.User,
              as: 'user',
              attributes: ['id', 'pseudo', 'email'],
            }
          ]
        },
        {
          model: models.Tag,
          as: 'tags',
        },
        {
          model: models.Comment,
          as: 'comments',
          include: [
            {
              model: models.User,
              as: 'user',
              attributes: ['id', 'pseudo', 'email'],
            },
            {
              model: models.Like,
              as: 'likes',
            },
          ]
        },
      ]
    })
      .then((articles) => { res.json({ articles }); })
      .catch((error) => {
        console.log("error: ", error)
        res.status(500).json({ message: req.t('error') })
      })
  },
  indexNotValidatedByUser: function (req, res, next) {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 10;

    Article.findAll({
      offset: offset,
      limit: limit,
      where: {
        userId: req.params.id,
        [Op.or]: [
          { isValid: false },
          { isValid: null }
        ]
      },
      include: [
        {
          model: models.Like,
          as: 'likes',
          include: [
            {
              model: models.User,
              as: 'user',
              attributes: ['id', 'pseudo', 'email'],
            }
          ]
        },
        {
          model: models.Tag,
          as: 'tags',
        },
        {
          model: models.Comment,
          as: 'comments',
          include: [
            {
              model: models.User,
              as: 'user',
              attributes: ['id', 'pseudo', 'email'],
            },
            {
              model: models.Like,
              as: 'likes',
            },
          ]
        },
      ]
    })
      .then((articles) => {
        res.status(200).json({ articles });
      })
      .catch((error) => {
        console.log("error: ", error);
        res.status(500).json({ message: req.t('error') });
      });
  },
  indexValidatedByUser: function (req, res, next) {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 10;

    Article.findAll({
      offset: offset,
      limit: limit,
      where: {
        userId: req.params.id,
        [Op.or]: [
          { isValid: true },
        ]
      },
      include: [
        {
          model: models.Like,
          as: 'likes',
          include: [
            {
              model: models.User,
              as: 'user',
              attributes: ['id', 'pseudo', 'email'],
            }
          ]
        },
        {
          model: models.Tag,
          as: 'tags',
        },
        {
          model: models.Comment,
          as: 'comments',
          include: [
            {
              model: models.User,
              as: 'user',
              attributes: ['id', 'pseudo', 'email'],
            },
            {
              model: models.Like,
              as: 'likes',
            },
          ]
        },
      ]
    })
      .then((articles) => {
        res.status(200).json({ articles });
      })
      .catch((error) => {
        console.log("error: ", error);
        res.status(500).json({ message: req.t('error') });
      });
  },
  show: async function (req, res, next) {
    try {
      const article = await Article.findByPk(req.params.id, {
        include: [
          {
            model: models.Like,
            as: 'likes',
            include: [
              {
                model: models.User,
                as: 'user',
                attributes: ['id', 'pseudo', 'email'],
              }
            ]
          },
          {
            model: models.Tag,
            as: 'tags',
          },
          {
            model: models.Comment,
            as: 'comments',
            include: [
              {
                model: models.User,
                as: 'user',
                attributes: ['id', 'pseudo', 'email'],
              },
              {
                model: models.Like,
                as: 'likes',
              },
            ]
          },
        ]
      });

      if (!article) {
        return res.status(404).json({ message: req.t('notFound') });
      }

      if (article.isPrivate && (article.userId !== req.user?.id || !req.user?.isAdmin)) {
        return res.status(403).json({ message: req.t('article_detail.private_access_denied') });
      }

      res.status(200).json({ article });

    } catch (error) {
      console.error("Error fetching article:", error.message);
      res.status(500).json({ message: req.t('error') });
    }
  },
  showPrivate: async function (req, res, next) {
    try {
      const article = await Article.findOne({
        where: { privateLink: req.params.privateLink },
        include: [
          {
            model: models.Like,
            as: 'likes',
            include: [
              {
                model: models.User,
                as: 'user',
                attributes: ['id', 'pseudo', 'email'],
              }
            ]
          },
          {
            model: models.Tag,
            as: 'tags',
          },
          {
            model: models.Comment,
            as: 'comments',
            include: [
              {
                model: models.User,
                as: 'user',
                attributes: ['id', 'pseudo', 'email'],
              },
              {
                model: models.Like,
                as: 'likes',
              },
            ]
          },
        ]
      });

      if (!article || !article.isPrivate) {
        return res.status(404).json({ message: req.t('notFound') });
      }

      res.status(200).json({ article });
    } catch (error) {
      console.error("Error fetching private article:", error.message);
      res.status(500).json({ message: req.t('error') });
    }
  },
  create: async function (req, res, next) {
    const { title, description, urlYoutube, tags, isPrivate } = req.body;
    const { lang } = req.query;

    if (!title || !description) {
      return res.status(400).json({ message: req.t('article.fields_required') });
    }

    if (title.length < 3) {
      return res.status(400).json({ message: req.t('article.title_length') });
    }

    if (typeof tags === 'string') {
      try {
        req.body.tags = JSON.parse(tags);
      } catch (error) {
        return res.status(400).json({ message: req.t('article.invalid_tags') });
      }
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ message: req.t('article.tag_required') });
    }

    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ message: req.t('article.user_required') });
    }

    const t = await sequelize.transaction();
    try {
      // Build paths from multer
      let privateLink = null;
      let previewPath = null;
      let videoPath = null;
      let originalVideo = null;

      if (isPrivate) {
        const crypto = require('crypto');
        privateLink = crypto.randomBytes(16).toString('hex');
      }

      if (req.files?.preview?.[0]) {
        previewPath = req.uploadedFiles.preview.replace('/app/public', '');
        if (process.env.NODE_ENV === 'development') {
          previewPath = `uploads/previews/${req.files.preview[0].filename}`;
        }
      }

      if (req.files?.video?.[0]) {
        videoPath = req.uploadedFiles.video.replace('/app/public', '');
        if (process.env.NODE_ENV === 'development') {
          videoPath = `uploads/videos/${req.files.video[0].filename}`;
        }
        originalVideo = videoPath; // store original relative path
      }

      // Compute absolute full path for the uploaded video (if any)
      let fullVideoPath = null;
      if (originalVideo) {
        fullVideoPath = path.join('/app/public', originalVideo);
        if (process.env.NODE_ENV === 'development') {
          fullVideoPath = path.resolve(originalVideo); // local dev resolves to ./uploads/videos/xxx
        }
        // 🟣 PRE-FLIGHT ultra fast: if it throws → we delete file + rollback
        await quickVideoPreflight(fullVideoPath);
      }

      // Création de l'article
      const article = await Article.create({
        title,
        description,
        preview: previewPath,
        video: null,
        thumbnail: '',
        isPrivate,
        privateLink,
        urlYoutube: urlYoutube || null,
        refusalReasons: JSON.stringify({
          title: {
            value: '',
            isValid: null,
            validatedBy: null,
          },
          description: {
            value: '',
            isValid: null,
            validatedBy: null,
          },
          videoContent: {
            value: '',
            isValid: null,
            validatedBy: null,
          },
          videoFile: {
            value: '',
            isValid: null,
            validatedBy: null,
          },
          preview: {
            value: '',
            isValid: null,
            validatedBy: null,
          },
        }),
        overallReasonForRefusal: null,
        isValid: false,
        userId,
        processingStatus: originalVideo ? 'queued' : 'ready',
        processingProgress: originalVideo ? 0 : 100,
        originalVideo,
        processingError: null,
        processingRetries: 0,
      }, { transaction: t });

      // Associate tags inside the same transaction
      if (tags && Array.isArray(tags)) {
        const tagIds = tags.map((tag) => tag.id);
        const tagsToAssociate = await Tag.findAll({ where: { id: tagIds }, transaction: t });
        await article.setTags(tagsToAssociate, { transaction: t });
      }

      // Gamification
      const articleCount = await Article.count({ where: { userId }, transaction: t });
      const user = await User.findByPk(userId, { transaction: t });

      let achievement;
      let userAchievement;

      if (articleCount === 1) {
        achievement = await models.Achievement.findByPk(1, { transaction: t });
        await achievement.addUsers(user, { transaction: t });
        user.points += achievement.points;
        await user.save({ transaction: t });
      } else if (articleCount === 5) {
        achievement = await models.Achievement.findByPk(2, { transaction: t });
        await achievement.addUsers(user, { transaction: t });
        user.points += achievement.points;
        await user.save({ transaction: t });
      } else if (articleCount % 20 === 0) {
        achievement = await models.Achievement.findByPk(3, { transaction: t });
        const [userAchievement, created] = await models.UserAchievement.findOrCreate({
          where: { userId, achievementId: achievement.id },
          defaults: { dateEarned: new Date(), iteration: 1 },
          transaction: t,
        });
        if (!created) {
          userAchievement.iteration += 1;
          userAchievement.dateEarned = new Date();
          await userAchievement.save({ transaction: t });
        }
        user.points += achievement.points;
        await user.save({ transaction: t });
      }


      // ✅ All good → commit
      await t.commit();

      if (originalVideo && fullVideoPath) {
        try {
          await videoQueue.add('process', { articleId: article.id, fullVideoPath, runType: 'create', lang: lang });
        } catch (e) {
          console.error('[queue] enqueue afterCommit failed:', e?.message || e);
          try {
            await Article.update(
              { processingStatus: 'failed', processingError: 'enqueue_failed' },
              { where: { id: article.id } }
            );
          } catch (_) { }
        }
      } else if (urlYoutube || previewPath) {
        await notifyAdminValidation(article, lang);
      }

      return res.status(200).json({ article, achievement, userAchievement, user });

    } catch (error) {
      // delete uploaded file only if we had one and we didn't commit
      try {
        if (originalVideo && fullVideoPath) {
          safeUnlink(fullVideoPath);
        }
      } catch (_) { }

      try { await t.rollback(); } catch (_) { }
      console.error("Error creating article (preflight/enqueue): ", error.message);
      return res.status(500).json({ message: req.t('error') });
    }
  },
  like: function (req, res, next) {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: req.t('article.user_not_logged') });
    }

    Article.findByPk(req.params.id, {
      include: [
        {
          model: models.Like,
          as: 'likes',
          include: [
            {
              model: models.User,
              as: 'user',
              attributes: ['id', 'pseudo', 'email'],
            }
          ]
        },
        {
          model: models.Tag,
          as: 'tags',
        },
        {
          model: models.Comment,
          as: 'comments',
          include: [
            {
              model: models.User,
              as: 'user',
              attributes: ['id', 'pseudo', 'email'],
            }
          ]
        },
      ]
    })
      .then((article) => {
        if (!article) {
          return res.status(404).json({ message: req.t('article.not_found') });
        }

        models.Like.findOne({
          where: { userId: user.id, articleId: req.params.id }
        })
          .then((existingLike) => {
            if (existingLike) {
              return models.Like.destroy({ where: { userId: user.id, articleId: req.params.id } })
                .then(() => res.status(200).json({ message: "Article unliked", isLiked: false }))
                .catch((error) => {
                  console.error("Error while unliking article:", error.message);
                  res.status(500).json({ message: req.t('article.error_unliking') });
                });
            } else {
              models.Like.create({ userId: user.id, articleId: req.params.id })
                .then(() => {
                  (async () => {
                    try {
                      const achievement = await models.Achievement.findByPk(11);

                      const [userAchievement, created] = await models.UserAchievement.findOrCreate({
                        where: { userId: user.id, achievementId: achievement.id },
                        defaults: {
                          dateEarned: new Date(),
                          iteration: 1,
                        },
                      });

                      if (!created) {
                        // Si l'entrée existe déjà, incrémentez l'itération
                        userAchievement.iteration += 1;
                        await userAchievement.save();
                      }

                      user.points += achievement.points;
                      await user.save();

                      // Envoi d'une seule réponse après toutes les opérations
                      res.status(200).json({
                        message: "Article liked",
                        isLiked: true,
                        achievement,
                        userAchievement,
                        user,
                      });
                    } catch (error) {
                      console.error("Error processing achievement:", error.message);
                      res.status(500).json({ message: req.t('article.error_achievements') });
                    }
                  })();
                })
                .catch((error) => {
                  console.error("Error while liking article:", error.message);
                  res.status(500).json({ message: req.t('article.error_liking') });
                });
            }
          })
          .catch((error) => {
            console.error("Error checking like status:", error.message);
            res.status(500).json({ message: req.t('article.error_likes') });
          });
      })
      .catch((error) => {
        console.error("Error fetching article:", error.message);
        res.status(500).json({ message: req.t('article.error_fetch') });
      });
  },

  report: function (req, res, next) {
    const { articleId, reason, details, userId } = req.body;

    Article.findByPk(req.params.id)
      .then((article) => {
        if (!article) {
          return res.status(404).json({ message: req.t('article.not_found') });
        }

        return article.update({
          isValid: false,
        })
          .then(() => {
            models.Report.create({
              articleId: articleId,
              userId: userId,
              reason: reason,
              details: details,
            })
              .then(() => res.status(200).json({ message: req.t('article.reported') }))
              .catch((error) => {
                console.error("Error reporting article:", error.message);
                res.status(500).json({ message: req.t('error') });
              })
          })
          .catch((error) => {
            console.error("Error invalidating article:", error.message);
            res.status(500).json({ message: req.t('error') });
          });
      })
      .catch((error) => {
        console.error("Error fetching article:", error.message);
        res.status(500).json({ message: req.t('error') });
      });
  },
  update: async function (req, res, next) {
    try {
      const { title, description, urlYoutube, isPrivate, tags: rawTags } = req.body;
      const { lang } = req.query;

      // ——— Basic validations ———
      if (!title || !description) return res.status(400).json({ message: req.t('article.fields_required') });
      if (title.length < 3) return res.status(400).json({ message: req.t('article.title_length') });

      let tags = rawTags;
      if (typeof tags === 'string') {
        try { tags = JSON.parse(tags); }
        catch { return res.status(400).json({ message: req.t('article.invalid_tags') }); }
      }
      if (!Array.isArray(tags) || tags.length === 0) {
        return res.status(400).json({ message: req.t('article.tag_required') });
      }

      const userId = req.user.id;
      if (!userId) return res.status(400).json({ message: req.t('article.user_required') });

      const article = await Article.findByPk(req.params.id);
      if (!article) return res.status(404).json({ message: req.t('article.not_found') });

      // ——— Privacy toggle ———
      if (!req.user.isAdmin && article.userId !== req.user.id && Object.prototype.hasOwnProperty.call(req.body, 'isPrivate')) {
        return res.status(403).json({ message: req.t('unauthorized') });
      }
      const isPrivateBool = isPrivate === 'true' || isPrivate === true;
      const isPrivateChanged = typeof isPrivate !== 'undefined' && isPrivateBool !== article.isPrivate;
      let privateLink = article.privateLink;
      if (isPrivateChanged) {
        if (isPrivateBool) {
          const crypto = require('crypto');
          privateLink = crypto.randomBytes(16).toString('hex');
        } else {
          privateLink = null;
        }
      }

      // ——— Previous file refs (for cleanup decisions) ———
      const prevPreviewRel = article.preview || null;
      const prevVideoRel = article.video || null;
      const prevThumbRel = article.thumbnail || null;
      const prevOrigRel = article.originalVideo || null;
      const prevHlsDirRel = article.hlsDir || null;
      const prevHlsPlaylistRel = article.hlsPlaylist || null;

      // ——— New uploads normalized by middleware ———
      let previewPath = null;
      let uploadedVideoRel = null;

      if (req.files?.preview?.[0]) {
        previewPath = req.uploadedFiles.preview.replace('/app/public', '');
        if (process.env.NODE_ENV === 'development') {
          previewPath = `uploads/previews/${req.files.preview[0].filename}`;
        }
      }

      if (req.files?.video?.[0]) {
        uploadedVideoRel = req.uploadedFiles.video.replace('/app/public', '');
        if (process.env.NODE_ENV === 'development') {
          uploadedVideoRel = `uploads/videos/${req.files.video[0].filename}`;
        }
      }

      // ——— Determine intent (media type switch) ———
      const wantsYoutube = !!urlYoutube && !uploadedVideoRel && !previewPath; // user provided a youtube URL without uploading media
      const wantsPreview = !!previewPath && !uploadedVideoRel;                // user uploaded an image
      const wantsNewVideo = !!uploadedVideoRel;                               // user uploaded a (new) video

      // Compare tags sets (id-based)
      function sameTagSet(a = [], b = []) {
        const A = new Set(a.map(t => t.id))
        const B = new Set(b.map(t => t.id))
        if (A.size !== B.size) return false
        for (const id of A) if (!B.has(id)) return false
        return true
      }

      // What changes, except isPrivate
      const titleChanged = title !== article.title
      const descriptionChanged = description !== article.description
      const urlYoutubeChanged = (typeof urlYoutube !== 'undefined') && ((urlYoutube || null) !== (article.urlYoutube || null))
      const tagsChanged = !sameTagSet(tags, await article.getTags({ attributes: ['id'] }))


      // If isPrivate changes AND nothing else changes
      const isOnlyPrivacyChange =
        isPrivateChanged &&
        !titleChanged &&
        !descriptionChanged &&
        !urlYoutubeChanged &&
        !tagsChanged &&
        !wantsYoutube &&
        !wantsPreview &&
        !wantsNewVideo

      // Build a base update for common fields (reset validation, etc.)
      const baseUpdate = {
        title,
        description,
        isPrivate: typeof isPrivate === 'undefined' ? article.isPrivate : isPrivateBool,
        privateLink,
        // Reset validation to force a new validation cycle on content changes
        isValid: isOnlyPrivacyChange ? article.isValid : false,
        refusalReasons: JSON.stringify({
          title: { value: '', isValid: null, validatedBy: null },
          description: { value: '', isValid: null, validatedBy: null },
          videoContent: { value: '', isValid: null, validatedBy: null },
          videoFile: { value: '', isValid: null, validatedBy: null },
          preview: { value: '', isValid: null, validatedBy: null },
        }),
        overallReasonForRefusal: null,
        validatedBy: null,
        userId,
      };

      // ———————————————————————————————————————————————
      // CASE A — Switch to YOUTUBE (no new video/image upload)
      // ———————————————————————————————————————————————
      if (wantsYoutube) {
        const updatedArticle = await article.update({
          ...baseUpdate,
          urlYoutube,
          preview: null,
          video: null,
          thumbnail: null,
          originalVideo: null,
          hlsPlaylist: null,
          hlsDir: null,
          processingStatus: 'ready',
          processingProgress: 100,
          processingError: null,
        });

        // Update tags
        const tagIds = tags.map(t => t.id);
        const tagsToAssociate = await Tag.findAll({ where: { id: tagIds } });
        await updatedArticle.setTags(tagsToAssociate);

        // Cleanup previous files (both video stack and preview)
        safeUnlink(toAbs(prevPreviewRel));
        safeUnlink(toAbs(prevVideoRel));
        safeUnlink(toAbs(prevThumbRel));
        safeUnlink(toAbs(prevOrigRel));
        // remove HLS pack directory for this article if it exists
        if (article.hlsDir) {
          try { fs.rmSync(toAbs(article.hlsDir), { recursive: true, force: true }); } catch (_) {}
        }

        // Drop likes & comments because the article has been modified
        await purgeReactions(updatedArticle.id);

        if(!isOnlyPrivacyChange) {
          await notifyAdminValidation(article, lang);
        }

        return res.json({ article: updatedArticle });
      }

      // ———————————————————————————————————————————————
      // CASE B — Switch to IMAGE (new preview upload, no new video)
      // ———————————————————————————————————————————————
      if (wantsPreview) {
        const updatedArticle = await article.update({
          ...baseUpdate,
          preview: previewPath,
          urlYoutube: null,
          video: null,
          thumbnail: null,
          originalVideo: null,
          hlsPlaylist: null,
          hlsDir: null,
          processingStatus: 'ready',
          processingProgress: 100,
          processingError: null,
        });

        // Update tags
        const tagIds = tags.map(t => t.id);
        const tagsToAssociate = await Tag.findAll({ where: { id: tagIds } });
        await updatedArticle.setTags(tagsToAssociate);

        // Cleanup previous files:
        // - previous preview only if replaced by a new one
        if (prevPreviewRel && prevPreviewRel !== previewPath) safeUnlink(toAbs(prevPreviewRel));
        // - drop the whole video stack if any
        safeUnlink(toAbs(prevVideoRel));
        safeUnlink(toAbs(prevThumbRel));
        safeUnlink(toAbs(prevOrigRel));
        // remove HLS pack directory for this article if it exists
        if (article.hlsDir) {
          try { fs.rmSync(toAbs(article.hlsDir), { recursive: true, force: true }); } catch (_) {}
        }

        // Drop likes & comments because the article has been modified
        await purgeReactions(updatedArticle.id);

        if(!isOnlyPrivacyChange) {
          await notifyAdminValidation(article, lang);
        }

        return res.json({ article: updatedArticle });
      }

      // ———————————————————————————————————————————————
      // CASE C — New VIDEO uploaded (stay video type or switch from image/youtube to video)
      // ———————————————————————————————————————————————
      if (wantsNewVideo) {
        // Preflight
        let fullVideoPath = toAbs(uploadedVideoRel);
        await quickVideoPreflight(fullVideoPath);

        // Queue processing; keep old player working until success
        const updatedArticle = await article.update({
          ...baseUpdate,
          urlYoutube: null,
          preview: null,
          originalVideo: uploadedVideoRel,
          processingStatus: 'queued',
          processingProgress: 0,
          processingError: null,
        });

        // Update tags
        const tagIds = tags.map(t => t.id);
        const tagsToAssociate = await Tag.findAll({ where: { id: tagIds } });
        await updatedArticle.setTags(tagsToAssociate);

        if (prevPreviewRel) safeUnlink(toAbs(prevPreviewRel));

        // Enqueue with runType=update so the worker will cleanup old processed assets on success
        try {
          await videoQueue.add('process', { articleId: updatedArticle.id, fullVideoPath, runType: 'update', lang: lang });
        } catch (e) {
          console.error('[queue] enqueue after update failed:', e?.message || e);
          await updatedArticle.update({ processingStatus: 'failed', processingError: 'enqueue_failed' });
        }

        // Drop likes & comments because the article has been modified
        await purgeReactions(updatedArticle.id);

        return res.json({ article: updatedArticle });
      }

      // ———————————————————————————————————————————————
      // CASE D — No media change (text/privacy/tags only)
      // (Keep current media; preserve processing fields)
      // If user cleared youtube without providing another media, keep existing preview/video as-is.
      // ———————————————————————————————————————————————
      const updatedArticle = await article.update({
        ...baseUpdate,
        urlYoutube: typeof urlYoutube === 'undefined' ? article.urlYoutube : urlYoutube || null,
        preview: article.preview,
        video: article.video,
        thumbnail: article.thumbnail,
        originalVideo: article.originalVideo,
        processingStatus: article.processingStatus,
        processingProgress: article.processingProgress,
        processingError: article.processingError,
      });

      // Update tags
      {
        const tagIds = tags.map(t => t.id);
        const tagsToAssociate = await Tag.findAll({ where: { id: tagIds } });
        await updatedArticle.setTags(tagsToAssociate);
      }

      if (!isOnlyPrivacyChange) {
        await purgeReactions(updatedArticle.id);
      }

      await notifyAdminValidation(article, lang);

      return res.json({ article: updatedArticle });

    } catch (error) {
      console.error("Error updating article:", error.message);
      return res.status(500).json({ message: req.t('error') });
    }
  },
  validate: function (req, res, next) {
    const user = req.user;

    const { isValid, refusalReasons, overallReasonForRefusal, urlYoutube, preview } = req.body;

    if (typeof refusalReasons === 'string') {
      try {
        // Verify to not refuse article without reasons
        const parsedRefusalReasons = JSON.parse(refusalReasons);

        if (!parsedRefusalReasons.title.isValid && parsedRefusalReasons.title.value === '') {
          return res.status(403).json({ message: req.t('article.reason_title') });
        }
        if (!parsedRefusalReasons.description.isValid && parsedRefusalReasons.description.value === '') {
          return res.status(403).json({ message: req.t('article.reason_description') });
        }
        if (parsedRefusalReasons.preview.isValid === false && parsedRefusalReasons.preview.value === '') {
          return res.status(403).json({ message: req.t('article.reason_preview') });
        }
        if (parsedRefusalReasons.videoContent.isValid === false && parsedRefusalReasons.videoContent.value === '') {
          return res.status(403).json({ message: req.t('article.reason_youtube') });
        }
        if (!isValid && overallReasonForRefusal === '') {
          return res.status(403).json({ message: req.t('article.reason_overall') });
        }
      } catch (error) {
        console.log('error: ', error.message);
        return res.status(400).json({ message: req.t('error') });
      }
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: req.t('article.not_authorized') });
    }

    Article.findByPk(req.params.id)
      .then((article) => {
        if (!article) {
          return res.status(404).json({ message: req.t('article.not_found') });
        }

        article.update({
          isValid: isValid,
          refusalReasons: refusalReasons,
          overallReasonForRefusal: overallReasonForRefusal,
          validatedBy: user.id
        })
          .then((validatedArticle) => {
            res.json({ validatedArticle })
          })
          .catch((error) => {
            console.log("error: ", error.message);
            res.status(500).json({ message: req.t('article.error_validation') });
          });
      })
      .catch((error) => {
        console.log("error: ", error.message);
        res.status(500).json({ message: req.t('article.error_fetch') });
      });
  },
  delete: async function (req, res, next) {
    try {
      const article = await Article.findByPk(req.params.id);
      if (!article) {
        return res.status(404).json({ message: req.t('article.not_found') });
      }

      // 🔴 Gather all file paths before destroying the article
      const filesToDelete = [
        article.preview,
        article.video,
        article.thumbnail,
        article.originalVideo
      ].filter(Boolean);

      // 🔴 Delete reactions (likes/comments) if tu veux aussi nettoyer
      await Like.destroy({ where: { articleId: article.id } });
      await Comment.destroy({ where: { articleId: article.id } });

      // 🔴 Destroy the article row
      await article.destroy();

      // 🔴 Cleanup physical files
      for (const rel of filesToDelete) {
        safeUnlink(toAbs(rel));
      }

      return res.status(200).json({ message: `Article ${article.id} ${req.t('article.deleted')}.` });
    } catch (error) {
      console.error("Error deleting article:", error.message);
      return res.status(500).json({ message: req.t('error') });
    }
  }
};
