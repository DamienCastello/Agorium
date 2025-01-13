const models = require('../models');
const Comment = models.Comment;

module.exports = {
    create: function (req, res, next) {
        const { content, articleId } = req.body;
        const userId = req.user.id;

        Comment.create({
            content,
            articleId,
            userId
        })
            .then((comment) => {
                // Vérify & unloack simple game success
                Comment.count({ where: { userId } })
                    .then((commentCount) => {
                        (async () => {
                            try {
                                const user = await models.User.findByPk(userId);
                                if (commentCount === 1) {
                                    // (unique)
                                    const achievement = await models.Achievement.findByPk(1);
                                    await achievement.addUsers(user);
                                    res.status(200).json({ comment, achievement });

                                } else if (commentCount % 10 === 0) {
                                    // (reusable)
                                    const achievement = await models.Achievement.findByPk(2);
                                    await achievement.addUsers(user);
                                    res.status(200).json({ comment, achievement });
                                }
                                res.status(200).json({ comment });
                            } catch (error) {
                                console.error(error);
                            }
                        })()
                    })


            })
            .catch((error) => {
                console.error(error);
                res.status(500).json({ message: 'Internal server error.' });
            })
    },
    update: function (req, res, next) {
        const { content, articleId } = req.body;
        const userId = req.user.id;

        Comment.findByPk(req.body.id)
            .then((comment) => {
                comment.update({
                    content: content,
                    articleId: articleId,
                    userId: userId
                })
                    .then((updatedComment) => { res.json({ updatedComment }); })
                    .catch((error) => {
                        console.error('error: ', error.message);
                        res.status(500).json({ message: 'An error occurred while updating the report.' });
                    })
            })
            .catch((error) => {
                console.error('error: ', error.message);
                res.status(500).json({ message: 'Internal server error.' });
            })


    },
    delete: function (req, res, next) {
        Comment.findByPk(req.body.id)
            .then((comment) => {
                comment.destroy()
                res.status(200).json(`Comment ${comment.id} deleted.`);
            })
            .catch((error) => {
                console.error('error: ', error.message);
                res.status(500).json({ message: 'Internal server error.' });
            })
    }
}