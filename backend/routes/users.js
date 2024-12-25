var express = require('express');
var router = express.Router();

const usersController = require('../controllers/usersController')

const { isAdmin } = require('../middlewares/admin');
const { authenticateJwt } = require('../middlewares/auth');

/* GET resources listing. */
router.get('/', authenticateJwt, usersController.index);
//show
router.get('/:id', authenticateJwt, usersController.show);
//create
router.post('/', authenticateJwt, isAdmin, usersController.create);
//update
router.put('/:id', authenticateJwt, isAdmin, usersController.update);
//delete
router.delete('/:id', authenticateJwt, isAdmin, usersController.delete);

module.exports = router;
