var express = require('express');
var router = express.Router();

const tagsController = require('../controllers/tagsController')

const { isAdmin } = require('../middlewares/admin');
const { authenticateJwt } = require('../middlewares/auth');

/* GET resources listing. */
router.get('/', authenticateJwt, tagsController.index);
//show
router.get('/:id', authenticateJwt, tagsController.show);
//create
router.post('/', authenticateJwt, tagsController.create);
//update
router.put('/:id', authenticateJwt, tagsController.update);
//validate
router.put('/:id/validate', authenticateJwt, isAdmin, tagsController.create);
//delete
router.delete('/:id', authenticateJwt, isAdmin, tagsController.delete);

module.exports = router;
