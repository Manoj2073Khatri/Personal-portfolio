import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { APP_ENV, AppEnv } from '../src/config/env';
import { PrismaService } from '../src/infra/prisma/prisma.service';
import {
  PresignedUpload,
  StorageService,
  StoredObjectInfo,
} from '../src/infra/storage/storage.service';

/** In-memory stand-in for S3. Tests "upload" by calling `put`. */
export class FakeStorage extends StorageService {
  readonly objects = new Map<string, StoredObjectInfo>();
  readonly deleted: string[] = [];

  isConfigured() {
    return true;
  }
  createPresignedUpload(
    key: string,
    contentType: string,
  ): Promise<PresignedUpload> {
    return Promise.resolve({
      url: 'https://fake-s3.test/upload',
      fields: { key, 'Content-Type': contentType },
      expiresInSeconds: 300,
    });
  }
  headObject(key: string) {
    return Promise.resolve(this.objects.get(key) ?? null);
  }
  deleteObject(key: string) {
    this.objects.delete(key);
    this.deleted.push(key);
    return Promise.resolve();
  }
  publicUrl(key: string) {
    return `https://cdn.test/${key}`;
  }
  put(key: string, info: StoredObjectInfo) {
    this.objects.set(key, info);
  }
}

export interface TestContext {
  app: NestExpressApplication;
  prisma: PrismaService;
  storage: FakeStorage;
  env: AppEnv;
}

export async function createTestApp(): Promise<TestContext> {
  const storage = new FakeStorage();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(StorageService)
    .useValue(storage)
    .compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>();
  const env = app.get<AppEnv>(APP_ENV);
  configureApp(app, env);
  await app.init();
  return { app, prisma: app.get(PrismaService), storage, env };
}

const TABLES = [
  'ProjectMedia',
  'ProjectSkill',
  'ExperienceSkill',
  'Project',
  'Article',
  'Experience',
  'Credential',
  'Testimonial',
  'Skill',
  'SkillCategory',
  'SiteSettings',
  'ContactSubmission',
  'Media',
  'User',
];

export async function resetDatabase(prisma: PrismaService) {
  await prisma.$executeRawUnsafe(
    `TRUNCATE ${TABLES.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`,
  );
}

export const ADMIN = {
  email: 'admin@e2e.test',
  password: 'e2e-admin-password',
};

export async function createUser(
  prisma: PrismaService,
  role: Role = Role.ADMIN,
  email = ADMIN.email,
) {
  return prisma.user.create({
    data: {
      email,
      name: 'E2E Admin',
      role,
      password: await bcrypt.hash(ADMIN.password, 4),
    },
  });
}

/**
 * Requests marked as coming from the trusted Next.js server without a client
 * IP skip rate limiting, so suites can log in repeatedly.
 */
export function api(ctx: TestContext) {
  const agent = request(ctx.app.getHttpServer());
  const key = ctx.env.internalApiKey!;
  const wrap = <T extends request.Test>(t: T) =>
    t.set('x-internal-api-key', key);
  return {
    get: (url: string) => wrap(agent.get(`/api/v1${url}`)),
    post: (url: string) => wrap(agent.post(`/api/v1${url}`)),
    patch: (url: string) => wrap(agent.patch(`/api/v1${url}`)),
    delete: (url: string) => wrap(agent.delete(`/api/v1${url}`)),
    raw: agent,
  };
}

export async function loginAsAdmin(ctx: TestContext): Promise<string> {
  const res = await api(ctx).post('/auth/login').send(ADMIN).expect(200);
  return (res.body as { accessToken: string }).accessToken;
}
