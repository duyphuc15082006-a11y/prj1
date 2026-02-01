const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { parse } = require('csv-parse/sync');
const env = require('../src/config/env');
const { LEVELS } = require('../src/utils/validators');

function usage() {
  // eslint-disable-next-line no-console
  console.log('Usage: npm run import:csv -- /path/to/vocab.csv');
}

async function run() {
  const filePath = process.argv[2];
  if (!filePath) {
    usage();
    process.exit(1);
  }

  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    // eslint-disable-next-line no-console
    console.error('File not found:', fullPath);
    process.exit(1);
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  let records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
  if (!records.length && content.includes(';')) {
    records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: ';'
    });
  }

  if (!records.length) {
    // eslint-disable-next-line no-console
    console.error('No records found. Check CSV delimiter and header.');
    process.exit(1);
  }

  const headerKeys = Object.keys(records[0] || {}).map((k) => String(k).toLowerCase().trim());
  const pick = (row, keys) => {
    for (const k of keys) {
      if (row[k] !== undefined) return row[k];
    }
    return undefined;
  };
  const normalizeHeader = (row) => {
    const out = {};
    Object.keys(row || {}).forEach((k) => {
      out[String(k).toLowerCase().trim()] = row[k];
    });
    return out;
  };

  const rows = records
    .map((raw) => {
      const r = normalizeHeader(raw);
      const word = pick(r, ['word', 'tu', 'từ']);
      const meaning = pick(r, ['meaning', 'nghia', 'nghĩa', 'nghia tieng viet', 'nghĩa tiếng việt']);
      const example1 = pick(r, ['example', 'vi du', 'ví dụ', 'vi du ngan', 'ví dụ ngắn']);
      const example2 = pick(r, ['example 2', 'vi du ngan 2', 'ví dụ ngắn 2', 'example2']);
      const level = pick(r, ['level', 'cap do', 'cấp độ']);
      const example = example1 || example2 || null;
      return { word, meaning, example, level };
    })
    .filter((r) => r.word && r.meaning && r.level);

  if (!rows.length) {
    // eslint-disable-next-line no-console
    console.error('No valid rows found. Detected headers:', headerKeys.join(', '));
    process.exit(1);
  }

  const invalid = rows.filter((r) => !LEVELS.includes(String(r.level).trim()));
  if (invalid.length) {
    // eslint-disable-next-line no-console
    console.error('Invalid level found in CSV. Allowed:', LEVELS.join(', '));
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
  });

  let inserted = 0;
  for (const r of rows) {
    const [result] = await connection.query(
      'INSERT IGNORE INTO vocab (word, meaning, example, level) VALUES (?, ?, ?, ?)',
      [String(r.word).trim(), String(r.meaning).trim(), r.example ? String(r.example).trim() : null, String(r.level).trim()]
    );
    if (result.affectedRows > 0) inserted += 1;
  }

  await connection.end();
  // eslint-disable-next-line no-console
  console.log(`Import done. Inserted: ${inserted}. Skipped: ${rows.length - inserted}.`);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Import failed:', err.message);
  process.exit(1);
});
