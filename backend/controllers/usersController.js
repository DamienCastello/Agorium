const models = require('../models');
const User = models.User;

module.exports = {
    index: function (req, res, next) {
        User.findAll({ include: models.Article })
            .then((users) => { res.json({ users }); })
            .catch((error) => {
                console.log('error: ', error.message);
                res.status(500).json({ message: req.t('error') });
            })
    },
    show: function (req, res, next) {
        User.findByPk(req.params.id, {
            include: [
                {
                    model: models.Achievement,
                    as: 'achievements'
                }
            ]
        })
            .then((user) => { res.json({ user }); })
            .catch((error) => {
                console.log('error: ', error.message);
                res.status(500).json({ message: req.t('error') });
            })
    },
    create: function (req, res, next) {
        User.create({
            name: req.params.name,
            password: req.params.password,
            email: req.params.email,
            isAdmin: false,
            avatar: req.params.avatar
        })
            .then((user) => { res.json({ user }); })
            .catch((error) => {
                console.log('error: ', error.message);
                res.status(500).json({ message: req.t('error') });
            })
    },
    update: function (req, res, next) {
        const avatarPath = req.file ? req.file.path : null;

        User.findByPk(req.params.id)
            .then((user) => {
                user.update({
                    name: req.params.name,
                    avatar: avatarPath
                })
                .then((updatedUser) => { res.json({ updatedUser }); })
                .catch((error) => {
                    console.log('error: ', error.message);
                    res.status(500).json({ message: req.t('user.error_label') });
                })
            })
            .catch((error) => {
                console.log('error: ', error.message);
                res.status(500).json({ message: req.t('error') });
            })
    },
    delete: function (req, res, next) {
        User.findByPk(req.params.id)
            .then((user) => { user.destroy() })
            .catch((error) => {
                console.log('error: ', error.message);
                res.status(500).json({ message: req.t('error') });
            })
    }
}