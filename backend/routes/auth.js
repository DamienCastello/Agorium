const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { cleanPendingAvatars } = require('../services/cleanupPendingAvatars');

const { avatarUploader } = require('../middlewares/avatarUploader');

/* POST email and password and return jwt if authenticated successfull */
router.post('/signin', authController.signIn);

/* POST create n. multer create an object, we can access it with req.avatar */
router.post('/signup',  avatarUploader.single("avatar"),authController.signUp);

router.get('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

if (process.env.NODE_ENV !== 'production') {
  router.post('/cleanup-avatars', async (req, res) => {
    try {
      await cleanPendingAvatars();
      return res.json({ message: 'Cleanup triggered manually (dev & preprod only)' });
    } catch (e) {
      console.error('[dev & preprod cleanup]', e);
      return res.status(500).json({ message: 'Error while cleaning' });
    }
  });
}

module.exports = router;
