const express = require('express');
const { updateProgress } = require('../controllers/progressController');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.put('/:vocabId', authRequired, updateProgress);

module.exports = router;
