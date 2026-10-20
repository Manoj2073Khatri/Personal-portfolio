import {
  api,
  createTestApp,
  createUser,
  loginAsAdmin,
  resetDatabase,
  TestContext,
} from './helpers';

describe('Media & contact (e2e)', () => {
  let ctx: TestContext;
  let token: string;
  const auth = () => ({ authorization: `Bearer ${token}` });

  beforeAll(async () => {
    ctx = await createTestApp();
  });
  beforeEach(async () => {
    await resetDatabase(ctx.prisma);
    await createUser(ctx.prisma);
    token = await loginAsAdmin(ctx);
  });
  afterAll(async () => {
    await ctx.app.close();
  });

  describe('media uploads', () => {
    const intent = (body: object) =>
      api(ctx).post('/admin/media/uploads').set(auth()).send(body);

    it('creates a pending record with a server-generated key and presigned POST', async () => {
      const res = await intent({
        filename: '../../etc/passwd.png',
        mimeType: 'image/png',
        size: 2048,
        alt: 'Screenshot',
      }).expect(201);
      expect(res.body.media.status).toBe('PENDING');
      expect(res.body.media.filename).not.toContain('/');
      expect(res.body.fields.key).toMatch(
        /^media\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.png$/,
      );
      expect(res.body.uploadUrl).toBe('https://fake-s3.test/upload');
    });

    it('rejects disallowed types and oversized files', async () => {
      await intent({
        filename: 'x.svg',
        mimeType: 'image/svg+xml',
        size: 10,
      }).expect(400);
      await intent({
        filename: 'x.exe',
        mimeType: 'application/x-msdownload',
        size: 10,
      }).expect(400);
      await intent({
        filename: 'x.png',
        mimeType: 'image/png',
        size: 11 * 1024 * 1024,
      }).expect(400);
    });

    it('confirms an upload only when the stored object matches', async () => {
      const ok = (
        await intent({ filename: 'a.png', mimeType: 'image/png', size: 100 })
      ).body;
      await api(ctx)
        .post(`/admin/media/${ok.media.id}/confirm`)
        .set(auth())
        .expect(400); // nothing uploaded yet

      ctx.storage.put(ok.fields.key, { size: 100, contentType: 'image/png' });
      const confirmed = await api(ctx)
        .post(`/admin/media/${ok.media.id}/confirm`)
        .set(auth())
        .expect(200);
      expect(confirmed.body).toMatchObject({
        status: 'READY',
        url: `https://cdn.test/${ok.fields.key}`,
      });

      const bad = (
        await intent({ filename: 'b.png', mimeType: 'image/png', size: 100 })
      ).body;
      ctx.storage.put(bad.fields.key, { size: 100, contentType: 'text/html' });
      await api(ctx)
        .post(`/admin/media/${bad.media.id}/confirm`)
        .set(auth())
        .expect(400);
      expect(ctx.storage.deleted).toContain(bad.fields.key);
      await api(ctx)
        .get(`/admin/media/${bad.media.id}`)
        .set(auth())
        .expect(404);
    });

    it('refuses pending media as a content reference', async () => {
      const pending = (
        await intent({ filename: 'a.png', mimeType: 'image/png', size: 100 })
      ).body;
      await api(ctx)
        .post('/admin/projects')
        .set(auth())
        .send({ title: 'P', thumbnailId: pending.media.id })
        .expect(400);
    });

    it('registers HTTPS external images only', async () => {
      await api(ctx)
        .post('/admin/media/external')
        .set(auth())
        .send({ url: 'http://example.com/a.png' })
        .expect(400);
      await api(ctx)
        .post('/admin/media/external')
        .set(auth())
        .send({ url: 'javascript:alert(1)' })
        .expect(400);
      const res = await api(ctx)
        .post('/admin/media/external')
        .set(auth())
        .send({ url: 'https://example.com/a.webp', alt: 'A' })
        .expect(201);
      expect(res.body).toMatchObject({
        external: true,
        status: 'READY',
        mimeType: 'image/webp',
      });
    });

    it('blocks deleting media that is in use and deletes the object otherwise', async () => {
      const m = (
        await intent({ filename: 'a.png', mimeType: 'image/png', size: 100 })
      ).body;
      ctx.storage.put(m.fields.key, { size: 100, contentType: 'image/png' });
      await api(ctx)
        .post(`/admin/media/${m.media.id}/confirm`)
        .set(auth())
        .expect(200);
      const project = await api(ctx)
        .post('/admin/projects')
        .set(auth())
        .send({ title: 'P', thumbnailId: m.media.id })
        .expect(201);

      const blocked = await api(ctx)
        .delete(`/admin/media/${m.media.id}`)
        .set(auth())
        .expect(409);
      expect(blocked.body.usage.projectThumbnail).toBe(1);

      await api(ctx)
        .patch(`/admin/projects/${project.body.id}`)
        .set(auth())
        .send({ thumbnailId: null })
        .expect(200);
      await api(ctx)
        .delete(`/admin/media/${m.media.id}`)
        .set(auth())
        .expect(204);
      expect(ctx.storage.deleted).toContain(m.fields.key);
    });
  });

  describe('contact submissions', () => {
    // A fresh client IP per call, so the per-IP limit only applies where a test pins one.
    let nextIp = 10;
    const submit = (body: object, ip = `192.0.2.${nextIp++}`) =>
      api(ctx).post('/public/contact').set('x-client-ip', ip).send(body);

    it('stores valid messages with a hashed IP and never exposes them publicly', async () => {
      await submit({
        name: 'Ada',
        email: 'ADA@Example.com',
        message: 'Hello there, nice work!',
      }).expect(202);
      const rows = await ctx.prisma.contactSubmission.findMany();
      expect(rows).toHaveLength(1);
      expect(rows[0].email).toBe('ada@example.com');
      expect(rows[0].ipHash).toMatch(/^[a-f0-9]{64}$/);
      expect(rows[0].ipHash).not.toContain('192.0.2.10');

      await api(ctx).get('/admin/contact-submissions').expect(401);
      const list = await api(ctx)
        .get('/admin/contact-submissions')
        .set(auth())
        .expect(200);
      expect(list.body.data[0]).not.toHaveProperty('ipHash');
    });

    it('accepts but silently drops honeypot submissions', async () => {
      await submit({
        name: 'Bot',
        email: 'b@b.io',
        message: 'cheap stuff here',
        website: 'spam.example',
      }).expect(202);
      expect(await ctx.prisma.contactSubmission.count()).toBe(0);
    });

    it('validates input', async () => {
      const res = await submit({
        name: '',
        email: 'nope',
        message: 'short',
      }).expect(400);
      expect(Object.keys(res.body.errors)).toEqual(
        expect.arrayContaining(['name', 'email', 'message']),
      );
    });

    it('rate limits submissions per client', async () => {
      const body = {
        name: 'Ada',
        email: 'a@example.com',
        message: 'Hello hello hello',
      };
      for (let i = 0; i < 3; i++) await submit(body, '192.0.2.50').expect(202);
      await submit(body, '192.0.2.50').expect(429);
    });

    it('lets the admin triage and delete messages', async () => {
      await submit({
        name: 'Ada',
        email: 'a@example.com',
        message: 'Hello hello hello',
      }).expect(202);
      const [msg] = (
        await api(ctx).get('/admin/contact-submissions').set(auth())
      ).body.data;
      await api(ctx)
        .patch(`/admin/contact-submissions/${msg.id}`)
        .set(auth())
        .send({ status: 'READ' })
        .expect(200);
      const filtered = await api(ctx)
        .get('/admin/contact-submissions?status=NEW')
        .set(auth())
        .expect(200);
      expect(filtered.body.meta.total).toBe(0);
      await api(ctx)
        .delete(`/admin/contact-submissions/${msg.id}`)
        .set(auth())
        .expect(204);
    });
  });

  it('health check reports the database', async () => {
    const res = await api(ctx).get('/health').expect(200);
    expect(res.body).toEqual({ status: 'ok', database: 'up' });
  });
});
