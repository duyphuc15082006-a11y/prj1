const db = require('../config/db');

async function listVocabByLevel(level, userId = null) {
  if (userId) {
    const [rows] = await db.query(
      `SELECT v.id, v.word, v.meaning, v.example, v.level,
              COALESCE(uv.is_learned, 0) AS is_learned
       FROM vocab v
       LEFT JOIN user_vocab_progress uv
         ON uv.vocab_id = v.id AND uv.user_id = ?
       WHERE v.level = ?
       ORDER BY v.word ASC`,
      [userId, level]
    );
    return rows;
  }
  const [rows] = await db.query(
    'SELECT id, word, meaning, example, level FROM vocab WHERE level = ? ORDER BY word ASC',
    [level]
  );
  return rows;
}

async function getVocabById(id, userId = null) {
  if (userId) {
    const [rows] = await db.query(
      `SELECT v.id, v.word, v.meaning, v.example, v.level,
              COALESCE(uv.is_learned, 0) AS is_learned
       FROM vocab v
       LEFT JOIN user_vocab_progress uv
         ON uv.vocab_id = v.id AND uv.user_id = ?
       WHERE v.id = ?`,
      [userId, id]
    );
    return rows[0] || null;
  }
  const [rows] = await db.query(
    'SELECT id, word, meaning, example, level FROM vocab WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function createVocab({ word, meaning, example, level }) {
  const [result] = await db.query(
    'INSERT INTO vocab (word, meaning, example, level) VALUES (?, ?, ?, ?)',
    [word, meaning, example || null, level]
  );
  return result.insertId;
}

async function updateVocab(id, { word, meaning, example, level }) {
  const [result] = await db.query(
    'UPDATE vocab SET word = ?, meaning = ?, example = ?, level = ? WHERE id = ?',
    [word, meaning, example || null, level, id]
  );
  return result.affectedRows > 0;
}

async function deleteVocab(id) {
  const [result] = await db.query('DELETE FROM vocab WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function listVocabForQuiz(level, n) {
  const [rows] = await db.query(
    'SELECT id, word, meaning, example, level FROM vocab WHERE level = ? ORDER BY RAND() LIMIT ?',
    [level, n]
  );
  return rows;
}

async function listMeaningsByLevel(level) {
  const [rows] = await db.query('SELECT meaning FROM vocab WHERE level = ?', [level]);
  return rows.map((r) => r.meaning);
}

async function getVocabByIds(ids) {
  if (!ids.length) return [];
  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await db.query(
    `SELECT id, word, meaning, level FROM vocab WHERE id IN (${placeholders})`,
    ids
  );
  return rows;
}

async function bulkInsertVocab(items) {
  if (!items.length) return { inserted: 0 };
  const placeholders = items.map(() => '(?, ?, ?, ?)').join(',');
  const values = items.flatMap((v) => [v.word, v.meaning, v.example || null, v.level]);
  const [result] = await db.query(
    `INSERT IGNORE INTO vocab (word, meaning, example, level) VALUES ${placeholders}`,
    values
  );
  return { inserted: result.affectedRows || 0 };
}

module.exports = {
  listVocabByLevel,
  getVocabById,
  createVocab,
  updateVocab,
  deleteVocab,
  listVocabForQuiz,
  listMeaningsByLevel,
  getVocabByIds,
  bulkInsertVocab
};
