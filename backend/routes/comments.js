const express = require('express');
const router = express.Router();
const { authenticateJwt } = require('../middlewares/auth');

const commentsController = require('../controllers/commentsController');

//create
router.post('/', authenticateJwt, commentsController.create);
//like/unlike
router.post('/:id/like', authenticateJwt, commentsController.like);
//update
router.put('/:id', authenticateJwt, commentsController.update);
//report
router.post('/:id/report', commentsController.report);
//delete
router.delete('/:id', authenticateJwt, commentsController.delete);

module.exports = router;