var express = require('express');
var router = express.Router();

const usersController = require('../controllers/usersController')

const { isAdmin } = require('../middlewares/auth');
const passport = require('passport');

/* GET resources listing. */
router.get('/', passport.authenticate('jwt', { session: false }), usersController.index);
//show
router.get('/:id', passport.authenticate('jwt', { session: false }), usersController.show);
//create
router.post('/', passport.authenticate('jwt', { session: false }), isAdmin, usersController.create);
//update
router.put('/:id', passport.authenticate('jwt', { session: false }), isAdmin, usersController.update);
//delete
router.delete('/:id', passport.authenticate('jwt', { session: false }), isAdmin, usersController.delete);

module.exports = router;
