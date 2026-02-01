const { listVocabForQuiz, listMeaningsByLevel, getVocabByIds } = require('../daos/vocabDao');
const { createAttempt } = require('../daos/quizDao');
const { ok, fail } = require('../utils/response');
const { isValidLevel, QUIZ_TYPES } = require('../utils/validators');

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

async function startQuiz(req, res) {
  const { level, n, type } = req.body || {};
  if (!isValidLevel(level)) {
    return fail(res, 400, 'Invalid level');
  }
  if (!QUIZ_TYPES.includes(type)) {
    return fail(res, 400, 'Invalid type');
  }
  const total = Number(n);
  if (!Number.isInteger(total) || total < 1 || total > 50) {
    return fail(res, 400, 'Invalid n');
  }
  const questions = await listVocabForQuiz(level, total);
  const meanings = await listMeaningsByLevel(level);

  const payload = questions.map((q) => {
    if (type === 'mcq') {
      const choices = new Set([q.meaning]);
      while (choices.size < 4 && meanings.length > 1) {
        const pick = meanings[Math.floor(Math.random() * meanings.length)];
        choices.add(pick);
      }
      return {
        id: q.id,
        prompt: q.word,
        example: q.example,
        choices: shuffle(Array.from(choices))
      };
    }
    if (type === 'en_vi') {
      return {
        id: q.id,
        prompt: q.word,
        example: q.example
      };
    }
    return {
      id: q.id,
      prompt: q.meaning,
      example: q.example
    };
  });

  return ok(res, { level, type, total: payload.length, questions: payload });
}

async function submitQuiz(req, res) {
  const { level, answers, type } = req.body || {};
  if (!isValidLevel(level)) {
    return fail(res, 400, 'Invalid level');
  }
  if (!QUIZ_TYPES.includes(type)) {
    return fail(res, 400, 'Invalid type');
  }
  if (!Array.isArray(answers) || answers.length < 1 || answers.length > 50) {
    return fail(res, 400, 'Invalid answers');
  }
  const ids = answers.map((a) => Number(a.vocabId)).filter((id) => Number.isInteger(id) && id > 0);
  if (ids.length !== answers.length) {
    return fail(res, 400, 'Invalid answers');
  }
  const vocabList = await getVocabByIds(ids);
  const vocabMap = new Map(vocabList.map((v) => [v.id, v]));

  let score = 0;
  for (const answer of answers) {
    const vocab = vocabMap.get(Number(answer.vocabId));
    if (!vocab || vocab.level !== level) {
      continue;
    }
    const userAnswer = normalizeText(answer.answer);
    if (type === 'mcq' || type === 'en_vi') {
      const correct = normalizeText(vocab.meaning);
      if (userAnswer === correct) {
        score += 1;
      }
      continue;
    }
    const correctWord = normalizeText(vocab.word);
    if (userAnswer === correctWord) {
      score += 1;
    }
  }
  await createAttempt({
    userId: req.user.id,
    level,
    totalQuestions: answers.length,
    score
  });

  return ok(res, { score, total: answers.length });
}

module.exports = { startQuiz, submitQuiz };
