const models = require('../models');
const Article = models.Article;

module.exports = {
  index: function (req, res, next) {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 10;
    Article.findAll({
      offset: offset,
      limit: limit,
      include: [
        {
          model: models.Like,
          as: 'likes',
          include: [
            {
              model: models.User,
              as: 'user',
              attributes: ['id', 'name', 'email'],
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
              attributes: ['id', 'name', 'email'],
            }
          ]
        },
      ]
    })
      .then((articles) => { res.json({ articles }); })
      .catch((error) => {
        console.log("error : ", error)
        res.status(500).json({ error })
      })
  },
  show: function (req, res, next) {
    Article.findByPk(req.params.id, {
      include: [
        {
          model: models.Like,
          as: 'likes',
          include: [
            {
              model: models.User,
              as: 'user',
              attributes: ['id', 'name', 'email'],
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
              attributes: ['id', 'name', 'email'],
            }
          ]
        },
      ]
    })
      .then((article) => {
        res.json({ article });
      })
      .catch((error) => {
        console.error("Message Error fetching tracks: ", error.message);
        res.status(500).json({ error });
      });
  },
  create: function (req, res, next) {
    const { title, description, urlYoutube, tags } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    if (title.length < 3) {
      return res.status(400).json({ error: "Title must be at least 3 characters long" });
    }
    
    if (typeof tags === 'string') {
      try {
        req.body.tags = JSON.parse(tags);
      } catch (error) {
        return res.status(400).json({ error: "Invalid tags format" });
      }
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: "At least one tag is required" });
    }

    const userId = req.user.id;
    const imagePath = req.file ? req.file.path : null;

    if (!userId) {
      return res.status(400).json({ error: "UserId is required" });
    }

    Article.create({
      title: title,
      description: description,
      preview: imagePath,
      urlYoutube: urlYoutube || null,
      userId: userId,
    })
      .then((article) => {
        if (tags && Array.isArray(tags)) {
          const tagIds = tags.map((tag) => tag.id);
          return models.Tag.findAll({ where: { id: tagIds } })
            .then((tagsToAssociate) => {
              return article.setTags(tagsToAssociate);
            })
            .then(() => {
              res.json({ article });
            });
        }
      })
      .catch((error) => {
        console.error("Error creating article:", error);
        res.status(500).json({ error });
      });
  },
  like: function (req, res, next) {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
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
              attributes: ['id', 'name', 'email'],
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
              attributes: ['id', 'name', 'email'],
            }
          ]
        },
      ]
    })
      .then((article) => {
        if (!article) {
          return res.status(404).json({ error: "Article not found" });
        }

        models.Like.findOne({
          where: { userId: user.id, articleId: req.params.id }
        })
          .then((existingLike) => {
            if (existingLike) {
              return models.Like.destroy({ where: { userId: user.id, articleId: req.params.id } })
                .then(() => res.status(200).json({ message: "Article unliked", isLiked: false }))
                .catch((error) => res.status(500).json({ error: "Error while unliking article" }));
            } else {
              models.Like.create({ userId: user.id, articleId: req.params.id })
                .then(() => res.status(200).json({ message: "Article liked", isLiked: true }))
                .catch((error) => res.status(500).json({ error: "Error while liking article", 'error: ': error }));
            }
          })
          .catch((error) => res.status(500).json({ error: "Error checking like status", 'error: ': error }));
      })
      .catch((error) => res.status(500).json({ error: "Error fetching article", 'error: ': error }));
  },
  update: function (req, res, next) {
    const { title, description, urlYoutube, tags } = req.body;

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: "At least one tag is required" });
    }

    Article.findByPk(req.params.id)
      .then((article) => {
        if (!article) {
          return res.status(404).json({ error: "Article not found" });
        }

        return article.update({
          title: title || article.title,
          description: description || article.description,
          urlYoutube: urlYoutube || article.urlYoutube,
        })
          .then((updatedArticle) => {
            if (tags && Array.isArray(tags)) {
              const tagIds = tags.map((tag) => tag.id);
              return Tag.findAll({ where: { id: tagIds } })
                .then((tagsToAssociate) => {
                  return updatedArticle.setTags(tagsToAssociate);
                })
                .then(() => {
                  res.json({ updatedArticle });
                });
            }
          });
      })
      .catch((error) => {
        console.error("Error updating article:", error);
        res.status(500).json({ error });
      });
  },
  validate: function (req, res, next) {
    const user = req.user;

    if (!user.isAdmin) {
      return res.status(403).json({ error: "You are not authorized to validate this article" });
    }

    Article.findByPk(req.params.id)
      .then((article) => {
        if (!article) {
          return res.status(404).json({ error: "Article not found" });
        }

        article.update({ isValid: true, validatedBy: user.id })
          .then((validatedArticle) => res.json({ validatedArticle }))
          .catch((error) => res.status(500).json({ error: "Error validating article" }));
      })
      .catch((error) => res.status(500).json({ error: "Error fetching article" }));
  },
  delete: function (req, res, next) {
    Article.findByPk(req.params.id)
      .then((article) => {
        article.destroy();
        res.status(200).json(`Article ${article.id} deleted`);
      })
      .catch((error) => res.status(500).json({ error }));
  }
};
