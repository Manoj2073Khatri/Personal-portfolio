import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { pageArgs, paginate, Paginated } from '../common/dto/pagination.dto';
import { assertDateRange, definedOnly, unique } from '../common/utils/content';
import { MediaService } from '../media/media.service';
import { SkillsService } from '../skills/skills.service';
import {
  CreateExperienceDto,
  ExperienceQueryDto,
  ExperienceResponse,
  UpdateExperienceDto,
} from './dto/experience.dto';

const include = {
  logo: true,
  skills: {
    include: { skill: true },
    orderBy: { skill: { sortOrder: 'asc' } },
  },
} satisfies Prisma.ExperienceInclude;

type ExperienceRow = Prisma.ExperienceGetPayload<{ include: typeof include }>;

// Current roles first, then most recent; sortOrder lets the admin override.
const ORDER: Prisma.ExperienceOrderByWithRelationInput[] = [
  { sortOrder: 'asc' },
  { isCurrent: 'desc' },
  { startDate: 'desc' },
];

@Injectable()
export class ExperienceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
    private readonly skills: SkillsService,
  ) {}

  async list(
    query: ExperienceQueryDto,
  ): Promise<Paginated<ExperienceResponse>> {
    const where: Prisma.ExperienceWhereInput = {
      status: query.status,
      ...(query.q
        ? {
            OR: [
              { company: { contains: query.q, mode: 'insensitive' } },
              { role: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.experience.findMany({
        where,
        include,
        orderBy: ORDER,
        ...pageArgs(query),
      }),
      this.prisma.experience.count({ where }),
    ]);
    return paginate(
      rows.map((r) => this.toResponse(r)),
      total,
      query,
    );
  }

  async get(id: string): Promise<ExperienceResponse> {
    return this.toResponse(await this.findOrThrow(id));
  }

  async create(
    dto: CreateExperienceDto,
    userId: string,
  ): Promise<ExperienceResponse> {
    this.validateDates(dto.startDate, dto.endDate, dto.isCurrent);
    await this.media.assertUsable([dto.logoId]);
    await this.skills.assertExist(dto.skillIds);
    const { skillIds, ...fields } = dto;
    const row = await this.prisma.experience.create({
      data: {
        ...fields,
        endDate: dto.isCurrent ? null : dto.endDate,
        createdById: userId,
        updatedById: userId,
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
    dto: UpdateExperienceDto,
    userId: string,
  ): Promise<ExperienceResponse> {
    const current = await this.findOrThrow(id);
    const isCurrent = dto.isCurrent ?? current.isCurrent;
    const endDate = isCurrent
      ? null
      : dto.endDate === undefined
        ? current.endDate
        : dto.endDate;
    this.validateDates(dto.startDate ?? current.startDate, endDate, isCurrent);
    await this.media.assertUsable([dto.logoId]);
    await this.skills.assertExist(dto.skillIds);
    const { skillIds, ...fields } = dto;

    const row = await this.prisma.$transaction(async (tx) => {
      if (skillIds) {
        await tx.experienceSkill.deleteMany({ where: { experienceId: id } });
        await tx.experienceSkill.createMany({
          data: unique(skillIds).map((skillId) => ({
            experienceId: id,
            skillId,
          })),
        });
      }
      return tx.experience.update({
        where: { id },
        data: definedOnly({ ...fields, endDate, updatedById: userId }),
        include,
      });
    });
    return this.toResponse(row);
  }

  async remove(id: string): Promise<void> {
    await this.findOrThrow(id);
    await this.prisma.experience.delete({ where: { id } });
  }

  async publicList(): Promise<Omit<ExperienceResponse, 'status'>[]> {
    const rows = await this.prisma.experience.findMany({
      where: { status: ContentStatus.PUBLISHED },
      include,
      orderBy: ORDER,
    });
    return rows.map((r) => {
      const { status: _status, ...rest } = this.toResponse(r);
      return rest;
    });
  }

  private validateDates(
    start: Date,
    end: Date | null | undefined,
    isCurrent?: boolean,
  ) {
    if (isCurrent && end)
      throw new BadRequestException('A current role cannot have an endDate');
    assertDateRange(start, end);
  }

  private async findOrThrow(id: string): Promise<ExperienceRow> {
    const row = await this.prisma.experience.findUnique({
      where: { id },
      include,
    });
    if (!row) throw new NotFoundException('Experience not found');
    return row;
  }

  private toResponse(row: ExperienceRow): ExperienceResponse {
    return {
      id: row.id,
      company: row.company,
      companyUrl: row.companyUrl,
      role: row.role,
      employmentType: row.employmentType,
      location: row.location,
      startDate: row.startDate,
      endDate: row.endDate,
      isCurrent: row.isCurrent,
      summary: row.summary,
      responsibilities: row.responsibilities,
      achievements: row.achievements,
      skills: row.skills.map(({ skill }) => ({
        id: skill.id,
        name: skill.name,
        slug: skill.slug,
      })),
      logo: this.media.toRef(row.logo),
      sortOrder: row.sortOrder,
      status: row.status,
      updatedAt: row.updatedAt,
    };
  }
}
