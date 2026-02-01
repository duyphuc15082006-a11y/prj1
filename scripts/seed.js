const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const env = require('../src/config/env');

const vocabSeed = [
  { word: 'apple', meaning: 'quả táo', example: 'I eat an apple.', level: 'A1' },
  { word: 'book', meaning: 'quyển sách', example: 'This is my book.', level: 'A1' },
  { word: 'family', meaning: 'gia đình', example: 'My family is big.', level: 'A1' },
  { word: 'house', meaning: 'ngôi nhà', example: 'The house is small.', level: 'A1' },
  { word: 'water', meaning: 'nước', example: 'Drink water every day.', level: 'A1' },
  { word: 'friend', meaning: 'bạn bè', example: 'She is my friend.', level: 'A1' },

  { word: 'travel', meaning: 'du lịch', example: 'We travel by train.', level: 'A2' },
  { word: 'message', meaning: 'tin nhắn', example: 'Send me a message.', level: 'A2' },
  { word: 'healthy', meaning: 'khỏe mạnh', example: 'He eats healthy food.', level: 'A2' },
  { word: 'weather', meaning: 'thời tiết', example: 'The weather is nice.', level: 'A2' },
  { word: 'future', meaning: 'tương lai', example: 'I think about the future.', level: 'A2' },
  { word: 'simple', meaning: 'đơn giản', example: 'The rule is simple.', level: 'A2' },

  { word: 'improve', meaning: 'cải thiện', example: 'We improve our skills.', level: 'B1' },
  { word: 'opinion', meaning: 'ý kiến', example: 'In my opinion, it is useful.', level: 'B1' },
  { word: 'balance', meaning: 'cân bằng', example: 'Work-life balance matters.', level: 'B1' },
  { word: 'support', meaning: 'hỗ trợ', example: 'Thank you for your support.', level: 'B1' },
  { word: 'benefit', meaning: 'lợi ích', example: 'Exercise has many benefits.', level: 'B1' },
  { word: 'reduce', meaning: 'giảm', example: 'We reduce waste.', level: 'B1' },

  { word: 'reliable', meaning: 'đáng tin cậy', example: 'She is reliable.', level: 'B2' },
  { word: 'contribute', meaning: 'đóng góp', example: 'I want to contribute.', level: 'B2' },
  { word: 'significant', meaning: 'đáng kể', example: 'There is a significant change.', level: 'B2' },
  { word: 'perspective', meaning: 'quan điểm', example: 'We need a new perspective.', level: 'B2' },
  { word: 'maintain', meaning: 'duy trì', example: 'Maintain good habits.', level: 'B2' },
  { word: 'complex', meaning: 'phức tạp', example: 'This is a complex issue.', level: 'B2' },

  { word: 'meticulous', meaning: 'tỉ mỉ', example: 'She is meticulous.', level: 'C1' },
  { word: 'inevitable', meaning: 'không thể tránh', example: 'Change is inevitable.', level: 'C1' },
  { word: 'controversial', meaning: 'gây tranh cãi', example: 'A controversial topic.', level: 'C1' },
  { word: 'substantial', meaning: 'đáng kể', example: 'A substantial amount.', level: 'C1' },
  { word: 'coherent', meaning: 'mạch lạc', example: 'A coherent argument.', level: 'C1' },
  { word: 'undermine', meaning: 'làm suy yếu', example: 'Do not undermine the effort.', level: 'C1' }
];

async function run() {
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
  });

  const adminUsername = 'admin';
  const adminPassword = 'admin123';
  const hash = await bcrypt.hash(adminPassword, 10);

  await connection.query(
    'INSERT IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)',
    [adminUsername, hash, 'ADMIN']
  );

  for (const v of vocabSeed) {
    await connection.query(
      'INSERT IGNORE INTO vocab (word, meaning, example, level) VALUES (?, ?, ?, ?)',
      [v.word, v.meaning, v.example || null, v.level]
    );
  }

  await connection.end();
  // eslint-disable-next-line no-console
  console.log('Seed complete');
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err.message);
  process.exit(1);
});
