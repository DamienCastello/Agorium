var express = require('express');
var router = express.Router();

const { isAdmin } = require('../middlewares/admin');
const { authenticateJwt } = require('../middlewares/auth');

const articlesController = require('../controllers/articlesController')
const { previewUploader } = require('../middlewares/uploaders');


/* GET articles listing. */
router.get('/', articlesController.index);
//show
router.get('/:id', articlesController.show);
//create
router.post('/', authenticateJwt, previewUploader.single("preview"), articlesController.create);
//update
router.put('/:id', authenticateJwt, articlesController.update);
//validate
router.put('/:id/validate', authenticateJwt, isAdmin, articlesController.update);
//delete
router.delete('/:id', authenticateJwt, isAdmin, articlesController.delete);

module.exports = router;