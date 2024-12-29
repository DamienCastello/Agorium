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
//like/unlike
router.post('/:id/like', authenticateJwt, articlesController.like);
//create
router.post('/', authenticateJwt, previewUploader.single("preview"), (req, res, next) => {
    if (typeof req.body.tags === 'string') {
      try {
        req.body.tags = JSON.parse(req.body.tags);
      } catch (error) {
        return res.status(400).json({ error: "Invalid tags format" });
      }
    }
    articlesController.create(req, res, next);
  });
  
//update
router.put('/:id', authenticateJwt, articlesController.update);
//validate
router.put('/:id/validate', authenticateJwt, isAdmin, articlesController.update);
//delete
router.delete('/:id', authenticateJwt, isAdmin, articlesController.delete);

module.exports = router;