var express = require('express');
var router = express.Router();

const achievementsController = require('../controllers/achievementsController')

//const { isAdmin } = require('../middlewares/admin');
//const { authenticateJwt } = require('../middlewares/auth');

/* GET resources listing. */
router.get('/', achievementsController.index);
//show
router.get('/:id', achievementsController.show);
//create
router.post('/', achievementsController.create);
//router.post('/', authenticateJwt, isAdmin, achievementsController.create);
//update
router.put('/:id', achievementsController.update);
//router.put('/:id', authenticateJwt, isAdmin, achievementsController.update);
//delete
router.delete('/:id', achievementsController.delete);
// router.delete('/:id', authenticateJwt, isAdmin, achievementsController.delete);

module.exports = router;
