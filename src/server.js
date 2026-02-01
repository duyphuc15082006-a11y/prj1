const app = require('./app');
const env = require('./config/env');

if (!env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.error('Missing JWT_SECRET in .env');
  process.exit(1);
}

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${env.PORT}`);
});
