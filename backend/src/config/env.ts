/**
 * Typed, validated environment configuration. Every variable the backend reads
 * is listed here and documented in docs/environment.md.
 */
export interface AppEnv {
  nodeEnv: string;
  isProduction: boolean;
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  corsOrigins: string[];
  /** Express `trust proxy` hop count; 0 disables. */
  trustProxy: number;
  /** Shared secret that marks requests as coming from the Next.js server. */
  internalApiKey?: string;
  ipHashSalt: string;
  swaggerEnabled: boolean;
  s3: {
    region?: string;
    bucket?: string;
    publicBaseUrl?: string;
    /** Custom endpoint for S3-compatible storage (MinIO, LocalStack). */
    endpoint?: string;
  };
}

export const APP_ENV = Symbol('APP_ENV');

function required(source: NodeJS.ProcessEnv, key: string): string {
  const value = source[key]?.trim();
  if (!value) throw new Error(`Environment variable ${key} is required`);
  return value;
}

function optional(source: NodeJS.ProcessEnv, key: string): string | undefined {
  const value = source[key]?.trim();
  return value ? value : undefined;
}

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  const nodeEnv = optional(source, 'NODE_ENV') ?? 'development';
  const isProduction = nodeEnv === 'production';

  const jwtSecret = required(source, 'JWT_SECRET');
  const jwtRefreshSecret = required(source, 'JWT_REFRESH_SECRET');
  if (jwtSecret.length < 32 || jwtRefreshSecret.length < 32) {
    throw new Error(
      'JWT_SECRET and JWT_REFRESH_SECRET must be at least 32 characters',
    );
  }
  if (jwtSecret === jwtRefreshSecret) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must differ');
  }

  const ipHashSalt = optional(source, 'IP_HASH_SALT');
  if (!ipHashSalt && isProduction) {
    throw new Error('IP_HASH_SALT is required in production');
  }

  const internalApiKey = optional(source, 'INTERNAL_API_KEY');
  if (internalApiKey && internalApiKey.length < 32) {
    throw new Error('INTERNAL_API_KEY must be at least 32 characters');
  }

  return {
    nodeEnv,
    isProduction,
    port: Number(optional(source, 'PORT') ?? 4000),
    databaseUrl: required(source, 'DATABASE_URL'),
    jwtSecret,
    jwtRefreshSecret,
    corsOrigins: (optional(source, 'CORS_ORIGINS') ?? '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    trustProxy: Number(optional(source, 'TRUST_PROXY') ?? 0),
    internalApiKey,
    ipHashSalt: ipHashSalt ?? 'development-only-salt',
    swaggerEnabled: (optional(source, 'SWAGGER_ENABLED') ?? 'true') === 'true',
    s3: {
      region: optional(source, 'AWS_REGION'),
      bucket: optional(source, 'S3_BUCKET'),
      publicBaseUrl: optional(source, 'S3_PUBLIC_BASE_URL')?.replace(
        /\/+$/,
        '',
      ),
      endpoint: optional(source, 'S3_ENDPOINT'),
    },
  };
}
