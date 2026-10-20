import { loadEnv } from './env';

const base = {
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  JWT_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
};

describe('loadEnv', () => {
  it('loads a minimal development config with defaults', () => {
    const env = loadEnv({ ...base });
    expect(env.port).toBe(4000);
    expect(env.corsOrigins).toEqual([]);
    expect(env.isProduction).toBe(false);
  });

  it('requires DATABASE_URL and both JWT secrets', () => {
    expect(() => loadEnv({ ...base, DATABASE_URL: '' })).toThrow(
      /DATABASE_URL/,
    );
    expect(() => loadEnv({ ...base, JWT_REFRESH_SECRET: undefined })).toThrow(
      /JWT_REFRESH_SECRET/,
    );
  });

  it('rejects short or identical JWT secrets', () => {
    expect(() => loadEnv({ ...base, JWT_SECRET: 'short' })).toThrow(
      /32 characters/,
    );
    expect(() =>
      loadEnv({ ...base, JWT_REFRESH_SECRET: base.JWT_SECRET }),
    ).toThrow(/differ/);
  });

  it('requires IP_HASH_SALT in production', () => {
    expect(() => loadEnv({ ...base, NODE_ENV: 'production' })).toThrow(
      /IP_HASH_SALT/,
    );
    expect(
      loadEnv({ ...base, NODE_ENV: 'production', IP_HASH_SALT: 'salt' })
        .isProduction,
    ).toBe(true);
  });

  it('parses CORS origins and strips the trailing slash from the S3 base URL', () => {
    const env = loadEnv({
      ...base,
      CORS_ORIGINS: 'https://a.com, https://b.com',
      S3_PUBLIC_BASE_URL: 'https://cdn.example.com/',
    });
    expect(env.corsOrigins).toEqual(['https://a.com', 'https://b.com']);
    expect(env.s3.publicBaseUrl).toBe('https://cdn.example.com');
  });
});
