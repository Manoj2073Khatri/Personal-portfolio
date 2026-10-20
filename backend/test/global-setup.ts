import { execSync } from 'node:child_process';
import { assertTestDatabase, TEST_DATABASE_URL } from './test-env';

/** Applies migrations to the test database once per run. */
export default function globalSetup() {
  assertTestDatabase(TEST_DATABASE_URL);
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
  });
}
