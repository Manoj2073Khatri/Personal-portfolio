/**
 * E2E tests run against a separate database. TEST_DATABASE_URL defaults to
 * the `portfolio_test` database created by docker/init-test-db.sql.
 */
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://portfolio:portfolio@localhost:5433/portfolio_test';

export function assertTestDatabase(url: string) {
  // Every suite truncates tables: refuse anything that is not clearly a test DB.
  const name = new URL(url).pathname.slice(1);
  if (!/test/i.test(name)) {
    throw new Error(
      `Refusing to run e2e tests against database "${name}" (name must contain "test")`,
    );
  }
}
