const { upsertProgress } = require('../daos/progressDao');
const { getVocabById } = require('../daos/vocabDao');
const { ok, fail } = require('../utils/response');

async function updateProgress(req, res) {
  const vocabId = Number(req.params.vocabId);
  const { isLearned } = req.body || {};
  if (!Number.isInteger(vocabId) || vocabId <= 0) {
    return fail(res, 400, 'Invalid vocab id');
  }
  if (typeof isLearned !== 'boolean') {
    return fail(res, 400, 'Invalid isLearned');
  }
  const vocab = await getVocabById(vocabId);
  if (!vocab) {
    return fail(res, 404, 'Vocab not found');
  }
  await upsertProgress(req.user.id, vocabId, isLearned);
  return ok(res, { vocabId, isLearned });
}

module.exports = { updateProgress };
