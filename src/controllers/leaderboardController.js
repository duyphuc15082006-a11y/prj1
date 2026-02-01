const { getLeaderboard } = require('../daos/quizDao');
const { ok, fail } = require('../utils/response');
const { isValidLevel } = require('../utils/validators');

async function leaderboard(req, res) {
  const { level } = req.query;
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 20);
  if (level && !isValidLevel(level)) {
    return fail(res, 400, 'Invalid level');
  }
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    return fail(res, 400, 'Invalid paging');
  }
  const data = await getLeaderboard({ level: level || null, page, pageSize });
  return ok(res, { page, pageSize, items: data });
}

module.exports = { leaderboard };
