const models = require('../models');
const Article = models.Article;

module.exports = {
    index: function(req, res, next) {
        const offset = parseInt(req.query.offset) || 0; 
        const limit = parseInt(req.query.limit) || 10;
        Article.findAll({
            offset: offset,
            limit: limit,
            include: [models.User],
            })
            .then((articles) => { res.json({ articles }); })
            .catch((error) => { res.status(500).json({error}) })
    },
    show: function(req, res, next) {
        Article.findByPk(req.params.id)
        .then((article) => {
            res.json({ article });
        })
        .catch((error) => {
            console.error("Message Error fetching tracks: ", error.message);
            res.status(500).json({ error });
        });
    },
    create: function(req, res, next) {
        Article.create({
            title: req.body.title,
            description: req.body.description,
            image: req.body.image ?? null,
            urlYoutube: req.body.urlYoutube ?? null,
            userId: req.body.userId
        })
            .then((article) => { res.json({ article }); })
            .catch((error) => { res.status(500).json({error}) })
    },
    update: function (req, res, next) {
        const user = req.user; // user signed with JWT
    
        Article.findByPk(req.params.id)
            .then((article) => {
                if (!article) {
                    return res.status(404).json({ error: "Article not found" });
                }
    
                // user is creator
                if (article.userId === user.id) {
                    if (req.body.valid !== undefined || req.body.validatedBy !== undefined) {
                        return res.status(403).json({ error: "You cannot validate your own article" });
                    }
    
                    // update fields by creator
                    article.update({
                        title: req.body.title || article.title,
                        description: req.body.description || article.description,
                        image: req.body.image || article.image,
                        urlYoutube: req.body.urlYoutube || article.urlYoutube,
                    })
                        .then((updatedArticle) => {
                            res.json({ updatedArticle });
                        })
                        .catch((error) => {
                            console.error(error);
                            res.status(500).json({ error: "An error occurred while updating the article" });
                        });
                }
                // User is admin
                else if (user.isAdmin) {
                    article.update({
                        valid: true,
                        validatedBy: user.id,
                    })
                        .then((validatedArticle) => {
                            res.json({ validatedArticle });
                        })
                        .catch((error) => {
                            console.error(error);
                            res.status(500).json({ error: "An error occurred while validating the article" });
                        });
                }
                else {
                    return res.status(403).json({ error: "You are not authorized to update this article" });
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).json({ error: "An error occurred while fetching the article" });
            });
    },
    
    delete: function(req, res, next) {
        Article.findByPk(req.params.id)
            .then((article) => { 
                article.destroy()
                res.status(200).json(`Article ${article.id} supprimé`); 
            })
            .catch((error) => { res.status(500).json({error}) })
    }
}