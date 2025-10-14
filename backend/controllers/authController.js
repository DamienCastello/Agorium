const jwt = require('jsonwebtoken');
const User = require('../models').User;
const bcrypt = require('bcrypt');
const redis = require('../services/redisClient');
require('dotenv').config({ path: '/app/../.env' });
const { sendVerificationEmail } = require('../services/mailer');
const { hasValidMx } = require('../utils/checkEmailDomainMx');
const { ensureDir } = require('../utils/ensureDir');
const { safeLocale } = require('../utils/locale');

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const isDev = process.env.NODE_ENV === 'development';
const PUBLIC_ROOT = isDev ? process.cwd() : '/app/public';

function toAbs(rel) {
  return path.join(PUBLIC_ROOT, rel);
}

const secretKey = process.env.JWT_SECRET;
const TTL_SEC = Number(process.env.PENDING_SIGNUP_TTL_SEC || 60 * 60 * 24);

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
    const lang = safeLocale(req.query.lang, 'en');
    const { email, password, confirmPassword, pseudo } = req.body;

    if (!email || !password || !pseudo) {
      return res.status(400).json({ message: req.t('auth.error_fields_required') });
    }
    if (password !== confirmPassword) {
      return res.status(403).json({ message: req.t('auth.signup.password_mismatch') });
    }

    if (process.env.NODE_ENV === 'production') {
      const strongPw = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!strongPw.test(password)) {
        return res.status(400).json({ message: req.t('auth.signup.error_password_strength') });
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: req.t('auth.signup.error_email_format') });
    }

    if (!(await hasValidMx(email))) {
      return res.status(400).json({ message: req.t('auth.signup.error_email_domain_mx') });
    }

    try {
      // Uniqueness (avoids sending an email if already taken)
      const existingByEmail = await User.findOne({ where: { email } });
      if (existingByEmail) {
        return res.status(409).json({ message: req.t('auth.signup.duplicate_email') });
      }
      const existingByPseudo = await User.findOne({ where: { pseudo } });
      if (existingByPseudo) {
        return res.status(409).json({ message: req.t('auth.signup.duplicate_pseudo') });
      }

      // Hash (temporary stock)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      let pendingAvatarRel = null;

      const inputAvatarRel = req.file ? `uploads/avatars/${req.file.filename}` : null;

      if (inputAvatarRel) {
        const ext = path.extname(inputAvatarRel) || '.jpg';
        const destName = `${uuidv4()}${ext}`;
        const destRel = path.join('uploads', 'avatars', 'pending', destName).replace(/\\/g, '/');

        ensureDir(path.dirname(toAbs(destRel)));

        const srcAbs = toAbs(inputAvatarRel);
        const destAbs = toAbs(destRel);

        try {
          fs.renameSync(srcAbs, destAbs);
          pendingAvatarRel = destRel;
        } catch (e) {
          // if rename fail (ex: cross-device), fallback copy+unlink
          fs.copyFileSync(srcAbs, destAbs);
          try { fs.unlinkSync(srcAbs); } catch {}
          pendingAvatarRel = destRel;
        }
      }

      // Short-lived token + Redis storage
      const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

      await redis.setEx(
        `verify:${verificationToken}`,
        TTL_SEC,
        JSON.stringify({
          email,
          password: hashedPassword,
          pseudo,
          pendingAvatarRel
        })
      );

      const verificationLink = `http${process.env.NODE_ENV === 'development' ? '' : 's'}://${process.env.NODE_ENV === 'development' ? 'localhost:5173' : process.env.VITE_SERVER_NAME}/verify-email?token=${verificationToken}`;

      await sendVerificationEmail(email, verificationLink, lang);

      return res.status(202).json({ message: req.t('auth.signup.verify_email_sent') });
    } catch (error) {
      console.error(req.t('auth.signup.error_label'), error);
      return res.status(500).json({ message: req.t('error') });
    }
  },
verifyEmail: async function (req, res) {
  const lang = safeLocale(req.query.lang, 'en');
  const token = req.query.token;

  if (!token) return res.status(400).json({ message: 'Missing token' });

  try {
    jwt.verify(token, process.env.JWT_SECRET);

    const data = await redis.get(`verify:${token}`);
    if (!data) return res.status(400).json({ message: req.t('auth.signup.invalid_token') });

    const { email, password, pseudo, pendingAvatarRel } = JSON.parse(data);

    // security: re-check uniqueness
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      await redis.del(`verify:${token}`);
      return res.status(409).json({ message: req.t('auth.signup.duplicate_email') });
    }

    // If pending avatar : move to "uploads/avatars/<userId>_<uuid>.<ext>" after user creation
    const newUser = await User.create({
      email,
      emailVerified: true,
      password,
      pseudo,
      avatar: null,
      isAdmin: false
    });

    let finalAvatarRel = null;
    if (pendingAvatarRel) {
      const ext = path.extname(pendingAvatarRel) || '.jpg';
      const finalName = `${newUser.id}_${uuidv4()}${ext}`;
      const finalRel = path.join('uploads', 'avatars', finalName).replace(/\\/g, '/');

      ensureDir(path.dirname(toAbs(finalRel)));

      try {
        fs.renameSync(toAbs(pendingAvatarRel), toAbs(finalRel));
        finalAvatarRel = finalRel;
      } catch (e) {
        // fallback copy+unlink
        fs.copyFileSync(toAbs(pendingAvatarRel), toAbs(finalRel));
        try { fs.unlinkSync(toAbs(pendingAvatarRel)); } catch {}
        finalAvatarRel = finalRel;
      }

      // update user with final avatar
      newUser.avatar = finalAvatarRel;
      await newUser.save();
    }

    // remove redis key
    await redis.del(`verify:${token}`);

    return res.status(200).json({
      message: req.t('auth.signup.verify_email_success'),
      user: { id: newUser.id, email: newUser.email, avatar: newUser.avatar }
    });
  } catch (err) {
    return res.status(400).json({ message: req.t('auth.signup.invalid_token') });
  }
},
  forgotPassword: async function (req, res) {
    const { email } = req.body;
    const lang = safeLocale(req.query.lang, 'en');


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
      return res.status(400).json({ message: req.t('auth.signup.invalid_token') });
    }
  }
};
