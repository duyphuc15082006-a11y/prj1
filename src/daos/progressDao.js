const db = require('../config/db');

async function upsertProgress(userId, vocabId, isLearned) {
  const [result] = await db.query(
    `INSERT INTO user_vocab_progress (user_id, vocab_id, is_learned)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE is_learned = VALUES(is_learned)`,
    [userId, vocabId, isLearned ? 1 : 0]
  );
  return result.affectedRows > 0;
}

module.exports = { upsertProgress };
