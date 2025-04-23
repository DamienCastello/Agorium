var express = require('express');
var router = express.Router();

const { isAdmin } = require('../middlewares/admin');
const { authenticateJwt } = require('../middlewares/auth');

const articlesController = require('../controllers/articlesController')
const { previewUploader } = require('../middlewares/uploaders');


/* GET validated articles listing. */
router.get('/', articlesController.indexValidated);
/* GET invalidated articles listing. */
router.get('/invalid', articlesController.indexNotValidated);
/* GET invalidated articles listing. */
router.get('/invalid/user/:id', articlesController.indexNotValidatedByUser);
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
        return res.status(400).json({ message: "Invalid tags format" });
      }
    }
    articlesController.create(req, res, next);
  });
//report
router.post('/:id/report', articlesController.report);
//update
router.put('/:id', authenticateJwt, previewUploader.single("preview"), (req, res, next) => {
  if (typeof req.body.tags === 'string') {
    try {
      req.body.tags = JSON.parse(req.body.tags);
    } catch (error) {
      return res.status(400).json({ message: "Invalid tags format" });
    }
  }
  articlesController.update(req, res, next);
});
//validate
router.put('/:id/validate', authenticateJwt, isAdmin, articlesController.validate);
//delete
router.delete('/:id', authenticateJwt, isAdmin, articlesController.delete);

module.exports = router;