var express = require('express');
var router = express.Router();

const { isAdmin } = require('../middlewares/auth');
const passport = require('passport');

const articlesController = require('../controllers/articlesController')

/* GET articles listing. */
router.get('/', articlesController.index);
//show
router.get('/:id', articlesController.show);
//create
router.post('/', passport.authenticate('jwt', { session: false }), articlesController.create);
//update
router.put('/:id', articlesController.update);
//validate
router.put('/:id/validate', passport.authenticate('jwt', { session: false }), isAdmin, articlesController.update);
//delete
router.delete('/:id', passport.authenticate('jwt', { session: false }), isAdmin, articlesController.delete);

module.exports = router;
