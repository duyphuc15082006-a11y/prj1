const express = require('express');
const { listByLevel, getById } = require('../controllers/vocabController');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/', authRequired, listByLevel);
router.get('/:id', authRequired, getById);

module.exports = router;
