import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { pageArgs, paginate, Paginated } from '../common/dto/pagination.dto';
import {
  assertDateRange,
  definedOnly,
  nextPreviousSlugs,
  resolvePublishedAt,
  slugify,
  unique,
} from '../common/utils/content';
import { MediaService } from '../media/media.service';
import { SkillsService } from '../skills/skills.service';
import {
  CreateProjectDto,
  ProjectQueryDto,
  ProjectResponse,
  PublicProject,
  PublicProjectQueryDto,
  UpdateProjectDto,
} from './dto/projects.dto';

const include = {
  thumbnail: true,
  ogImage: true,
  gallery: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
  skills: {
    include: { skill: true },
    orderBy: { skill: { sortOrder: 'asc' } },
  },
} satisfies Prisma.ProjectInclude;

type ProjectRow = Prisma.ProjectGetPayload<{ include: typeof include }>;

const ORDER: Prisma.ProjectOrderByWithRelationInput[] = [
  { sortOrder: 'asc' },
  { createdAt: 'desc' },
];

/** Published and not scheduled for the future. */
export const publishedWhere = (): Prisma.ProjectWhereInput => ({
  status: ContentStatus.PUBLISHED,
  OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
});

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
    private readonly skills: SkillsService,
  ) {}

  async list(query: ProjectQueryDto): Promise<Paginated<ProjectResponse>> {
    const where: Prisma.ProjectWhereInput = {
      status: query.status,
      featured: query.featured,
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { summary: { contains: query.q, mode: 'insensitive' } },
              { slug: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        include,
        orderBy: ORDER,
        ...pageArgs(query),
      }),
      this.prisma.project.count({ where }),
    ]);
    return paginate(
      rows.map((r) => this.toResponse(r)),
      total,
      query,
    );
  }

  async get(id: string): Promise<ProjectResponse> {
    return this.toResponse(await this.findOrThrow(id));
  }

  async create(
    dto: CreateProjectDto,
    userId: string,
  ): Promise<ProjectResponse> {
    await this.validateRefs(dto);
    assertDateRange(dto.startDate, dto.endDate);
    const { galleryIds, skillIds, ...fields } = dto;

    const row = await this.prisma.project.create({
      data: {
        ...fields,
        slug: dto.slug ?? slugify(dto.title),
        publishedAt:
          resolvePublishedAt(dto.status, null, dto.publishedAt) ?? null,
        createdById: userId,
        updatedById: userId,
        gallery: galleryIds?.length
          ? {
              create: unique(galleryIds).map((mediaId, sortOrder) => ({
                mediaId,
                sortOrder,
              })),
            }
          : undefined,
        skills: skillIds?.length
          ? { create: unique(skillIds).map((skillId) => ({ skillId })) }
          : undefined,
      },
      include,
    });
    return this.toResponse(row);
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
    userId: string,
  ): Promise<ProjectResponse> {
    const current = await this.findOrThrow(id);
    await this.validateRefs(dto);
    assertDateRange(
      dto.startDate === undefined ? current.startDate : dto.startDate,
      dto.endDate === undefined ? current.endDate : dto.endDate,
    );
    const { galleryIds, skillIds, ...fields } = dto;

    // Replacing join rows and updating the project must succeed or fail together.
    const row = await this.prisma.$transaction(async (tx) => {
      if (galleryIds) {
        await tx.projectMedia.deleteMany({ where: { projectId: id } });
        await tx.projectMedia.createMany({
          data: unique(galleryIds).map((mediaId, sortOrder) => ({
            projectId: id,
            mediaId,
            sortOrder,
          })),
        });
      }
      if (skillIds) {
        await tx.projectSkill.deleteMany({ where: { projectId: id } });
        await tx.projectSkill.createMany({
          data: unique(skillIds).map((skillId) => ({ projectId: id, skillId })),
        });
      }
      return tx.project.update({
        where: { id },
        data: definedOnly({
          ...fields,
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
    });
    return this.toResponse(row);
  }

  async remove(id: string): Promise<void> {
    await this.findOrThrow(id);
    await this.prisma.project.delete({ where: { id } });
  }

  async publicList(
    query: PublicProjectQueryDto,
  ): Promise<Paginated<PublicProject>> {
    const where: Prisma.ProjectWhereInput = {
      ...publishedWhere(),
      featured: query.featured,
      ...(query.skill
        ? { skills: { some: { skill: { slug: query.skill } } } }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        include,
        orderBy: ORDER,
        ...pageArgs(query),
      }),
      this.prisma.project.count({ where }),
    ]);
    return paginate(
      rows.map((r) => this.toPublic(r)),
      total,
      query,
    );
  }

  /** Current slug first, then a previous slug (callers redirect on mismatch). */
  async publicBySlug(slug: string): Promise<PublicProject> {
    const row =
      (await this.prisma.project.findFirst({
        where: { slug, ...publishedWhere() },
        include,
      })) ??
      (await this.prisma.project.findFirst({
        where: { previousSlugs: { has: slug }, ...publishedWhere() },
        include,
      }));
    if (!row) throw new NotFoundException('Project not found');
    return this.toPublic(row);
  }

  async publicSlugs() {
    return this.prisma.project.findMany({
      where: publishedWhere(),
      select: { slug: true, updatedAt: true },
      orderBy: ORDER,
    });
  }

  private async validateRefs(dto: UpdateProjectDto) {
    await this.media.assertUsable([
      dto.thumbnailId,
      dto.ogImageId,
      ...(dto.galleryIds ?? []),
    ]);
    await this.skills.assertExist(dto.skillIds);
  }

  private async findOrThrow(id: string): Promise<ProjectRow> {
    const row = await this.prisma.project.findUnique({
      where: { id },
      include,
    });
    if (!row) throw new NotFoundException('Project not found');
    return row;
  }

  private toResponse(row: ProjectRow): ProjectResponse {
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      summary: row.summary,
      body: row.body,
      role: row.role,
      liveUrl: row.liveUrl,
      repoUrl: row.repoUrl,
      startDate: row.startDate,
      endDate: row.endDate,
      featured: row.featured,
      sortOrder: row.sortOrder,
      status: row.status,
      publishedAt: row.publishedAt,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      thumbnail: this.media.toRef(row.thumbnail),
      ogImage: this.media.toRef(row.ogImage),
      gallery: row.gallery.map((g) => this.media.toRef(g.media)),
      skills: row.skills.map(({ skill }) => ({
        id: skill.id,
        name: skill.name,
        slug: skill.slug,
      })),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toPublic(row: ProjectRow): PublicProject {
    const {
      status: _status,
      createdAt: _createdAt,
      ...rest
    } = this.toResponse(row);
    return rest;
  }
}
