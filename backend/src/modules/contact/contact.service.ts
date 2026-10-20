import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ContactSubmission, Prisma } from '@prisma/client';
import { APP_ENV, type AppEnv } from '../../config/env';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { pageArgs, paginate, Paginated } from '../common/dto/pagination.dto';
import { hashIp } from '../common/utils/client-ip';
import {
  CreateContactSubmissionDto,
  SubmissionQueryDto,
  SubmissionResponse,
  UpdateSubmissionDto,
} from './dto/contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(APP_ENV) private readonly env: AppEnv,
  ) {}

  /**
   * Stores a submission. Honeypot hits are acknowledged identically but
   * dropped, so bots get no signal about the filter.
   */
  async submit(
    dto: CreateContactSubmissionDto,
    meta: { ip?: string; userAgent?: string },
  ): Promise<void> {
    if (dto.website) {
      this.logger.warn('Dropped contact submission that filled the honeypot');
      return;
    }
    await this.prisma.contactSubmission.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        message: dto.message,
        ipHash: hashIp(meta.ip, this.env.ipHashSalt),
        userAgent: meta.userAgent?.slice(0, 300) ?? null,
      },
    });
  }

  async list(
    query: SubmissionQueryDto,
  ): Promise<Paginated<SubmissionResponse>> {
    const where: Prisma.ContactSubmissionWhereInput = {
      status: query.status,
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' } },
              { email: { contains: query.q, mode: 'insensitive' } },
              { message: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.contactSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...pageArgs(query),
      }),
      this.prisma.contactSubmission.count({ where }),
    ]);
    return paginate(rows.map(toResponse), total, query);
  }

  async get(id: string): Promise<SubmissionResponse> {
    return toResponse(await this.findOrThrow(id));
  }

  async update(
    id: string,
    dto: UpdateSubmissionDto,
  ): Promise<SubmissionResponse> {
    await this.findOrThrow(id);
    return toResponse(
      await this.prisma.contactSubmission.update({
        where: { id },
        data: { status: dto.status },
      }),
    );
  }

  async remove(id: string): Promise<void> {
    await this.findOrThrow(id);
    await this.prisma.contactSubmission.delete({ where: { id } });
  }

  private async findOrThrow(id: string) {
    const row = await this.prisma.contactSubmission.findUnique({
      where: { id },
    });
    if (!row) throw new NotFoundException('Submission not found');
    return row;
  }
}

/** ipHash is internal (abuse investigation only) and never returned. */
function toResponse(row: ContactSubmission): SubmissionResponse {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    status: row.status,
    userAgent: row.userAgent,
    createdAt: row.createdAt,
  };
}
