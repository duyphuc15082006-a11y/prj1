const express = require('express');
const { leaderboard } = require('../controllers/leaderboardController');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/', authRequired, leaderboard);

module.exports = router;
