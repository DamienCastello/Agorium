const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { avatarUploader } = require('../middlewares/avatarUploader');

/* POST email and password and return jwt if authenticated successfull */
router.post('/signin', avatarUploader.single("avatar"), authController.signIn);

/* POST create n. multer create an object, we can access it with req.avatar */
router.post('/signup', avatarUploader.single("avatar"), authController.signUp);

router.get('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
