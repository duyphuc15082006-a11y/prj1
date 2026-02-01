const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { getUserByUsername, createUser } = require('../daos/userDao');
const { ok, fail } = require('../utils/response');
const { isNonEmptyString } = require('../utils/validators');

async function register(req, res) {
  const { username, password, confirmPassword } = req.body || {};
  if (!isNonEmptyString(username) || !isNonEmptyString(password) || !isNonEmptyString(confirmPassword)) {
    return fail(res, 400, 'Invalid input');
  }
  if (password !== confirmPassword) {
    return fail(res, 400, 'Password confirmation does not match');
  }
  const existing = await getUserByUsername(username.trim());
  if (existing) {
    return fail(res, 409, 'Username already exists');
  }
  const hash = await bcrypt.hash(password, 10);
  const userId = await createUser({ username: username.trim(), password_hash: hash, role: 'USER' });
  return ok(res, { id: userId, username: username.trim() });
}

async function login(req, res) {
  const { username, password } = req.body || {};
  if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
    return fail(res, 400, 'Invalid input');
  }
  const user = await getUserByUsername(username.trim());
  if (!user) {
    return fail(res, 401, 'Invalid credentials');
  }
  if (user.is_locked) {
    return fail(res, 403, 'User is locked');
  }
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return fail(res, 401, 'Invalid credentials');
  }
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });
  return ok(res, { token, username: user.username, role: user.role });
}

function logout(req, res) {
  return ok(res, { message: 'Logged out' });
}

module.exports = { register, login, logout };
