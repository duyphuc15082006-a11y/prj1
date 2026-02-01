const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const QUIZ_TYPES = ['mcq', 'en_vi', 'vi_en'];

function isValidLevel(level) {
  return LEVELS.includes(level);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

module.exports = { LEVELS, QUIZ_TYPES, isValidLevel, isNonEmptyString };
