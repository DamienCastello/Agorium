const models = require('../models');
const { Op, Sequelize } = require('sequelize');
const path = require('path');
const { Article, User, Like, Tag, Comment } = require('../models');

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
    try {
      const { title, description, urlYoutube, tags, isPrivate } = req.body;

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

      let privateLink = null;
      let previewPath = null;
      let videoPath = null;

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
      }


      if (!userId) {
        return res.status(400).json({ message: req.t('article.user_required') });
      }

      // Création de l'article
      const article = await Article.create({
        title,
        description,
        preview: previewPath,
        video: videoPath,
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
      });

      if (videoPath) {
        const {
          isExecutableFile,
          analyzeVideo,
          extractFrameFromVideo,
          scanForNSFW
        } = require('../services/video');

        const oldVideoPath = article.video;
        const oldThumbnailPath = article.thumbnail;
        let fullVideoPath = null;

        fullVideoPath = path.join('/app/public', videoPath);
        if (process.env.NODE_ENV === 'development') {
          fullVideoPath = path.resolve(videoPath);
        }

        await isExecutableFile(fullVideoPath);
        await analyzeVideo(fullVideoPath);

        const fs = require('fs');
        const { v4: uuidv4 } = require('uuid');
        const { getUploadPath } = require('../utils/getUploadPath');

        const thumbnailName = `thumbnail-${uuidv4()}.jpg`;
        const { fullPath: thumbnailFullPath, dbPath: thumbnailDbPath } = getUploadPath('thumbnails', thumbnailName);

        if (!fs.existsSync(path.dirname(thumbnailFullPath))) {
          fs.mkdirSync(path.dirname(thumbnailFullPath), { recursive: true });
        }

        await extractFrameFromVideo(fullVideoPath, thumbnailFullPath);
        await scanForNSFW(thumbnailFullPath);

        // Mise à jour du chemin relatif dans la base
        await article.update({ thumbnail: thumbnailDbPath });
      }

      if (tags && Array.isArray(tags)) {
        const tagIds = tags.map((tag) => tag.id);
        const tagsToAssociate = await models.Tag.findAll({ where: { id: tagIds } });

        await article.setTags(tagsToAssociate);

        // Vérifier le nombre d'articles pour débloquer des succès
        const articleCount = await Article.count({ where: { userId } });
        const user = await models.User.findByPk(userId);

        let achievement;
        let userAchievement;

        if (articleCount === 1) {
          achievement = await models.Achievement.findByPk(1);
          await achievement.addUsers(user);
          user.points += achievement.points;
          await user.save();
        } else if (articleCount === 5) {
          achievement = await models.Achievement.findByPk(2);
          await achievement.addUsers(user);
          user.points += achievement.points;
          await user.save();
        } else if (articleCount % 20 === 0) {
          achievement = await models.Achievement.findByPk(3);

          [userAchievement, created] = await models.UserAchievement.findOrCreate({
            where: { userId, achievementId: achievement.id },
            defaults: {
              dateEarned: new Date(),
              iteration: 1,
            },
          });

          if (!created) {
            userAchievement.iteration += 1;
            userAchievement.dateEarned = new Date();
            await userAchievement.save();
          }

          user.points += achievement.points;
          await user.save();
        }

        return res.status(200).json({ article, achievement, userAchievement, user });
      }

    } catch (error) {
      console.error("Error creating article: ", error.message);
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
      const { title, description, urlYoutube, tags: rawTags, isPrivate } = req.body;

      if (!title || !description) {
        return res.status(400).json({ message: req.t('article.fields_required') });
      }

      if (title.length < 3) {
        return res.status(400).json({ message: req.t('article.title_length') });
      }

      let tags = rawTags;
      if (typeof tags === 'string') {
        try {
          tags = JSON.parse(tags);
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

      const article = await Article.findByPk(req.params.id);
      if (!article) {
        return res.status(404).json({ message: req.t('article.not_found') });
      }

      if (!req.user.isAdmin && article.userId !== req.user.id && req.body.hasOwnProperty('isPrivate')) {
        return res.status(403).json({ message: req.t('unauthorized') });
      }

      const isPrivateBool = isPrivate === 'true' || isPrivate === true;
      const isPrivateChanged = isPrivateBool !== article.isPrivate;

      let privateLink = article.privateLink;
      
      if (isPrivateChanged) {
        if (isPrivateBool === true) {
          const crypto = require('crypto');
          privateLink = crypto.randomBytes(16).toString('hex');
        } else {
          privateLink = null;
        }
      }

      const oldVideoPath = article.video;
      const oldThumbnailPath = article.thumbnail;
      const oldPreviewPath = article.preview;

      let previewPath = null;
      let videoPath = null;

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
      }

      let thumbnailPath = article.thumbnail;

      const updatedArticle = await article.update({
        title,
        description,
        preview: previewPath || article.preview,
        video: videoPath || article.video,
        thumbnail: thumbnailPath,
        urlYoutube: urlYoutube || article.urlYoutube,
        refusalReasons: JSON.stringify({
          title: { value: '', isValid: null, validatedBy: null },
          description: { value: '', isValid: null, validatedBy: null },
          videoContent: { value: '', isValid: null, validatedBy: null },
          videoFile: { value: '', isValid: null, validatedBy: null },
          preview: { value: '', isValid: null, validatedBy: null },
        }),
        overallReasonForRefusal: null,
        isValid: article.isValid,
        userId,
        isPrivate,
        privateLink
      });

      if (tags && Array.isArray(tags)) {
        const tagIds = tags.map(tag => tag.id);
        const tagsToAssociate = await Tag.findAll({ where: { id: tagIds } });
        await updatedArticle.setTags(tagsToAssociate);
      }

      const fs = require('fs');
      const path = require('path');

      // Suppression de l'ancien preview si un nouveau preview a été uploadé
      if (previewPath && oldPreviewPath) {
        const oldFullPreviewPath = process.env.NODE_ENV === 'development'
          ? path.resolve(oldPreviewPath)
          : path.join('/app/public', oldPreviewPath);
        if (fs.existsSync(oldFullPreviewPath)) {
          fs.unlinkSync(oldFullPreviewPath);
        }
      }

      if (req.files?.video?.[0]) {
        const {
          isExecutableFile,
          analyzeVideo,
          extractFrameFromVideo,
          scanForNSFW
        } = require('../services/video');

        let fullVideoPath = path.join('/app/public', videoPath);
        if (process.env.NODE_ENV === 'development') {
          fullVideoPath = path.resolve(videoPath);
        }

        await isExecutableFile(fullVideoPath);
        await analyzeVideo(fullVideoPath);

        const { getUploadPath } = require('../utils/getUploadPath');
        const { v4: uuidv4 } = require('uuid');
        const thumbnailName = `thumbnail-${uuidv4()}.jpg`;
        const { fullPath: thumbnailFullPath, dbPath: thumbnailDbPath } = getUploadPath('thumbnails', thumbnailName);

        if (!fs.existsSync(path.dirname(thumbnailFullPath))) {
          fs.mkdirSync(path.dirname(thumbnailFullPath), { recursive: true });
        }

        await extractFrameFromVideo(fullVideoPath, thumbnailFullPath);
        await scanForNSFW(thumbnailFullPath);

        if (oldVideoPath) {
          const oldFullVideoPath = process.env.NODE_ENV === 'development'
            ? path.resolve(oldVideoPath)
            : path.join('/app/public', oldVideoPath);
          if (fs.existsSync(oldFullVideoPath)) {
            fs.unlinkSync(oldFullVideoPath);
          }
        }

        if (oldThumbnailPath) {
          const oldFullThumbnailPath = process.env.NODE_ENV === 'development'
            ? path.resolve(oldThumbnailPath)
            : path.join('/app/public', oldThumbnailPath);
          if (fs.existsSync(oldFullThumbnailPath)) {
            fs.unlinkSync(oldFullThumbnailPath);
          }
        }

        await article.update({
          video: videoPath,
          thumbnail: thumbnailDbPath
        });
      }

      return res.json({ updatedArticle });
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
  delete: function (req, res, next) {
    Article.findByPk(req.params.id)
      .then((article) => {
        article.destroy();
        res.status(200).json(`Article ${article.id} ${req.t('article.deleted')}.`);
      })
      .catch((error) => {
        console.log("error: ", error.message);
        res.status(500).json({ message: req.t('error') });
      });
  }
};
