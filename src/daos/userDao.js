const db = require('../config/db');

async function getUserByUsername(username) {
  const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0] || null;
}

async function getUserById(id) {
  const [rows] = await db.query('SELECT id, username, role, is_locked, created_at FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createUser({ username, password_hash, role = 'USER' }) {
  const [result] = await db.query(
    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
    [username, password_hash, role]
  );
  return result.insertId;
}

async function listUsers() {
  const [rows] = await db.query('SELECT id, username, role, is_locked, created_at FROM users ORDER BY created_at DESC');
  return rows;
}

async function setUserLocked(id, isLocked) {
  const [result] = await db.query('UPDATE users SET is_locked = ? WHERE id = ?', [isLocked ? 1 : 0, id]);
  return result.affectedRows > 0;
}

async function deleteUser(id) {
  const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { getUserByUsername, getUserById, createUser, listUsers, setUserLocked, deleteUser };
