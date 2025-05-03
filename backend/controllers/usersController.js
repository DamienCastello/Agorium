const models = require('../models');
const User = models.User;
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

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
    update: async function (req, res, next) {
        const newAvatarPath = req.uploadedFiles ? req.uploadedFiles.avatars : null;
    
        try {
            const user = await models.User.findByPk(req.params.id);
            if (!user) {
                return res.status(404).json({ message: req.t('user.not_found') });
            }
    
            // Supprimer l'ancien avatar s'il existe
            const oldAvatarPath = user.avatar;
            if (newAvatarPath && user.avatar && !user.avatar.includes('utilisateur.png')) {
                const oldFullAvatarPath = process.env.NODE_ENV === 'development'
                    ? path.resolve(oldAvatarPath)
                    : path.join('/app/public', oldAvatarPath);
                if (fs.existsSync(oldFullAvatarPath)) {
                    fs.unlinkSync(oldFullAvatarPath);
                }
            }
    
            const updateData = {};
    
            if (req.body.pseudo) {
                updateData.pseudo = req.body.pseudo;
            }
    
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(req.body.password, salt);
                updateData.password = hashedPassword;
            }
    
            if (newAvatarPath) {
                updateData.avatar = newAvatarPath;
            }
    
            const updatedUser = await user.update(updateData);
            res.status(200).json({ updatedUser, message: newAvatarPath ? req.t('user.avatar') : req.t('user.updated') });
    
        } catch (error) {
            console.log('error:', error.message);
            res.status(500).json({ message: req.t('user.error_label') });
        }
    },
    delete: async function (req, res, next) {
        try {
          const user = await User.findByPk(req.params.id);
          if (!user) {
            return res.status(404).json({ message: req.t('user_not_found') });
          }
      
          // Supprimer l'avatar s'il n'est pas par défaut
          const oldAvatarPath = user.avatar;
          if (user.avatar && !user.avatar.includes('utilisateur.png')) {
            const oldFullAvatarPath =
              process.env.NODE_ENV === 'development'
                ? path.resolve(oldAvatarPath)
                : path.join('/app/public', oldAvatarPath);
      
            if (fs.existsSync(oldFullAvatarPath)) {
              fs.unlinkSync(oldFullAvatarPath);
            }
          }
      
          await user.destroy(); // 👈 Attendre la suppression
      
          return res.status(200).json({ message: req.t('user.deleted') });
        } catch (error) {
          console.error('error:', error.message);
          return res.status(500).json({ message: req.t('error') });
        }
      }
}