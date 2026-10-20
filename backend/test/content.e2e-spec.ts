import {
  api,
  createTestApp,
  createUser,
  loginAsAdmin,
  resetDatabase,
  TestContext,
} from './helpers';

describe('CMS content (e2e)', () => {
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

  describe('projects', () => {
    it('supports full CRUD with a derived slug', async () => {
      const created = await api(ctx)
        .post('/admin/projects')
        .set(auth())
        .send({ title: 'My First Project', summary: 'A thing' })
        .expect(201);
      expect(created.body).toMatchObject({
        slug: 'my-first-project',
        status: 'DRAFT',
        publishedAt: null,
      });

      const id = created.body.id as string;
      await api(ctx).get(`/admin/projects/${id}`).set(auth()).expect(200);

      const updated = await api(ctx)
        .patch(`/admin/projects/${id}`)
        .set(auth())
        .send({ summary: 'Updated', liveUrl: 'https://example.com' })
        .expect(200);
      expect(updated.body).toMatchObject({
        summary: 'Updated',
        liveUrl: 'https://example.com',
        title: 'My First Project',
      });

      const cleared = await api(ctx)
        .patch(`/admin/projects/${id}`)
        .set(auth())
        .send({ liveUrl: null })
        .expect(200);
      expect(cleared.body.liveUrl).toBeNull();

      await api(ctx).delete(`/admin/projects/${id}`).set(auth()).expect(204);
      await api(ctx).get(`/admin/projects/${id}`).set(auth()).expect(404);
    });

    it('rejects invalid input with per-field errors', async () => {
      const res = await api(ctx)
        .post('/admin/projects')
        .set(auth())
        .send({
          title: '',
          slug: 'Bad Slug',
          liveUrl: 'javascript:alert(1)',
          status: 'LIVE',
          unknownField: 1,
          thumbnailId: 'nope',
        })
        .expect(400);
      expect(Object.keys(res.body.errors)).toEqual(
        expect.arrayContaining([
          'title',
          'slug',
          'liveUrl',
          'status',
          'unknownField',
          'thumbnailId',
        ]),
      );
    });

    it('rejects null for non-nullable fields instead of failing in the database', async () => {
      const res = await api(ctx)
        .post('/admin/projects')
        .set(auth())
        .send({ title: 'X', summary: null, featured: null })
        .expect(400);
      expect(Object.keys(res.body.errors)).toEqual(
        expect.arrayContaining(['summary', 'featured']),
      );
    });

    it('returns 409 for duplicate slugs and 404 for unknown or malformed ids', async () => {
      await api(ctx)
        .post('/admin/projects')
        .set(auth())
        .send({ title: 'Dup', slug: 'dup' })
        .expect(201);
      await api(ctx)
        .post('/admin/projects')
        .set(auth())
        .send({ title: 'Dup 2', slug: 'dup' })
        .expect(409);
      await api(ctx)
        .get('/admin/projects/00000000-0000-4000-8000-000000000000')
        .set(auth())
        .expect(404);
      await api(ctx).get('/admin/projects/not-a-uuid').set(auth()).expect(400);
    });

    it('rejects references to missing skills or media', async () => {
      await api(ctx)
        .post('/admin/projects')
        .set(auth())
        .send({
          title: 'Refs',
          skillIds: ['00000000-0000-4000-8000-000000000000'],
        })
        .expect(400);
      await api(ctx)
        .post('/admin/projects')
        .set(auth())
        .send({
          title: 'Refs',
          thumbnailId: '00000000-0000-4000-8000-000000000000',
        })
        .expect(400);
    });

    it('rejects an end date before the start date', async () => {
      await api(ctx)
        .post('/admin/projects')
        .set(auth())
        .send({
          title: 'Dates',
          startDate: '2024-05-01',
          endDate: '2024-01-01',
        })
        .expect(400);
    });

    it('paginates admin lists with metadata and search', async () => {
      for (let i = 0; i < 5; i++) {
        await api(ctx)
          .post('/admin/projects')
          .set(auth())
          .send({ title: `Item ${i}`, sortOrder: i })
          .expect(201);
      }
      const page = await api(ctx)
        .get('/admin/projects?page=2&limit=2')
        .set(auth())
        .expect(200);
      expect(page.body.meta).toEqual({
        page: 2,
        limit: 2,
        total: 5,
        totalPages: 3,
      });
      expect(page.body.data.map((p: { title: string }) => p.title)).toEqual([
        'Item 2',
        'Item 3',
      ]);

      const search = await api(ctx)
        .get('/admin/projects?q=item%204')
        .set(auth())
        .expect(200);
      expect(search.body.meta.total).toBe(1);

      await api(ctx).get('/admin/projects?limit=1000').set(auth()).expect(400);
    });
  });

  describe('public API', () => {
    it('exposes only published content and strips workflow fields', async () => {
      await api(ctx)
        .post('/admin/projects')
        .set(auth())
        .send({ title: 'Draft one' })
        .expect(201);
      await api(ctx)
        .post('/admin/projects')
        .set(auth())
        .send({ title: 'Live one', status: 'PUBLISHED' })
        .expect(201);
      await api(ctx)
        .post('/admin/projects')
        .set(auth())
        .send({ title: 'Archived', status: 'ARCHIVED' })
        .expect(201);

      const list = await api(ctx).get('/public/projects').expect(200);
      expect(list.body.data.map((p: { title: string }) => p.title)).toEqual([
        'Live one',
      ]);
      expect(list.body.data[0]).not.toHaveProperty('status');
      expect(list.body.data[0]).not.toHaveProperty('createdById');

      await api(ctx).get('/public/projects/draft-one').expect(404);
      await api(ctx).get('/public/projects/live-one').expect(200);
      await api(ctx).get('/public/projects/Not%20A%20Slug').expect(404);
    });

    it('hides scheduled articles until their publish date', async () => {
      const future = new Date(Date.now() + 86_400_000).toISOString();
      await api(ctx)
        .post('/admin/articles')
        .set(auth())
        .send({ title: 'Later', status: 'PUBLISHED', publishedAt: future })
        .expect(201);
      await api(ctx)
        .post('/admin/articles')
        .set(auth())
        .send({ title: 'Now', status: 'PUBLISHED', body: 'word '.repeat(500) })
        .expect(201);

      const list = await api(ctx).get('/public/articles').expect(200);
      expect(list.body.data.map((a: { title: string }) => a.title)).toEqual([
        'Now',
      ]);
      expect(list.body.data[0].readingTimeMinutes).toBe(2);
      await api(ctx).get('/public/articles/later').expect(404);
    });

    it('keeps old slugs resolvable after a published article is renamed', async () => {
      const { body } = await api(ctx)
        .post('/admin/articles')
        .set(auth())
        .send({ title: 'Original Title', status: 'PUBLISHED' })
        .expect(201);
      await api(ctx)
        .patch(`/admin/articles/${body.id}`)
        .set(auth())
        .send({ slug: 'renamed' })
        .expect(200);

      const viaOld = await api(ctx)
        .get('/public/articles/original-title')
        .expect(200);
      expect(viaOld.body.slug).toBe('renamed');
      await api(ctx).get('/public/articles/renamed').expect(200);
    });

    it('leaves noIndex articles out of the sitemap but still serves them', async () => {
      await api(ctx)
        .post('/admin/articles')
        .set(auth())
        .send({ title: 'Hidden', status: 'PUBLISHED', noIndex: true })
        .expect(201);
      await api(ctx)
        .post('/admin/articles')
        .set(auth())
        .send({ title: 'Visible', status: 'PUBLISHED' })
        .expect(201);
      const sitemap = await api(ctx).get('/public/sitemap').expect(200);
      expect(
        sitemap.body.articles.map((a: { slug: string }) => a.slug),
      ).toEqual(['visible']);
      const hidden = await api(ctx).get('/public/articles/hidden').expect(200);
      expect(hidden.body.noIndex).toBe(true);
    });

    it('home aggregates published sections and works with an empty CMS', async () => {
      const empty = await api(ctx).get('/public/home').expect(200);
      expect(empty.body).toMatchObject({
        projects: [],
        articles: [],
        skills: [],
        experience: [],
        education: [],
        testimonials: [],
      });
      expect(empty.body.settings.homepageSections.length).toBeGreaterThan(0);

      const cat = await api(ctx)
        .post('/admin/skill-categories')
        .set(auth())
        .send({ name: 'Frontend' })
        .expect(201);
      await api(ctx)
        .post('/admin/skills')
        .set(auth())
        .send({ name: 'React', categoryId: cat.body.id })
        .expect(201);
      await api(ctx)
        .post('/admin/skills')
        .set(auth())
        .send({ name: 'Secret', categoryId: cat.body.id, status: 'DRAFT' })
        .expect(201);
      await api(ctx)
        .post('/admin/skill-categories')
        .set(auth())
        .send({ name: 'Empty' })
        .expect(201);
      await api(ctx)
        .post('/admin/experiences')
        .set(auth())
        .send({
          company: 'Acme',
          role: 'Dev',
          startDate: '2023-01-01',
          isCurrent: true,
        })
        .expect(201);

      const home = await api(ctx).get('/public/home').expect(200);
      expect(home.body.skills).toHaveLength(1);
      expect(
        home.body.skills[0].skills.map((s: { name: string }) => s.name),
      ).toEqual(['React']);
      expect(home.body.experience[0]).toMatchObject({
        company: 'Acme',
        isCurrent: true,
        endDate: null,
      });
    });

    it('skips disabled homepage sections', async () => {
      await api(ctx)
        .post('/admin/projects')
        .set(auth())
        .send({ title: 'P', status: 'PUBLISHED' })
        .expect(201);
      await api(ctx)
        .patch('/admin/settings')
        .set(auth())
        .send({
          name: 'Me',
          homepageSections: [{ key: 'projects', enabled: false }],
        })
        .expect(200);
      const home = await api(ctx).get('/public/home').expect(200);
      expect(home.body.projects).toEqual([]);
    });
  });

  describe('validation of related rules', () => {
    it('rejects a current role with an end date', async () => {
      await api(ctx)
        .post('/admin/experiences')
        .set(auth())
        .send({
          company: 'A',
          role: 'B',
          startDate: '2023-01-01',
          isCurrent: true,
          endDate: '2024-01-01',
        })
        .expect(400);
    });

    it('blocks deleting a skill category that still has skills', async () => {
      const cat = await api(ctx)
        .post('/admin/skill-categories')
        .set(auth())
        .send({ name: 'Tools' })
        .expect(201);
      await api(ctx)
        .post('/admin/skills')
        .set(auth())
        .send({ name: 'Git', categoryId: cat.body.id })
        .expect(201);
      await api(ctx)
        .delete(`/admin/skill-categories/${cat.body.id}`)
        .set(auth())
        .expect(409);
    });

    it('validates settings links and rejects duplicate sections', async () => {
      const bad = await api(ctx)
        .patch('/admin/settings')
        .set(auth())
        .send({
          socialLinks: [
            { platform: 'myspace', label: 'x', url: 'javascript:1' },
          ],
          navigation: [{ label: 'x', href: '//evil.com' }],
        })
        .expect(400);
      expect(Object.keys(bad.body.errors).join(' ')).toMatch(
        /socialLinks\.0\.platform/,
      );
      expect(Object.keys(bad.body.errors).join(' ')).toMatch(
        /navigation\.0\.href/,
      );

      await api(ctx)
        .patch('/admin/settings')
        .set(auth())
        .send({
          homepageSections: [
            { key: 'skills', enabled: true },
            { key: 'skills', enabled: false },
          ],
        })
        .expect(400);
    });
  });

  it('reports dashboard stats', async () => {
    await api(ctx)
      .post('/admin/projects')
      .set(auth())
      .send({ title: 'A', status: 'PUBLISHED' })
      .expect(201);
    await api(ctx)
      .post('/admin/projects')
      .set(auth())
      .send({ title: 'B' })
      .expect(201);
    const stats = await api(ctx).get('/admin/stats').set(auth()).expect(200);
    expect(stats.body.projects).toEqual({
      total: 2,
      DRAFT: 1,
      PUBLISHED: 1,
      ARCHIVED: 0,
    });
  });
});
