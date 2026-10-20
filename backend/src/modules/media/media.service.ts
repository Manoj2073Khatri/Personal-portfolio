import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Media, MediaKind, MediaStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { StorageService } from '../../infra/storage/storage.service';
import { pageArgs, paginate, Paginated } from '../common/dto/pagination.dto';
import {
  CreateExternalMediaDto,
  CreateUploadDto,
  MediaQueryDto,
  MediaRef,
  MediaResponse,
  MediaUsage,
  UpdateMediaDto,
  UploadIntentResponse,
} from './dto/media.dto';
import { MAX_BYTES, MEDIA_TYPES } from './media.constants';

/** Every relation that can point at a media row, used for delete protection. */
const USAGE_FIELDS = [
  'profileImageFor',
  'resumeFor',
  'ogImageFor',
  'projectThumbnail',
  'projectOgImage',
  'projectGallery',
  'skillIcons',
  'experienceLogos',
  'credentialLogos',
  'articleCovers',
  'articleOgImage',
  'testimonialAvatars',
] as const;

const EXTENSION_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  pdf: 'application/pdf',
};

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  url(media: Pick<Media, 'storageKey' | 'externalUrl'>): string {
    if (media.storageKey) return this.storage.publicUrl(media.storageKey);
    return media.externalUrl ?? '';
  }

  toRef(media: Media): MediaRef;
  toRef(media: Media | null | undefined): MediaRef | null;
  toRef(media: Media | null | undefined): MediaRef | null {
    if (!media) return null;
    return {
      id: media.id,
      kind: media.kind,
      url: this.url(media),
      alt: media.alt,
      mimeType: media.mimeType,
      width: media.width,
      height: media.height,
    };
  }

  toResponse(media: Media): MediaResponse {
    return {
      ...this.toRef(media),
      status: media.status,
      filename: media.filename,
      size: media.size,
      external: !media.storageKey,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
    };
  }

  async list(query: MediaQueryDto): Promise<Paginated<MediaResponse>> {
    const where: Prisma.MediaWhereInput = {
      kind: query.kind,
      status: query.status,
      ...(query.q
        ? {
            OR: [
              { filename: { contains: query.q, mode: 'insensitive' } },
              { alt: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...pageArgs(query),
      }),
      this.prisma.media.count({ where }),
    ]);
    return paginate(
      rows.map((m) => this.toResponse(m)),
      total,
      query,
    );
  }

  async get(id: string): Promise<MediaResponse> {
    return this.toResponse(await this.findOrThrow(id));
  }

  async createUpload(
    dto: CreateUploadDto,
    userId: string,
  ): Promise<UploadIntentResponse> {
    const type = MEDIA_TYPES[dto.mimeType];
    if (dto.size > MAX_BYTES[type.kind]) {
      throw new BadRequestException(
        `File exceeds the ${MAX_BYTES[type.kind] / 1024 / 1024} MB limit for ${type.kind.toLowerCase()}s`,
      );
    }
    // Key is server-generated; the client filename is metadata only.
    const now = new Date();
    const key = `media/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${randomUUID()}.${type.ext}`;
    const upload = await this.storage.createPresignedUpload(
      key,
      dto.mimeType,
      MAX_BYTES[type.kind],
    );

    const media = await this.prisma.media.create({
      data: {
        kind: type.kind,
        status: MediaStatus.PENDING,
        storageKey: key,
        filename: sanitizeFilename(dto.filename),
        mimeType: dto.mimeType,
        size: dto.size,
        width: dto.width,
        height: dto.height,
        alt: dto.alt ?? '',
        createdById: userId,
      },
    });
    return {
      media: this.toResponse(media),
      uploadUrl: upload.url,
      fields: upload.fields,
      expiresInSeconds: upload.expiresInSeconds,
    };
  }

  /** Verifies the object really landed in S3 with the declared type and a permitted size. */
  async confirmUpload(id: string): Promise<MediaResponse> {
    const media = await this.findOrThrow(id);
    if (media.status === MediaStatus.READY) return this.toResponse(media);
    if (!media.storageKey)
      throw new BadRequestException('Media is not an upload');

    const info = await this.storage.headObject(media.storageKey);
    if (!info)
      throw new BadRequestException(
        'Upload not found in storage; upload the file first',
      );

    const typeMatches = info.contentType === media.mimeType;
    const sizeOk = info.size > 0 && info.size <= MAX_BYTES[media.kind];
    if (!typeMatches || !sizeOk) {
      await this.storage.deleteObject(media.storageKey).catch(() => undefined);
      await this.prisma.media.delete({ where: { id } });
      throw new BadRequestException(
        'Uploaded file did not match the declared type or size',
      );
    }

    const updated = await this.prisma.media.update({
      where: { id },
      data: { status: MediaStatus.READY, size: info.size },
    });
    return this.toResponse(updated);
  }

  async createExternal(
    dto: CreateExternalMediaDto,
    userId: string,
  ): Promise<MediaResponse> {
    const url = new URL(dto.url);
    const ext = url.pathname.split('.').pop()?.toLowerCase() ?? '';
    const mimeType = dto.mimeType ?? EXTENSION_TYPES[ext] ?? 'image/jpeg';
    const type = MEDIA_TYPES[mimeType];
    const filename = decodeURIComponent(
      url.pathname.split('/').pop() || url.hostname,
    );

    const media = await this.prisma.media.create({
      data: {
        kind: type.kind,
        status: MediaStatus.READY,
        externalUrl: url.toString(),
        filename: sanitizeFilename(filename),
        mimeType,
        alt: dto.alt ?? '',
        createdById: userId,
      },
    });
    return this.toResponse(media);
  }

  async update(id: string, dto: UpdateMediaDto): Promise<MediaResponse> {
    await this.findOrThrow(id);
    const media = await this.prisma.media.update({
      where: { id },
      data: { alt: dto.alt },
    });
    return this.toResponse(media);
  }

  async usage(id: string): Promise<MediaUsage> {
    const row = await this.prisma.media.findUnique({
      where: { id },
      select: {
        _count: {
          select: Object.fromEntries(USAGE_FIELDS.map((f) => [f, true])),
        },
      },
    });
    if (!row) throw new NotFoundException('Media not found');
    const byField = row._count;
    return {
      total: Object.values(byField).reduce((a, b) => a + b, 0),
      byField,
    };
  }

  async remove(id: string): Promise<void> {
    const media = await this.findOrThrow(id);
    const usage = await this.usage(id);
    if (usage.total > 0) {
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message: `Media is used in ${usage.total} place(s); remove those references first`,
        usage: usage.byField,
      });
    }
    await this.prisma.media.delete({ where: { id } });
    if (media.storageKey) {
      // Row is gone either way; an orphaned object is logged rather than failing the request.
      await this.storage
        .deleteObject(media.storageKey)
        .catch((error: Error) =>
          this.logger.error(
            `Failed to delete object ${media.storageKey}: ${error.message}`,
          ),
        );
    }
  }

  /**
   * Ensures every referenced media ID exists, is READY and (optionally) of the
   * expected kind. Called by content services before writes.
   */
  async assertUsable(
    ids: (string | null | undefined)[],
    kind: MediaKind = MediaKind.IMAGE,
  ): Promise<void> {
    const unique = [...new Set(ids.filter((id): id is string => !!id))];
    if (!unique.length) return;
    const found = await this.prisma.media.findMany({
      where: { id: { in: unique }, status: MediaStatus.READY, kind },
      select: { id: true },
    });
    if (found.length !== unique.length) {
      const ok = new Set(found.map((m) => m.id));
      const missing = unique.filter((id) => !ok.has(id));
      throw new BadRequestException(
        `Unknown, pending or non-${kind.toLowerCase()} media: ${missing.join(', ')}`,
      );
    }
  }

  private async findOrThrow(id: string): Promise<Media> {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w.\- ]+/g, '_').slice(0, 200) || 'file';
}
