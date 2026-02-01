const { listUsers, setUserLocked, deleteUser } = require('../daos/userDao');
const { createVocab, updateVocab, deleteVocab, getVocabById, bulkInsertVocab } = require('../daos/vocabDao');
const { ok, fail } = require('../utils/response');
const { isValidLevel, isNonEmptyString } = require('../utils/validators');

async function listAllUsers(req, res) {
  const users = await listUsers();
  return ok(res, users);
}

async function lockUser(req, res) {
  const userId = Number(req.params.id);
  const { isLocked } = req.body || {};
  if (!Number.isInteger(userId) || userId <= 0 || typeof isLocked !== 'boolean') {
    return fail(res, 400, 'Invalid input');
  }
  const updated = await setUserLocked(userId, isLocked);
  if (!updated) {
    return fail(res, 404, 'User not found');
  }
  return ok(res, { id: userId, isLocked });
}

async function deleteUserAdmin(req, res) {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return fail(res, 400, 'Invalid input');
  }
  const deleted = await deleteUser(userId);
  if (!deleted) {
    return fail(res, 404, 'User not found');
  }
  return ok(res, { id: userId });
}

async function createVocabAdmin(req, res) {
  const { word, meaning, example, level } = req.body || {};
  if (!isNonEmptyString(word) || !isNonEmptyString(meaning) || !isValidLevel(level)) {
    return fail(res, 400, 'Invalid input');
  }
  const id = await createVocab({ word: word.trim(), meaning: meaning.trim(), example, level });
  const vocab = await getVocabById(id);
  return ok(res, vocab);
}

async function updateVocabAdmin(req, res) {
  const id = Number(req.params.id);
  const { word, meaning, example, level } = req.body || {};
  if (!Number.isInteger(id) || id <= 0) {
    return fail(res, 400, 'Invalid id');
  }
  if (!isNonEmptyString(word) || !isNonEmptyString(meaning) || !isValidLevel(level)) {
    return fail(res, 400, 'Invalid input');
  }
  const updated = await updateVocab(id, { word: word.trim(), meaning: meaning.trim(), example, level });
  if (!updated) {
    return fail(res, 404, 'Not found');
  }
  const vocab = await getVocabById(id);
  return ok(res, vocab);
}

async function deleteVocabAdmin(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return fail(res, 400, 'Invalid id');
  }
  const deleted = await deleteVocab(id);
  if (!deleted) {
    return fail(res, 404, 'Not found');
  }
  return ok(res, { id });
}

async function bulkVocabAdmin(req, res) {
  const { items } = req.body || {};
  if (!Array.isArray(items) || items.length < 1 || items.length > 5000) {
    return fail(res, 400, 'Invalid items');
  }
  const cleaned = items
    .map((i) => ({
      word: typeof i.word === 'string' ? i.word.trim() : '',
      meaning: typeof i.meaning === 'string' ? i.meaning.trim() : '',
      example: typeof i.example === 'string' ? i.example.trim() : null,
      level: typeof i.level === 'string' ? i.level.trim() : ''
    }))
    .filter((i) => i.word && i.meaning && isValidLevel(i.level));

  if (!cleaned.length) {
    return fail(res, 400, 'No valid items');
  }

  const result = await bulkInsertVocab(cleaned);
  return ok(res, {
    total: items.length,
    valid: cleaned.length,
    inserted: result.inserted,
    skipped: cleaned.length - result.inserted
  });
}

module.exports = {
  listAllUsers,
  lockUser,
  deleteUserAdmin,
  createVocabAdmin,
  updateVocabAdmin,
  deleteVocabAdmin,
  bulkVocabAdmin
};
