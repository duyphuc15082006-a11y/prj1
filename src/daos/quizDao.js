const db = require('../config/db');

async function createAttempt({ userId, level, totalQuestions, score }) {
  const [result] = await db.query(
    'INSERT INTO quiz_attempts (user_id, level, total_questions, score) VALUES (?, ?, ?, ?)',
    [userId, level, totalQuestions, score]
  );
  return result.insertId;
}

async function getLeaderboard({ level, page, pageSize }) {
  const offset = (page - 1) * pageSize;
  const params = [];
  let join = 'LEFT JOIN quiz_attempts a ON a.user_id = u.id';
  let where = 'WHERE a.id IS NOT NULL';
  if (level) {
    join = 'LEFT JOIN quiz_attempts a ON a.user_id = u.id AND a.level = ?';
    params.push(level);
  }
  params.push(pageSize, offset);
  const [rows] = await db.query(
    `SELECT u.id, u.username,
            COALESCE(SUM(a.score), 0) AS total_score,
            COALESCE(COUNT(a.id), 0) AS attempts
     FROM users u
     ${join}
     ${where}
     GROUP BY u.id
     ORDER BY total_score DESC, attempts DESC, u.username ASC
     LIMIT ? OFFSET ?`,
    params
  );
  return rows;
}

module.exports = { createAttempt, getLeaderboard };
