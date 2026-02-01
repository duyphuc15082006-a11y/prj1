const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { getUserById } = require('../daos/userDao');
const { fail } = require('../utils/response');

async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return fail(res, 401, 'Unauthorized');
    }
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await getUserById(payload.id);
    if (!user) {
      return fail(res, 401, 'Unauthorized');
    }
    if (user.is_locked) {
      return fail(res, 403, 'User is locked');
    }
    req.user = user;
    return next();
  } catch (err) {
    return fail(res, 401, 'Unauthorized');
  }
}

async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await getUserById(payload.id);
    if (!user || user.is_locked) return next();
    req.user = user;
    return next();
  } catch (err) {
    return next();
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return fail(res, 403, 'Admin only');
  }
  return next();
}

module.exports = { authRequired, optionalAuth, adminOnly };
