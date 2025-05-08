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
        emailVerified: user.emailVerified,
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
    const { lang } = req.query;

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
        emailVerified: false,
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

      const verificationToken = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      const verificationLink = `http${process.env.NODE_ENV === 'development' ? '' : 's'}://${process.env.NODE_ENV === 'development' ? 'localhost:5173' : process.env.VITE_SERVER_NAME}/verify-email?token=${verificationToken}`;

      const { sendVerificationEmail } = require('../services/mailer');

      await sendVerificationEmail(req.body.email, verificationLink, lang);

      const token = jwt.sign(userData, secretKey, { expiresIn: '1d' });
      return res.status(200).json({ user: userData, token });
    } catch (error) {
      console.error(req.t('auth.signup.error_label'), error);
      return res.status(500).json({ message: req.t('error') });
    }
  },
  verifyEmail: async function (req, res) {
    try {
      const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (!user) return res.status(404).json({ message: req.t('auth.login.not_found') });

      user.emailVerified = true;
      await user.save();

      return res.status(200).json({ message: req.t('auth.signup.verify_email_success') });
    } catch (err) {
      return res.status(400).json({ message: req.t('auth.signup.invalid_link') });
    }
  },
  forgotPassword: async function (req, res) {
    const { email } = req.body;
    const { lang } = req.query;


    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: req.t('auth.login.not_found') });
      }

      const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const resetLink = `http${process.env.NODE_ENV === 'development' ? '' : 's'}://${process.env.NODE_ENV === 'development' ? 'localhost:5173' : process.env.VITE_SERVER_NAME}/reset-password?token=${resetToken}`;

      const { sendPasswordResetEmail } = require('../services/mailer');
      await sendPasswordResetEmail(email, resetLink, lang);

      return res.status(200).json({ message: req.t('auth.signup.reinitialize_email') });
    } catch (err) {
      console.log("error ", err)
      return res.status(500).json({ message: req.t('auth.signup.reinitialize_error') });
    }
  },
  resetPassword: async function (req, res) {
    const { token } = req.query;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message:  req.t('auth.signup.password_mismatch') });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (!user) return res.status(404).json({ message: req.t('auth.login.not_found') });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      return res.status(200).json({ message: req.t('auth.login.password_updated') });
    } catch (err) {
      return res.status(400).json({ message: req.t('auth.signup.invalid_link') });
    }
  }
};
