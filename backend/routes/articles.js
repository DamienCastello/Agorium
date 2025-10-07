var express = require('express');
var router = express.Router();

const { isAdmin } = require('../middlewares/admin');
const { authenticateJwt } = require('../middlewares/auth');
const { preMulterAbortGuard } = require('../middlewares/abortGuard');
const { articleUploader } = require('../middlewares/articleUploader');

const articlesController = require('../controllers/articlesController')
const processingController = require('../controllers/processingController');


/* GET validated articles listing. */
router.get('/', articlesController.indexValidated);
/* GET invalidated articles listing. */
router.get('/invalid', articlesController.indexNotValidated);
/* GET invalidated articles listing. */
router.get('/invalid/user/:id', articlesController.indexNotValidatedByUser);
/* GET validated articles listing. */
router.get('/valid/user/:id', articlesController.indexValidatedByUser);
//show
router.get('/:id', articlesController.show);
//show private
router.get('/private/:privateLink', articlesController.showPrivate);
//like/unlike
router.post('/:id/like', authenticateJwt, articlesController.like);
//create
router.post(
  '/',
  authenticateJwt,
  preMulterAbortGuard,
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
router.put('/:id',
  authenticateJwt,
  preMulterAbortGuard,
  articleUploader.fields([
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
  }
);
//validate
router.put('/:id/validate', authenticateJwt, isAdmin, articlesController.validate);
//delete
router.delete('/:id', authenticateJwt, articlesController.delete);

//get status of processing file
router.get('/:id/status', processingController.getStatus);

//retry processing file if failed
router.post('/:id/retry', authenticateJwt, processingController.retryProcessing)

module.exports = router;