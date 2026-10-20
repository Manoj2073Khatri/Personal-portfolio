import { Role } from '@prisma/client';
import {
  ADMIN,
  api,
  createTestApp,
  createUser,
  resetDatabase,
  TestContext,
} from './helpers';

describe('Auth & authorization (e2e)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
  });
  beforeEach(async () => {
    await resetDatabase(ctx.prisma);
    await createUser(ctx.prisma);
  });
  afterAll(async () => {
    await ctx.app.close();
  });

  it('logs in and returns tokens without the password hash', async () => {
    const res = await api(ctx).post('/auth/login').send(ADMIN).expect(200);
    expect(res.body).toMatchObject({
      accessTokenExpiresIn: 900,
      user: { email: ADMIN.email, role: 'ADMIN' },
    });
    expect(JSON.stringify(res.body)).not.toContain('password');
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('rejects bad credentials with a generic 401', async () => {
    const wrong = await api(ctx)
      .post('/auth/login')
      .send({ ...ADMIN, password: 'nope' })
      .expect(401);
    const unknown = await api(ctx)
      .post('/auth/login')
      .send({ email: 'x@e2e.test', password: 'nope' })
      .expect(401);
    expect(wrong.body.message).toBe(unknown.body.message);
  });

  it('validates the login payload', async () => {
    const res = await api(ctx)
      .post('/auth/login')
      .send({ email: 'not-an-email' })
      .expect(400);
    expect(Object.keys(res.body.errors)).toEqual(
      expect.arrayContaining(['email', 'password']),
    );
  });

  it('has no public registration endpoint', async () => {
    await api(ctx).post('/auth/signup').send(ADMIN).expect(404);
    await api(ctx).post('/auth/register').send(ADMIN).expect(404);
  });

  it('requires a token for admin routes', async () => {
    await api(ctx).get('/admin/projects').expect(401);
    await api(ctx)
      .get('/admin/projects')
      .set('authorization', 'Bearer garbage')
      .expect(401);
  });

  it('forbids non-admin users even with a valid-looking token', async () => {
    await createUser(ctx.prisma, Role.USER, 'user@e2e.test');
    // Non-admins cannot obtain tokens at all.
    await api(ctx)
      .post('/auth/login')
      .send({ email: 'user@e2e.test', password: ADMIN.password })
      .expect(401);
  });

  it('rejects refresh tokens used as access tokens', async () => {
    const { body } = await api(ctx).post('/auth/login').send(ADMIN).expect(200);
    await api(ctx)
      .get('/admin/stats')
      .set('authorization', `Bearer ${body.refreshToken}`)
      .expect(401);
    await api(ctx)
      .get('/admin/stats')
      .set('authorization', `Bearer ${body.accessToken}`)
      .expect(200);
  });

  it('rotates refresh tokens, rejects reuse, and revokes on logout', async () => {
    const first = (await api(ctx).post('/auth/login').send(ADMIN)).body;
    const second = (
      await api(ctx)
        .post('/auth/refresh')
        .send({ refreshToken: first.refreshToken })
        .expect(200)
    ).body;
    await api(ctx)
      .post('/auth/refresh')
      .send({ refreshToken: first.refreshToken })
      .expect(401);

    await api(ctx)
      .post('/auth/logout')
      .set('authorization', `Bearer ${second.accessToken}`)
      .expect(204);
    await api(ctx)
      .post('/auth/refresh')
      .send({ refreshToken: second.refreshToken })
      .expect(401);
  });

  it('cuts off access immediately when the user is deleted', async () => {
    const { body } = await api(ctx).post('/auth/login').send(ADMIN);
    await ctx.prisma.user.deleteMany();
    await api(ctx)
      .get('/auth/me')
      .set('authorization', `Bearer ${body.accessToken}`)
      .expect(401);
  });

  it('rate limits login attempts per client IP', async () => {
    const attempt = () =>
      api(ctx)
        .post('/auth/login')
        .set('x-client-ip', '203.0.113.7')
        .send({ ...ADMIN, password: 'wrong' });
    for (let i = 0; i < 5; i++) await attempt().expect(401);
    await attempt().expect(429);
    // A different client is unaffected.
    await api(ctx)
      .post('/auth/login')
      .set('x-client-ip', '203.0.113.8')
      .send(ADMIN)
      .expect(200);
  });

  it('only trusts the forwarded IP header when the internal key is present', async () => {
    const spoof = () =>
      api(ctx)
        .raw.post('/api/v1/auth/login')
        .set('x-client-ip', `198.51.100.${Math.floor(Math.random() * 250)}`)
        .send({ ...ADMIN, password: 'x' });
    // Without the key every request counts against the real socket IP, so rotating the header doesn't help.
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) statuses.push((await spoof()).status);
    expect(statuses).toContain(429);
  });
});
