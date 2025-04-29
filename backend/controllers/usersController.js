const models = require('../models');
const User = models.User;
const fs = require('fs');
const path = require('path');

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
        const param = req.params.id;

        const isNumericId = /^\d+$/.test(param);

        if (isNumericId) {
            User.findByPk(req.params.id, {
                include: [
                    {
                        model: models.Achievement,
                        as: 'achievements'
                    }
                ]
            })
            .then((user) => { res.status(200).json({ user }) })
            .catch((error) => {
                console.log('error: ', error.message);
                res.status(500).json({ message: req.t('error') });
            })
        } else {
            User.findOne({
                where: { pseudo: param },
                include: ['achievements']
              })
            .then((user) => { res.status(200).json({ user }) })
            .catch((error) => {
                console.log('error: ', error.message);
                res.status(500).json({ message: req.t('error') });
            })
        }
    },
    create: function (req, res, next) {
        const avatarPath = req.uploadedFiles ? req.uploadedFiles.avatars : null;

        // Vérifie que l'avatar est bien défini et modifie son path pour être relatif
        const avatar = avatarPath ? avatarPath.replace('/app/public', '') : null;

        User.create({
            pseudo: req.params.pseudo,
            password: req.params.password,
            email: req.params.email,
            isAdmin: false,
            avatar: avatar
        })
            .then((user) => { res.json({ user }); })
            .catch((error) => {
                console.log('error: ', error.message);
                res.status(500).json({ message: req.t('error') });
            })
    },
    update: function (req, res, next) {
        const newAvatarPath = req.uploadedFiles ? req.uploadedFiles.avatars : null;
    
        models.User.findByPk(req.params.id)
            .then((user) => {
                if (!user) {
                    return res.status(404).json({ message: req.t('user.not_found') });
                }
    
                // Si un nouvel avatar est fourni et que l'ancien n'est pas celui par défaut
                if (newAvatarPath && user.avatar && !user.avatar.includes('utilisateur.png')) {
                    const oldAvatarPath = path.join('/app/public', user.avatar);
                    fs.unlink(oldAvatarPath, (err) => {
                        if (err && err.code !== 'ENOENT') {
                            console.warn('Could not delete old avatar:', err.message);
                        }
                    });                    
                }

                // Construire les données à mettre à jour
                const updateData = {};
                if (req.params.pseudo) updateData.pseudo = req.params.pseudo;
                if (newAvatarPath) updateData.avatar = newAvatarPath;
    
                return user.update(updateData);
            })
            .then((updatedUser) => {
                res.json({ updatedUser });
            })
            .catch((error) => {
                console.log('error:', error.message);
                res.status(500).json({ message: req.t('user.error_label') });
            });
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