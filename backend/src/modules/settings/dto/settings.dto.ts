import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { MediaRef } from '../../media/dto/media.dto';
import {
  IfDefined,
  OptionalMediaId,
  OptionalText,
  OptionalUrl,
} from '../../common/dto/validators';

export const SOCIAL_PLATFORMS = [
  'github',
  'linkedin',
  'x',
  'email',
  'website',
  'dribbble',
  'youtube',
  'other',
] as const;

export const HOMEPAGE_SECTIONS = [
  'projects',
  'testimonials',
  'skills',
  'experience',
  'education',
  'certifications',
  'articles',
  'contact',
] as const;

export type HomepageSectionKey = (typeof HOMEPAGE_SECTIONS)[number];

export class SocialLinkDto {
  @ApiProperty({ enum: SOCIAL_PLATFORMS })
  @IsIn(SOCIAL_PLATFORMS)
  platform: (typeof SOCIAL_PLATFORMS)[number];

  @ApiProperty({ maxLength: 60 })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  label: string;

  @ApiProperty({ description: 'https:// or mailto: URL' })
  @IsUrl({
    protocols: ['https', 'http', 'mailto'],
    require_protocol: true,
    require_tld: false,
  })
  @MaxLength(500)
  url: string;
}

export class NavLinkDto {
  @ApiProperty({ maxLength: 40 })
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  label: string;

  @ApiProperty({
    description:
      'Site-relative path (/articles), in-page anchor (#projects) or https URL',
  })
  @IsString()
  @MaxLength(500)
  @Matches(/^(\/(?!\/)[^\s]*|#[\w-]+|https:\/\/[^\s]+)$/, {
    message: 'href must be a relative path, #anchor or https URL',
  })
  href: string;
}

export class HomepageSectionDto {
  @ApiProperty({ enum: HOMEPAGE_SECTIONS })
  @IsIn(HOMEPAGE_SECTIONS)
  key: HomepageSectionKey;

  @ApiProperty()
  @IsBoolean()
  enabled: boolean;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({ maxLength: 100 })
  @IfDefined()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ maxLength: 150, description: 'Professional title' })
  @IfDefined()
  @IsString()
  @MaxLength(150)
  title?: string;

  @OptionalText(500, 'Short hero introduction (plain text)')
  intro?: string;

  @OptionalText(10000, 'Bio (Markdown)')
  bio?: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string | null;

  @OptionalText(40, undefined, { nullable: true })
  phone?: string | null;

  @OptionalText(120, undefined, { nullable: true })
  location?: string | null;

  @OptionalUrl('External resume URL (used when no resume file is set)')
  resumeUrl?: string | null;

  @ApiPropertyOptional({ type: [SocialLinkDto] })
  @IfDefined()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  socialLinks?: SocialLinkDto[];

  @ApiPropertyOptional({ type: [NavLinkDto] })
  @IfDefined()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => NavLinkDto)
  navigation?: NavLinkDto[];

  @OptionalText(300)
  footerText?: string;

  @ApiPropertyOptional({
    type: [HomepageSectionDto],
    description: 'Display order of homepage sections',
  })
  @IfDefined()
  @IsArray()
  @ArrayMaxSize(HOMEPAGE_SECTIONS.length)
  @ValidateNested({ each: true })
  @Type(() => HomepageSectionDto)
  homepageSections?: HomepageSectionDto[];

  @OptionalText(70, undefined, { nullable: true })
  seoTitle?: string | null;

  @OptionalText(200, undefined, { nullable: true })
  seoDescription?: string | null;

  @OptionalUrl('Canonical site origin, e.g. https://www.example.com')
  siteUrl?: string | null;

  @OptionalMediaId('Profile image')
  profileImageId?: string | null;

  @OptionalMediaId('Resume document (PDF)')
  resumeMediaId?: string | null;

  @OptionalMediaId('Default social sharing image')
  ogImageId?: string | null;
}

export class SettingsResponse {
  @ApiProperty() name: string;
  @ApiProperty() title: string;
  @ApiProperty() intro: string;
  @ApiProperty({ description: 'Markdown' }) bio: string;
  @ApiProperty({ nullable: true, type: String }) email: string | null;
  @ApiProperty({ nullable: true, type: String }) phone: string | null;
  @ApiProperty({ nullable: true, type: String }) location: string | null;
  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Resume file URL, else resumeUrl',
  })
  resumeUrl: string | null;
  @ApiProperty({ type: [SocialLinkDto] }) socialLinks: SocialLinkDto[];
  @ApiProperty({ type: [NavLinkDto] }) navigation: NavLinkDto[];
  @ApiProperty() footerText: string;
  @ApiProperty({ type: [HomepageSectionDto] })
  homepageSections: HomepageSectionDto[];
  @ApiProperty({ nullable: true, type: String }) seoTitle: string | null;
  @ApiProperty({ nullable: true, type: String }) seoDescription: string | null;
  @ApiProperty({ nullable: true, type: String }) siteUrl: string | null;
  @ApiProperty({ nullable: true, type: MediaRef })
  profileImage: MediaRef | null;
  @ApiProperty({ nullable: true, type: MediaRef }) resumeMedia: MediaRef | null;
  @ApiProperty({ nullable: true, type: MediaRef }) ogImage: MediaRef | null;
  @ApiProperty({ nullable: true, type: Date }) updatedAt: Date | null;
}
