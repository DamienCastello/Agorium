var express = require('express');
var router = express.Router();

const usersController = require('../controllers/usersController')

const { isAdmin } = require('../middlewares/admin');
const { authenticateJwt } = require('../middlewares/auth');


/* GET resources listing. */
router.get('/', authenticateJwt, usersController.index);
//show
router.get('/:id', usersController.show);
//create
router.post('/', authenticateJwt, usersController.create);
//update
router.put('/:id', authenticateJwt, usersController.update);
//delete
router.delete('/:id', authenticateJwt, isAdmin, usersController.delete);

module.exports = router;
