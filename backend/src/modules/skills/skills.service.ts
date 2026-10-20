import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ContentStatus,
  Media,
  Prisma,
  Skill,
  SkillCategory,
} from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { pageArgs, paginate, Paginated } from '../common/dto/pagination.dto';
import { definedOnly, slugify } from '../common/utils/content';
import { MediaService } from '../media/media.service';
import {
  CreateSkillCategoryDto,
  CreateSkillDto,
  PublicSkillGroup,
  SkillCategoryResponse,
  SkillQueryDto,
  SkillResponse,
  UpdateSkillCategoryDto,
  UpdateSkillDto,
} from './dto/skills.dto';

type SkillRow = Skill & { category: SkillCategory; icon: Media | null };

@Injectable()
export class SkillsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
  ) {}

  // ---- Categories -------------------------------------------------------

  async listCategories(): Promise<SkillCategoryResponse[]> {
    const rows = await this.prisma.skillCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { skills: true } } },
    });
    return rows.map(({ _count, ...c }) => ({
      ...this.toCategory(c),
      skillCount: _count.skills,
    }));
  }

  async createCategory(
    dto: CreateSkillCategoryDto,
  ): Promise<SkillCategoryResponse> {
    const row = await this.prisma.skillCategory.create({
      data: { ...dto, slug: dto.slug ?? slugify(dto.name) },
    });
    return this.toCategory(row);
  }

  async updateCategory(
    id: string,
    dto: UpdateSkillCategoryDto,
  ): Promise<SkillCategoryResponse> {
    await this.findCategoryOrThrow(id);
    const row = await this.prisma.skillCategory.update({
      where: { id },
      data: definedOnly({ ...dto }),
    });
    return this.toCategory(row);
  }

  async removeCategory(id: string): Promise<void> {
    await this.findCategoryOrThrow(id);
    const count = await this.prisma.skill.count({ where: { categoryId: id } });
    if (count)
      throw new ConflictException(`Category still has ${count} skill(s)`);
    await this.prisma.skillCategory.delete({ where: { id } });
  }

  // ---- Skills -----------------------------------------------------------

  async list(query: SkillQueryDto): Promise<Paginated<SkillResponse>> {
    const where: Prisma.SkillWhereInput = {
      categoryId: query.categoryId,
      status: query.status,
      ...(query.q ? { name: { contains: query.q, mode: 'insensitive' } } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.skill.findMany({
        where,
        include: { category: true, icon: true },
        orderBy: [
          { category: { sortOrder: 'asc' } },
          { sortOrder: 'asc' },
          { name: 'asc' },
        ],
        ...pageArgs(query),
      }),
      this.prisma.skill.count({ where }),
    ]);
    return paginate(
      rows.map((r) => this.toResponse(r)),
      total,
      query,
    );
  }

  async get(id: string): Promise<SkillResponse> {
    const row = await this.prisma.skill.findUnique({
      where: { id },
      include: { category: true, icon: true },
    });
    if (!row) throw new NotFoundException('Skill not found');
    return this.toResponse(row);
  }

  async create(dto: CreateSkillDto, userId: string): Promise<SkillResponse> {
    await this.findCategoryOrThrow(dto.categoryId);
    await this.media.assertUsable([dto.iconId]);
    const row = await this.prisma.skill.create({
      data: {
        ...dto,
        slug: dto.slug ?? slugify(dto.name),
        createdById: userId,
        updatedById: userId,
      },
      include: { category: true, icon: true },
    });
    return this.toResponse(row);
  }

  async update(
    id: string,
    dto: UpdateSkillDto,
    userId: string,
  ): Promise<SkillResponse> {
    await this.get(id);
    if (dto.categoryId) await this.findCategoryOrThrow(dto.categoryId);
    await this.media.assertUsable([dto.iconId]);
    const row = await this.prisma.skill.update({
      where: { id },
      data: definedOnly({ ...dto, updatedById: userId }),
      include: { category: true, icon: true },
    });
    return this.toResponse(row);
  }

  async remove(id: string): Promise<void> {
    await this.get(id);
    await this.prisma.skill.delete({ where: { id } });
  }

  /** Validates skill references used by projects and experience. */
  async assertExist(ids: string[] | undefined): Promise<void> {
    if (!ids?.length) return;
    const unique = [...new Set(ids)];
    const count = await this.prisma.skill.count({
      where: { id: { in: unique } },
    });
    if (count !== unique.length)
      throw new BadRequestException('One or more skillIds do not exist');
  }

  async publicGroups(): Promise<PublicSkillGroup[]> {
    const categories = await this.prisma.skillCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        skills: {
          where: { status: ContentStatus.PUBLISHED },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          include: { icon: true },
        },
      },
    });
    return categories
      .filter((c) => c.skills.length)
      .map(({ skills, ...category }) => ({
        category: this.toCategory(category),
        skills: skills.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          proficiency: s.proficiency,
          sortOrder: s.sortOrder,
          icon: this.media.toRef(s.icon),
        })),
      }));
  }

  private toCategory(c: SkillCategory): SkillCategoryResponse {
    return { id: c.id, name: c.name, slug: c.slug, sortOrder: c.sortOrder };
  }

  private toResponse(row: SkillRow): SkillResponse {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      proficiency: row.proficiency,
      sortOrder: row.sortOrder,
      status: row.status,
      category: this.toCategory(row.category),
      icon: this.media.toRef(row.icon),
      updatedAt: row.updatedAt,
    };
  }

  private async findCategoryOrThrow(id: string) {
    const row = await this.prisma.skillCategory.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Skill category not found');
    return row;
  }
}
