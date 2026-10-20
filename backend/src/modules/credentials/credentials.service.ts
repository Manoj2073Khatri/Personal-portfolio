import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Credential, Media, Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { pageArgs, paginate, Paginated } from '../common/dto/pagination.dto';
import { assertDateRange, definedOnly } from '../common/utils/content';
import { MediaService } from '../media/media.service';
import {
  CreateCredentialDto,
  CredentialQueryDto,
  CredentialResponse,
  UpdateCredentialDto,
} from './dto/credentials.dto';

type CredentialRow = Credential & { logo: Media | null };

const ORDER: Prisma.CredentialOrderByWithRelationInput[] = [
  { sortOrder: 'asc' },
  { endDate: { sort: 'desc', nulls: 'first' } },
];

@Injectable()
export class CredentialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
  ) {}

  async list(
    query: CredentialQueryDto,
  ): Promise<Paginated<CredentialResponse>> {
    const where: Prisma.CredentialWhereInput = {
      kind: query.kind,
      status: query.status,
      ...(query.q
        ? {
            OR: [
              { institution: { contains: query.q, mode: 'insensitive' } },
              { title: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.credential.findMany({
        where,
        include: { logo: true },
        orderBy: ORDER,
        ...pageArgs(query),
      }),
      this.prisma.credential.count({ where }),
    ]);
    return paginate(
      rows.map((r) => this.toResponse(r)),
      total,
      query,
    );
  }

  async get(id: string): Promise<CredentialResponse> {
    return this.toResponse(await this.findOrThrow(id));
  }

  async create(
    dto: CreateCredentialDto,
    userId: string,
  ): Promise<CredentialResponse> {
    assertDateRange(dto.startDate, dto.endDate);
    await this.media.assertUsable([dto.logoId]);
    const row = await this.prisma.credential.create({
      data: { ...dto, createdById: userId, updatedById: userId },
      include: { logo: true },
    });
    return this.toResponse(row);
  }

  async update(
    id: string,
    dto: UpdateCredentialDto,
    userId: string,
  ): Promise<CredentialResponse> {
    const current = await this.findOrThrow(id);
    assertDateRange(
      dto.startDate === undefined ? current.startDate : dto.startDate,
      dto.endDate === undefined ? current.endDate : dto.endDate,
    );
    await this.media.assertUsable([dto.logoId]);
    const row = await this.prisma.credential.update({
      where: { id },
      data: definedOnly({ ...dto, updatedById: userId }),
      include: { logo: true },
    });
    return this.toResponse(row);
  }

  async remove(id: string): Promise<void> {
    await this.findOrThrow(id);
    await this.prisma.credential.delete({ where: { id } });
  }

  async publicList(): Promise<Omit<CredentialResponse, 'status'>[]> {
    const rows = await this.prisma.credential.findMany({
      where: { status: ContentStatus.PUBLISHED },
      include: { logo: true },
      orderBy: ORDER,
    });
    return rows.map((r) => {
      const { status: _status, ...rest } = this.toResponse(r);
      return rest;
    });
  }

  private async findOrThrow(id: string): Promise<CredentialRow> {
    const row = await this.prisma.credential.findUnique({
      where: { id },
      include: { logo: true },
    });
    if (!row) throw new NotFoundException('Credential not found');
    return row;
  }

  private toResponse(row: CredentialRow): CredentialResponse {
    return {
      id: row.id,
      kind: row.kind,
      institution: row.institution,
      title: row.title,
      field: row.field,
      location: row.location,
      startDate: row.startDate,
      endDate: row.endDate,
      credentialUrl: row.credentialUrl,
      credentialId: row.credentialId,
      description: row.description,
      logo: this.media.toRef(row.logo),
      sortOrder: row.sortOrder,
      status: row.status,
      updatedAt: row.updatedAt,
    };
  }
}
