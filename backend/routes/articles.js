var express = require('express');
var router = express.Router();

const { isAdmin } = require('../middlewares/admin');
const { authenticateJwt } = require('../middlewares/auth');

const articlesController = require('../controllers/articlesController')
const { articleUploader } = require('../middlewares/articleUploader');


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
router.post(
  '/',
  authenticateJwt,
  articleUploader.fields([
    { name: 'preview', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  async (req, res, next) => {
    try {
      if (typeof req.body.tags === 'string') {
        req.body.tags = JSON.parse(req.body.tags);
      }
      return articlesController.create(req, res, next);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
);

//report
router.post('/:id/report', articlesController.report);
//update
router.put('/:id', authenticateJwt, articleUploader.fields([
  { name: 'preview', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]),
async (req, res, next) => {
  try {
    if (typeof req.body.tags === 'string') {
      req.body.tags = JSON.parse(req.body.tags);
    }

    return articlesController.update(req, res, next);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
//validate
router.put('/:id/validate', authenticateJwt, isAdmin, articlesController.validate);
//delete
router.delete('/:id', authenticateJwt, isAdmin, articlesController.delete);

module.exports = router;