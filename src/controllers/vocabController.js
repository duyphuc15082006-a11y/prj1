const { listVocabByLevel, getVocabById } = require('../daos/vocabDao');
const { ok, fail } = require('../utils/response');
const { isValidLevel } = require('../utils/validators');

async function listByLevel(req, res) {
  const level = req.query.level;
  if (!isValidLevel(level)) {
    return fail(res, 400, 'Invalid level');
  }
  const userId = req.user ? req.user.id : null;
  const vocab = await listVocabByLevel(level, userId);
  return ok(res, vocab);
}

async function getById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return fail(res, 400, 'Invalid id');
  }
  const userId = req.user ? req.user.id : null;
  const vocab = await getVocabById(id, userId);
  if (!vocab) {
    return fail(res, 404, 'Not found');
  }
  return ok(res, vocab);
}

module.exports = { listByLevel, getById };
