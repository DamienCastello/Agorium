const express = require('express');
const router = express.Router();

const reportsController = require('../controllers/reportsController');

//create
router.post('/', reportsController.create);
//update
router.put('/:id', reportsController.update);
//delete
router.delete('/:id', reportsController.delete);

module.exports = router;