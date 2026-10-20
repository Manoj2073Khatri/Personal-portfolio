import { BadRequestException, Injectable } from '@nestjs/common';
import { MediaKind, Media, Prisma, SiteSettings } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { definedOnly } from '../common/utils/content';
import { MediaService } from '../media/media.service';
import {
  HOMEPAGE_SECTIONS,
  HomepageSectionDto,
  NavLinkDto,
  SettingsResponse,
  SocialLinkDto,
  UpdateSettingsDto,
} from './dto/settings.dto';

const SETTINGS_ID = 'default';

const include = {
  profileImage: true,
  resumeMedia: true,
  ogImage: true,
} as const;

type SettingsWithMedia = SiteSettings & {
  profileImage: Media | null;
  resumeMedia: Media | null;
  ogImage: Media | null;
};

export const DEFAULT_SECTIONS: HomepageSectionDto[] = HOMEPAGE_SECTIONS.map(
  (key) => ({
    key,
    enabled: true,
  }),
);

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
  ) {}

  async get(): Promise<SettingsResponse> {
    const row = await this.prisma.siteSettings.findUnique({
      where: { id: SETTINGS_ID },
      include,
    });
    return this.toResponse(row);
  }

  async update(
    dto: UpdateSettingsDto,
    userId: string,
  ): Promise<SettingsResponse> {
    await this.media.assertUsable([dto.profileImageId, dto.ogImageId]);
    await this.media.assertUsable([dto.resumeMediaId], MediaKind.DOCUMENT);

    if (dto.homepageSections) {
      const keys = dto.homepageSections.map((s) => s.key);
      if (new Set(keys).size !== keys.length) {
        throw new BadRequestException(
          'homepageSections contains duplicate keys',
        );
      }
    }

    const data = definedOnly({
      ...dto,
      socialLinks: dto.socialLinks as unknown as
        Prisma.InputJsonValue | undefined,
      navigation: dto.navigation as unknown as
        Prisma.InputJsonValue | undefined,
      homepageSections: dto.homepageSections as unknown as
        Prisma.InputJsonValue | undefined,
      updatedById: userId,
    });

    const row = await this.prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      create: {
        name: '',
        title: '',
        ...data,
        id: SETTINGS_ID,
      },
      update: data,
      include,
    });
    return this.toResponse(row);
  }

  private toResponse(row: SettingsWithMedia | null): SettingsResponse {
    if (!row) {
      return {
        name: '',
        title: '',
        intro: '',
        bio: '',
        email: null,
        phone: null,
        location: null,
        resumeUrl: null,
        socialLinks: [],
        navigation: [],
        footerText: '',
        homepageSections: DEFAULT_SECTIONS,
        seoTitle: null,
        seoDescription: null,
        siteUrl: null,
        profileImage: null,
        resumeMedia: null,
        ogImage: null,
        updatedAt: null,
      };
    }
    const sections = row.homepageSections as unknown as HomepageSectionDto[];
    return {
      name: row.name,
      title: row.title,
      intro: row.intro,
      bio: row.bio,
      email: row.email,
      phone: row.phone,
      location: row.location,
      resumeUrl: row.resumeMedia
        ? this.media.url(row.resumeMedia)
        : row.resumeUrl,
      socialLinks: row.socialLinks as unknown as SocialLinkDto[],
      navigation: row.navigation as unknown as NavLinkDto[],
      footerText: row.footerText,
      homepageSections: sections.length ? sections : DEFAULT_SECTIONS,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      siteUrl: row.siteUrl,
      profileImage: this.media.toRef(row.profileImage),
      resumeMedia: this.media.toRef(row.resumeMedia),
      ogImage: this.media.toRef(row.ogImage),
      updatedAt: row.updatedAt,
    };
  }
}
