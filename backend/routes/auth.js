const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { avatarUploader } = require('../middlewares/uploaders');

/* POST email and password and return jwt if authenticated successfull */
router.post('/signin', authController.signIn);

/* POST create n. multer create an object, we can access it with req.avatar */
router.post('/signup', avatarUploader.single('avatar'), authController.signUp);


//not incorporate yet
/*
router.put('/change-password', passport.authenticate('jwt', { session: false }), authController.changePassword);

router.delete('/delete-account', passport.authenticate('jwt', { session: false }), authController.deleteAccount);

router.post('/reset', authController.forgetPassword);
*/

module.exports = router;
