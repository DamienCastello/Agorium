var express = require('express');
var router = express.Router();

const path = require('path');
const { safeUnlink } = require('../utils/safeUnlink');
const { isAdmin } = require('../middlewares/admin');
const { authenticateJwt } = require('../middlewares/auth');
const { articleUploader } = require('../middlewares/articleUploader');


const articlesController = require('../controllers/articlesController')
const processingController = require('../controllers/processingController');

// Attach an 'aborted' listener *after* multer has written files,
// so we can clean them up if the client cancels or navigates away mid-upload.
function attachAbortCleanup(req, res, next) {
  req.on('aborted', () => {
    try {
      const dev = process.env.NODE_ENV === 'development';
      const paths = [];

      // Prefer your normalized paths set by your uploader (relative db-style)
      if (req.uploadedFiles?.video) {
        const rel = req.uploadedFiles.video.replace('/app/public', '');
        const abs = dev ? path.resolve(rel) : path.join('/app/public', rel);
        paths.push(abs);
      }
      if (req.uploadedFiles?.preview) {
        const rel = req.uploadedFiles.preview.replace('/app/public', '');
        const abs = dev ? path.resolve(rel) : path.join('/app/public', rel);
        paths.push(abs);
      }

      // Fallback: if your uploader does not set req.uploadedFiles, use multer's absolute paths.
      if (req.files?.video?.[0]?.path) paths.push(req.files.video[0].path);
      if (req.files?.preview?.[0]?.path) paths.push(req.files.preview[0].path);

      paths.forEach(safeUnlink);
    } catch {}
  });

  next();
}

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
  articleUploader.fields([
    { name: 'preview', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  attachAbortCleanup,
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
attachAbortCleanup,
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
router.delete('/:id', authenticateJwt, articlesController.delete);

//get status of processing file
router.get('/:id/status', processingController.getStatus);

//retry processing file if failed
router.post('/:id/retry', authenticateJwt, processingController.retryProcessing)

module.exports = router;