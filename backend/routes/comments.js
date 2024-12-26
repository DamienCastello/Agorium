const express = require('express');
const router = express.Router();
const { authenticateJwt } = require('../middlewares/auth');

const commentsController = require('../controllers/commentsController');

//create
router.post('/', authenticateJwt, commentsController.create);
//update
router.put('/:id', authenticateJwt, commentsController.update);
//delete
router.delete('/:id', authenticateJwt, commentsController.delete);

module.exports = router;