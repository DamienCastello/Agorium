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
        console.log("error: ", error)
        res.status(500).json({ message: 'Internal server error.' })
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
        res.status(500).json({ message: 'Internal server error.' });
      });
  },
  create: function (req, res, next) {
    const { title, description, urlYoutube, tags } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required." });
    }

    if (title.length < 3) {
      return res.status(400).json({ message: "Title must be at least 3 characters long." });
    }
    
    if (typeof tags === 'string') {
      try {
        req.body.tags = JSON.parse(tags);
      } catch (error) {
        return res.status(400).json({ message: "Invalid tags format." });
      }
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ message: "At least one tag is required." });
    }

    const userId = req.user.id;
    const imagePath = req.file ? req.file.path : null;

    if (!userId) {
      return res.status(400).json({ message: "UserId is required." });
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
        console.error("Error creating article: ", error.message);
        res.status(500).json({ message: 'Internal server error.' });
      });
  },
  like: function (req, res, next) {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "User not authenticated." });
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
          return res.status(404).json({ message: "Article not found." });
        }

        models.Like.findOne({
          where: { userId: user.id, articleId: req.params.id }
        })
          .then((existingLike) => {
            if (existingLike) {
              return models.Like.destroy({ where: { userId: user.id, articleId: req.params.id } })
                .then(() => res.status(200).json({ message: "Article unliked", isLiked: false }))
                .catch((error) => {
                  console.log("error: ", error.message);
                  res.status(500).json({ message: "Error while unliking article." });
                });
            } else {
              models.Like.create({ userId: user.id, articleId: req.params.id })
                .then(() => {
                  console.log("error: ", error.message);
                  res.status(200).json({ message: "Article liked", isLiked: true });
                })
                .catch((error) => res.status(500).json({ message: "Error while liking article." }));
            }
          })
          .catch((error) => {
            console.log("error: ", error.message);
            res.status(500).json({ message: "Error checking like status."});
          });
      })
      .catch((error) => {
        console.log("error: ", error.message);
        res.status(500).json({ message: "Error fetching article." })
      });
  },
  update: function (req, res, next) {
    const { title, description, urlYoutube, tags } = req.body;

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ message: "At least one tag is required." });
    }

    Article.findByPk(req.params.id)
      .then((article) => {
        if (!article) {
          return res.status(404).json({ message: "Article not found." });
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
        console.error("Error updating article:", error.message);
        res.status(500).json({ message: 'Internal server error.' });
      });
  },
  validate: function (req, res, next) {
    const user = req.user;

    const { isValid, refusalReasons, overallReasonForRefusal, urlYoutube, preview } = req.body;

    if (typeof refusalReasons === 'string') {
      try {
        // Verify to not refuse article without reasons
        const parsedRefusalReasons = JSON.parse(refusalReasons);
    
        if(!parsedRefusalReasons.title.isValid && parsedRefusalReasons.title.value === '') {
          return res.status(403).json({ message: 'Title refusal reason must have a value.' });
        }
        if(!parsedRefusalReasons.description.isValid && parsedRefusalReasons.description.value === '') {
          return res.status(403).json({ message: 'Description refusal reason must have a value.' });
        }
        if(parsedRefusalReasons.preview.isValid === false && parsedRefusalReasons.preview.value === '') {
          return res.status(403).json({ message: 'Preview refusal reason must have a value.' });
        }
        if(parsedRefusalReasons.videoContent.isValid === false && parsedRefusalReasons.videoContent.value === '') {
          return res.status(403).json({ message: 'Youtube vidéo content refusal reason must have a value.' });
        }
        if(!isValid && overallReasonForRefusal === '') {
          return res.status(403).json({ message: 'Article overall refusal reason must have a value.' });
        }
      } catch (error) {
        console.log('error: ', error.message);
        return res.status(400).json({ message: "Internal error server." });
      }
    }
    
    if (!user.isAdmin) {
      return res.status(403).json({ message: "You are not authorized to validate this article." });
    }

    Article.findByPk(req.params.id)
      .then((article) => {
        if (!article) {
          return res.status(404).json({ message: "Article not found." });
        }

        article.update({ 
          isValid: isValid, 
          refusalReasons: refusalReasons, 
          overallReasonForRefusal: overallReasonForRefusal, 
          validatedBy: user.id 
        })
          .then((validatedArticle) => {
            console.log("error: ", error.message);
            res.json({ validatedArticle })
          })
          .catch((error) => {
            console.log("error: ", error.message);
            res.status(500).json({ message: "Error validating article." });
          });
      })
      .catch((error) => {
        console.log("error: ", error.message);
        res.status(500).json({ message: "Error fetching article." });
      });
  },
  delete: function (req, res, next) {
    Article.findByPk(req.params.id)
      .then((article) => {
        article.destroy();
        res.status(200).json(`Article ${article.id} deleted.`);
      })
      .catch((error) => {
        console.log("error: ", error.message);
        res.status(500).json({ message: 'Internal server error.' });
      });
  }
};
