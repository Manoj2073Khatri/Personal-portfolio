import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  PaginationQueryDto,
  SearchQueryDto,
} from '../../common/dto/pagination.dto';
import {
  OptionalBoolean,
  OptionalDate,
  OptionalIdList,
  OptionalMediaId,
  OptionalSlug,
  OptionalSortOrder,
  OptionalStatus,
  OptionalText,
  OptionalUrl,
  QueryBoolean,
} from '../../common/dto/validators';
import { MediaRef } from '../../media/dto/media.dto';
import { SkillRef } from '../../skills/dto/skills.dto';

export class CreateProjectDto {
  @ApiProperty({ maxLength: 150 })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title: string;

  @OptionalSlug()
  slug?: string;

  @OptionalText(500, 'Short description for cards')
  summary?: string;

  @OptionalText(50000, 'Full description (Markdown)')
  body?: string;

  @OptionalText(120, 'Your role on the project', { nullable: true })
  role?: string | null;

  @OptionalUrl('Live demo URL')
  liveUrl?: string | null;

  @OptionalUrl('Source repository URL')
  repoUrl?: string | null;

  @OptionalDate()
  startDate?: Date | null;

  @OptionalDate()
  endDate?: Date | null;

  @OptionalBoolean('Show in the featured section')
  featured?: boolean;

  @OptionalSortOrder()
  sortOrder?: number;

  @OptionalStatus()
  status?: ContentStatus;

  @OptionalDate('Defaults to the first time the project is published')
  publishedAt?: Date | null;

  @OptionalText(70, undefined, { nullable: true })
  seoTitle?: string | null;

  @OptionalText(200, undefined, { nullable: true })
  seoDescription?: string | null;

  @OptionalMediaId()
  thumbnailId?: string | null;

  @OptionalMediaId('Social sharing image; falls back to the thumbnail')
  ogImageId?: string | null;

  @OptionalIdList(20, 'Gallery media IDs in display order')
  galleryIds?: string[];

  @OptionalIdList(50)
  skillIds?: string[];
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class ProjectQueryDto extends SearchQueryDto {
  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @QueryBoolean()
  featured?: boolean;
}

export class PublicProjectQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by skill slug' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  skill?: string;

  @QueryBoolean()
  featured?: boolean;
}

export class ProjectResponse {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() slug: string;
  @ApiProperty() summary: string;
  @ApiProperty({ description: 'Markdown' }) body: string;
  @ApiProperty({ nullable: true, type: String }) role: string | null;
  @ApiProperty({ nullable: true, type: String }) liveUrl: string | null;
  @ApiProperty({ nullable: true, type: String }) repoUrl: string | null;
  @ApiProperty({ nullable: true, type: Date }) startDate: Date | null;
  @ApiProperty({ nullable: true, type: Date }) endDate: Date | null;
  @ApiProperty() featured: boolean;
  @ApiProperty() sortOrder: number;
  @ApiProperty({ enum: ContentStatus }) status: ContentStatus;
  @ApiProperty({ nullable: true, type: Date }) publishedAt: Date | null;
  @ApiProperty({ nullable: true, type: String }) seoTitle: string | null;
  @ApiProperty({ nullable: true, type: String }) seoDescription: string | null;
  @ApiProperty({ nullable: true, type: MediaRef }) thumbnail: MediaRef | null;
  @ApiProperty({ nullable: true, type: MediaRef }) ogImage: MediaRef | null;
  @ApiProperty({ type: [MediaRef] }) gallery: MediaRef[];
  @ApiProperty({ type: [SkillRef] }) skills: SkillRef[];
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

/** Public shape: no workflow fields. */
export type PublicProject = Omit<ProjectResponse, 'status' | 'createdAt'>;
