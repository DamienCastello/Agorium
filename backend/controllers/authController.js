const jwt = require('jsonwebtoken');
const User = require('../models').User;
const bcrypt = require('bcrypt');
const i18n = require('../config/i18n-config');
require('dotenv').config({ path: '/app/../.env' });

const secretKey = process.env.JWT_SECRET;

//////////////////////////////
// WORK IN PROGRESS ON LOGIN
//////////////////////////////
module.exports = {
    signIn: async function (req, res, next) {
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({ message: req.t('auth.error_fields_required') });
        }
    
        try {
            const user = await User.findOne({ where: { email: req.body.email } });
            if (!user) {
                return res.status(404).json({ message: req.t('auth.login.not_found') });
            }
    
            const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ success: false, message: req.t('auth.login.error_field_password') });
            }
    
            const userData = {
                id: user.id,
                email: user.email,
                pseudo: user.pseudo,
                avatar: user.avatar,
                isAdmin: user.isAdmin,
            };
    
            const token = jwt.sign(userData, secretKey, { expiresIn: '1d' });
            return res.json({ user: userData, token });
        } catch (error) {
            console.error(req.t('auth.login.error_label'), error);
            return res.status(500).json({ message: req.t('error') });
        }
    },
    signUp: async function (req, res, next) {
        console.log("bodyyy" , req)
        if (!req.body.email || !req.body.password || !req.body.pseudo) {
            return res.status(400).json({ message: req.t('auth.error_fields_required') });
        }
    
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(403).json({ message: req.t('auth.signup.password_mismatch') });
        }
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
            return res.status(400).json({ message: req.t('auth.signup.error_email_format') });
        }
    
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
            const newUser = await User.create({
                email: req.body.email,
                password: hashedPassword,
                pseudo: req.body.pseudo,
                avatar: req.uploadedFiles ? req.uploadedFiles.avatars : null,
                isAdmin: false
            });
    
            const userData = {
                id: newUser.id,
                email: newUser.email,
                pseudo: newUser.pseudo,
                avatar: newUser.avatar,
                isAdmin: newUser.isAdmin,
            };
    
            const token = jwt.sign(userData, secretKey, { expiresIn: '1d' });
            return res.status(200).json({ user: userData, token });
        } catch (error) {
            console.error(req.t('auth.signup.error_label'), error.message);
            return res.status(500).json({ message: req.t('error')});
        }
    }



    //not incorporate yet
    /*
    deleteAccount: function (req, res, next) {
        User.findOne({ where: { email: req.body.email } })
            .then((user) => {
                if (user) {
                    user.destroy()
                        .then((deletedUser) => { res.json({ user: deletedUser }); })
                        .catch((error) => { res.status(500).json({ error }); });
                } else {
                    res.status(404).json({ message: 'User not found' });
                }
            })
            .catch((error) => { res.status(500).json({ error }); });
    },
    changePassword: function (req, res, next) {
        User.findOne({ where: { email: req.body.email } })
            .then((user) => {
                if (user) {
                    bcrypt.compare(req.body.oldPassword, user.dataValues.password, function (err, result) {
                        if (result) {
                            user.update({ password: req.body.password })
                                .then((updatedUser) => { res.json({ user: updatedUser }); })
                                .catch((error) => { res.status(500).json({ error }); });
                        } else {
                            res.status(401).json({ message: 'Invalid password' });
                        }
                    });
                } else {
                    res.status(404).json({ message: 'User not found' });
                }
            })
            .catch((error) => { res.status(500).json({ error }); });
    },
    forgetPassword: function (req, res, next) {
        const generatePassword = () => {
            let char = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
            let password = '';
            for (let i = 0; i < 10; i++) {
                const randomChar = char[Math.floor(Math.random() * char.length)];
                password += randomChar;
            }
            return password;
        };

        //Verify if user exists in db
        //Todo add email as query parameter
        //TODO Use other function than findAll to get only one result
        User.findOne({ where: { email: req.body.email } })
            .then((user) => {
                if (!user) {
                    return res.status(500).json({ message: 'Email introuvable merci de verifier' });
                }

                //Randomly generate a new password
                //Encrypt new password (bcrypt)
                //TODO Use other function than findAll to get only one result    
                const password = generatePassword();
                user.update({
                    password
                })
                    .then((updatedUser) => {
                        const userDatas = {
                            id: user.id,
                            password: password //in email sends we return new password not encrypted
                        };

                        //mailer(userDatas, user.email, 'resetPassword');
                        res.json({ updatedUser });
                    })
                    .catch((error) => {
                        res.status(500).json({ error });
                    });
            })
            .catch((error) => {
                res.status(500).json({ error });
            });
    }
    */
};
