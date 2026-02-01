const express = require('express');
const { startQuiz, submitQuiz } = require('../controllers/quizController');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.post('/start', authRequired, startQuiz);
router.post('/submit', authRequired, submitQuiz);

module.exports = router;
