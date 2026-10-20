import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { pageArgs, paginate, Paginated } from '../common/dto/pagination.dto';
import {
  definedOnly,
  nextPreviousSlugs,
  readingTimeMinutes,
  resolvePublishedAt,
  slugify,
} from '../common/utils/content';
import { MediaService } from '../media/media.service';
import {
  ArticleQueryDto,
  ArticleResponse,
  ArticleSummary,
  CreateArticleDto,
  PublicArticle,
  PublicArticleQueryDto,
  UpdateArticleDto,
} from './dto/articles.dto';

const include = {
  coverImage: true,
  ogImage: true,
  author: { select: { name: true } },
} satisfies Prisma.ArticleInclude;

type ArticleRow = Prisma.ArticleGetPayload<{ include: typeof include }>;

/** Published with a publish date in the past; future dates are scheduled. */
const publishedWhere = (): Prisma.ArticleWhereInput => ({
  status: ContentStatus.PUBLISHED,
  publishedAt: { lte: new Date() },
});

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
  ) {}

  async list(query: ArticleQueryDto): Promise<Paginated<ArticleResponse>> {
    const where: Prisma.ArticleWhereInput = {
      status: query.status,
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { excerpt: { contains: query.q, mode: 'insensitive' } },
              { tags: { has: query.q.toLowerCase() } },
            ],
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where,
        include,
        orderBy: [{ updatedAt: 'desc' }],
        ...pageArgs(query),
      }),
      this.prisma.article.count({ where }),
    ]);
    return paginate(
      rows.map((r) => this.toResponse(r)),
      total,
      query,
    );
  }

  async get(id: string): Promise<ArticleResponse> {
    return this.toResponse(await this.findOrThrow(id));
  }

  async create(
    dto: CreateArticleDto,
    userId: string,
  ): Promise<ArticleResponse> {
    await this.media.assertUsable([dto.coverImageId, dto.ogImageId]);
    const row = await this.prisma.article.create({
      data: {
        ...dto,
        slug: dto.slug ?? slugify(dto.title),
        readingTimeMinutes: readingTimeMinutes(dto.body ?? ''),
        publishedAt:
          resolvePublishedAt(dto.status, null, dto.publishedAt) ?? null,
        authorId: userId,
        createdById: userId,
        updatedById: userId,
      },
      include,
    });
    return this.toResponse(row);
  }

  async update(
    id: string,
    dto: UpdateArticleDto,
    userId: string,
  ): Promise<ArticleResponse> {
    const current = await this.findOrThrow(id);
    await this.media.assertUsable([dto.coverImageId, dto.ogImageId]);
    const row = await this.prisma.article.update({
      where: { id },
      data: definedOnly({
        ...dto,
        readingTimeMinutes:
          dto.body !== undefined ? readingTimeMinutes(dto.body) : undefined,
        previousSlugs: nextPreviousSlugs(current, dto.slug),
        publishedAt: resolvePublishedAt(
          dto.status ?? current.status,
          current.publishedAt,
          dto.publishedAt,
        ),
        updatedById: userId,
      }),
      include,
    });
    return this.toResponse(row);
  }

  async remove(id: string): Promise<void> {
    await this.findOrThrow(id);
    await this.prisma.article.delete({ where: { id } });
  }

  async publicList(
    query: PublicArticleQueryDto,
  ): Promise<Paginated<ArticleSummary>> {
    const where: Prisma.ArticleWhereInput = {
      ...publishedWhere(),
      ...(query.tag ? { tags: { has: query.tag.toLowerCase() } } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where,
        include: { coverImage: true },
        orderBy: { publishedAt: 'desc' },
        ...pageArgs(query),
      }),
      this.prisma.article.count({ where }),
    ]);
    return paginate(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        excerpt: r.excerpt,
        tags: r.tags,
        readingTimeMinutes: r.readingTimeMinutes,
        publishedAt: r.publishedAt,
        coverImage: this.media.toRef(r.coverImage),
        updatedAt: r.updatedAt,
      })),
      total,
      query,
    );
  }

  /**
   * Looks up by current slug, then by a previous slug. Callers compare the
   * returned `slug` with the requested one and redirect when they differ.
   */
  async publicBySlug(slug: string): Promise<PublicArticle> {
    const row =
      (await this.prisma.article.findFirst({
        where: { slug, ...publishedWhere() },
        include,
      })) ??
      (await this.prisma.article.findFirst({
        where: { previousSlugs: { has: slug }, ...publishedWhere() },
        include,
        orderBy: { publishedAt: 'desc' },
      }));
    if (!row) throw new NotFoundException('Article not found');
    const {
      status: _status,
      createdAt: _createdAt,
      ...rest
    } = this.toResponse(row);
    return rest;
  }

  async publicTags(): Promise<{ tag: string; count: number }[]> {
    const rows = await this.prisma.article.findMany({
      where: publishedWhere(),
      select: { tags: true },
    });
    const counts = new Map<string, number>();
    rows
      .flatMap((r) => r.tags)
      .forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1));
    return [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }

  /** Indexable articles only: noIndex ones are left out of the sitemap. */
  async publicSlugs() {
    return this.prisma.article.findMany({
      where: { ...publishedWhere(), noIndex: false },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    });
  }

  private async findOrThrow(id: string): Promise<ArticleRow> {
    const row = await this.prisma.article.findUnique({
      where: { id },
      include,
    });
    if (!row) throw new NotFoundException('Article not found');
    return row;
  }

  private toResponse(row: ArticleRow): ArticleResponse {
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      body: row.body,
      tags: row.tags,
      readingTimeMinutes: row.readingTimeMinutes,
      status: row.status,
      publishedAt: row.publishedAt,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      canonicalUrl: row.canonicalUrl,
      noIndex: row.noIndex,
      coverImage: this.media.toRef(row.coverImage),
      ogImage: this.media.toRef(row.ogImage),
      author: { name: row.author?.name ?? null },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
