import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Media, Prisma, Testimonial } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { pageArgs, paginate, Paginated } from '../common/dto/pagination.dto';
import { definedOnly } from '../common/utils/content';
import { MediaService } from '../media/media.service';
import {
  CreateTestimonialDto,
  TestimonialQueryDto,
  TestimonialResponse,
  UpdateTestimonialDto,
} from './dto/testimonials.dto';

type TestimonialRow = Testimonial & { avatar: Media | null };

const ORDER: Prisma.TestimonialOrderByWithRelationInput[] = [
  { sortOrder: 'asc' },
  { createdAt: 'desc' },
];

@Injectable()
export class TestimonialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
  ) {}

  async list(
    query: TestimonialQueryDto,
  ): Promise<Paginated<TestimonialResponse>> {
    const where: Prisma.TestimonialWhereInput = {
      status: query.status,
      ...(query.q
        ? {
            OR: [
              { authorName: { contains: query.q, mode: 'insensitive' } },
              { quote: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.testimonial.findMany({
        where,
        include: { avatar: true },
        orderBy: ORDER,
        ...pageArgs(query),
      }),
      this.prisma.testimonial.count({ where }),
    ]);
    return paginate(
      rows.map((r) => this.toResponse(r)),
      total,
      query,
    );
  }

  async get(id: string): Promise<TestimonialResponse> {
    return this.toResponse(await this.findOrThrow(id));
  }

  async create(
    dto: CreateTestimonialDto,
    userId: string,
  ): Promise<TestimonialResponse> {
    await this.media.assertUsable([dto.avatarId]);
    const row = await this.prisma.testimonial.create({
      data: { ...dto, createdById: userId, updatedById: userId },
      include: { avatar: true },
    });
    return this.toResponse(row);
  }

  async update(
    id: string,
    dto: UpdateTestimonialDto,
    userId: string,
  ): Promise<TestimonialResponse> {
    await this.findOrThrow(id);
    await this.media.assertUsable([dto.avatarId]);
    const row = await this.prisma.testimonial.update({
      where: { id },
      data: definedOnly({ ...dto, updatedById: userId }),
      include: { avatar: true },
    });
    return this.toResponse(row);
  }

  async remove(id: string): Promise<void> {
    await this.findOrThrow(id);
    await this.prisma.testimonial.delete({ where: { id } });
  }

  async publicList(): Promise<Omit<TestimonialResponse, 'status'>[]> {
    const rows = await this.prisma.testimonial.findMany({
      where: { status: ContentStatus.PUBLISHED },
      include: { avatar: true },
      orderBy: ORDER,
    });
    return rows.map((r) => {
      const { status: _status, ...rest } = this.toResponse(r);
      return rest;
    });
  }

  private async findOrThrow(id: string): Promise<TestimonialRow> {
    const row = await this.prisma.testimonial.findUnique({
      where: { id },
      include: { avatar: true },
    });
    if (!row) throw new NotFoundException('Testimonial not found');
    return row;
  }

  private toResponse(row: TestimonialRow): TestimonialResponse {
    return {
      id: row.id,
      quote: row.quote,
      authorName: row.authorName,
      authorTitle: row.authorTitle,
      authorCompany: row.authorCompany,
      avatar: this.media.toRef(row.avatar),
      sortOrder: row.sortOrder,
      status: row.status,
      updatedAt: row.updatedAt,
    };
  }
}
