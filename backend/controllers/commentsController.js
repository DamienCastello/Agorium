const { where } = require('sequelize');
const models = require('../models');
const Comment = models.Comment;

module.exports = {
    index: function (req, res, next) {
        const { articleId } = req.body;
        Comment.findAll({
            where: { articleId },
            include: [
                {
                    model: models.Like,
                    as: 'likes',
                    attributes: ['id', 'userId', 'commentId', 'articleId', 'createdAt', 'updatedAt'],
                    include: [
                        {
                            model: models.User,
                            as: 'user',
                            attributes: ['id', 'name', 'email'],
                        }
                    ]
                }
            ]
        })
            .then((comments) => { res.json({ comments }); })
            .catch((error) => {
                console.log("error: ", error)
                res.status(500).json({ message: req.t('error') })
            })
    },
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
                                    const achievement = await models.Achievement.findByPk(6);
                                    await achievement.addUsers(user);
                                    user.points += achievement.points;
                                    await user.save();
                                    res.status(200).json({ comment, achievement });
                                } else if (commentCount % 10 === 0) {
                                    // (reusable)
                                    const achievement = await models.Achievement.findByPk(7);

                                    const [userAchievement, created] = await models.UserAchievement.findOrCreate({
                                        where: { userId, achievementId: achievement.id },
                                        defaults: {
                                            dateEarned: new Date(),
                                            iteration: 1,
                                        },
                                    });

                                    if (!created) {
                                        // If entry exists, increment iteration
                                        userAchievement.iteration += 1;
                                        userAchievement.dateEarned = new Date();
                                        await userAchievement.save();
                                    }

                                    user.points += achievement.points;
                                    await user.save();

                                    res.status(200).json({ comment, achievement, userAchievement, user });
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
                res.status(500).json({ message: req.t('error') });
            })
    },
    like: function (req, res, next) {
        const { userId, commentId } = req.body;
      
        // Vérifiez que les informations nécessaires sont présentes
        if (!userId) {
          return res.status(401).json({ message: req.t('comment.not_authenticated') });
        }
      
        // Chargez l'utilisateur depuis Sequelize
        models.User.findByPk(userId)
          .then((user) => {
            if (!user) {
              return res.status(404).json({ message: req.t("comment.user_not_found") });
            }
      
            // Trouvez le commentaire associé
            Comment.findByPk(commentId, {
              include: [
                {
                  model: models.Like,
                  as: "likes",
                  attributes: ["id", "userId", "commentId", "createdAt", "updatedAt"],
                },
              ],
            })
              .then((comment) => {
                if (!comment) {
                  return res.status(404).json({ message: req.t('comment.not_found') });
                }
      
                // Vérifiez si l'utilisateur a déjà liké ce commentaire
                models.Like.findOne({
                  where: { userId: user.id, commentId },
                })
                  .then((existingLike) => {
                    if (existingLike) {
                      // Si un like existe, le supprimer
                      return models.Like.destroy({ where: { userId: user.id, commentId } })
                        .then(() => {
                          return res.status(200).json({ message: "Comment unliked", isLiked: false });
                        })
                        .catch((error) => {
                          console.error("Error while unliking comment:", error.message);
                          return res.status(500).json({ message: req.t('comment.error_unliking') });
                        });
                    } else {
                      // Si aucun like n'existe, en créer un
                      models.Like.create({ userId: user.id, commentId })
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
                                // Si une entrée existe, incrémentez l'itération
                                userAchievement.iteration += 1;
                                await userAchievement.save();
                              }
      
                              // Ajoutez les points à l'utilisateur
                              user.points += achievement.points;
                              await user.save();
      
                              // Envoyer une réponse unique
                              return res.status(200).json({
                                message: "Comment liked",
                                isLiked: true,
                                achievement,
                                userAchievement,
                                user,
                              });
                            } catch (error) {
                              console.error("Error processing achievement:", error.message);
                              return res.status(500).json({ message: req.t('comment.error_achievements') });
                            }
                          })();
                        })
                        .catch((error) => {
                          console.error("Error while liking comment:", error.message);
                          return res.status(500).json({ message: req.t('comment.error_liking') });
                        });
                    }
                  })
                  .catch((error) => {
                    console.error("Error checking like status:", error.message);
                    return res.status(500).json({ message: req.t('comment.error_likes') });
                  });
              })
              .catch((error) => {
                console.error("Error fetching comment:", error.message);
                return res.status(500).json({ message: req.t('comment.error_fetch') });
              });
          })
          .catch((error) => {
            console.error("Error fetching user:", error.message);
            return res.status(500).json({ message: req.t('comment.error_user') });
          });
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
                        res.status(500).json({ message: req.t('comment.error_update') });
                    })
            })
            .catch((error) => {
                console.error('error: ', error.message);
                res.status(500).json({ message: req.t('error') });
            })


    },
      report: function (req, res, next) {
        const { commentId, reason, details, userId } = req.body;
    
        Comment.findByPk(req.params.id)
          .then((comment) => {
            if (!comment) {
              return res.status(404).json({ message: req.t('comment.not_found') });
            }
            
            // Maybe invalid comment ?

            models.Report.create({
              commentId: commentId,
              userId: userId,
              reason: reason,
              details: details,
            })
              .then(() => res.status(200).json({ message: req.t('comment.reported') }))
              .catch((error) => {
                console.error("Error reporting comment:", error.message);
                res.status(500).json({ message: req.t('error') });
              })
          })
          .catch((error) => {
            console.error("Error fetching comment:", error.message);
            res.status(500).json({ message: req.t('error') });
          });
      },
    delete: function (req, res, next) {
        Comment.findByPk(req.body.id)
            .then((comment) => {
                comment.destroy()
                res.status(200).json(`${req.t('comment.subject_delete')} ${comment.id} ${req.t('comment.deleted')}.`);
            })
            .catch((error) => {
                console.error('error: ', error.message);
                res.status(500).json({ message: req.t('error') });
            })
    }
}