import { assertTestDatabase, TEST_DATABASE_URL } from './test-env';

assertTestDatabase(TEST_DATABASE_URL);
// Set before AppModule loads so loadEnv() never sees development values.
Object.assign(process.env, {
  NODE_ENV: 'test',
  DATABASE_URL: TEST_DATABASE_URL,
  JWT_SECRET: 'e2e-access-secret-'.padEnd(48, 'a'),
  JWT_REFRESH_SECRET: 'e2e-refresh-secret-'.padEnd(48, 'b'),
  IP_HASH_SALT: 'e2e-salt',
  INTERNAL_API_KEY: 'e2e-internal-key-'.padEnd(48, 'c'),
  CORS_ORIGINS: 'http://localhost:3000',
  SWAGGER_ENABLED: 'false',
});
