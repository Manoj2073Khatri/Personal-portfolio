import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
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
  OptionalDate,
  OptionalMediaId,
  OptionalSlug,
  OptionalStatus,
  OptionalStringList,
  OptionalText,
  OptionalBoolean,
  OptionalUrl,
} from '../../common/dto/validators';
import { MediaRef } from '../../media/dto/media.dto';

/** Lower-cases, trims and de-duplicates tags; non-arrays are left for validation to reject. */
function normalizeTags(value: unknown): unknown {
  if (!Array.isArray(value)) return value;
  const tags = (value as unknown[]).map((t) =>
    typeof t === 'string' ? t.trim().toLowerCase() : t,
  );
  return [...new Set(tags)].filter((t) => t !== '');
}

export class CreateArticleDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @OptionalSlug()
  slug?: string;

  @OptionalText(
    500,
    'Summary shown in lists and as the default meta description',
  )
  excerpt?: string;

  @OptionalText(100000, 'Article body (Markdown)')
  body?: string;

  @OptionalStringList(20, 40)
  @Transform(({ value }: { value: unknown }) => normalizeTags(value))
  tags?: string[];

  @OptionalStatus()
  status?: ContentStatus;

  @OptionalDate(
    'Defaults to the first publish time; a future date schedules the article',
  )
  publishedAt?: Date | null;

  @OptionalText(70, undefined, { nullable: true })
  seoTitle?: string | null;

  @OptionalText(200, undefined, { nullable: true })
  seoDescription?: string | null;

  @OptionalUrl(
    'Original URL if first published elsewhere; used as rel=canonical',
  )
  canonicalUrl?: string | null;

  @OptionalBoolean('Hide from search engines and the sitemap')
  noIndex?: boolean;

  @OptionalMediaId()
  coverImageId?: string | null;

  @OptionalMediaId('Social sharing image; falls back to the cover image')
  ogImageId?: string | null;
}

export class UpdateArticleDto extends PartialType(CreateArticleDto) {}

export class ArticleQueryDto extends SearchQueryDto {
  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}

export class PublicArticleQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  tag?: string;
}

export class ArticleAuthor {
  @ApiProperty({ nullable: true, type: String }) name: string | null;
}

export class ArticleSummary {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() slug: string;
  @ApiProperty() excerpt: string;
  @ApiProperty({ type: [String] }) tags: string[];
  @ApiProperty() readingTimeMinutes: number;
  @ApiProperty({ nullable: true, type: Date }) publishedAt: Date | null;
  @ApiProperty({ nullable: true, type: MediaRef }) coverImage: MediaRef | null;
  @ApiProperty() updatedAt: Date;
}

export class PublicArticle extends ArticleSummary {
  @ApiProperty({ description: 'Markdown' }) body: string;
  @ApiProperty({ nullable: true, type: String }) seoTitle: string | null;
  @ApiProperty({ nullable: true, type: String }) seoDescription: string | null;
  @ApiProperty({ nullable: true, type: String }) canonicalUrl: string | null;
  @ApiProperty() noIndex: boolean;
  @ApiProperty({ nullable: true, type: MediaRef }) ogImage: MediaRef | null;
  @ApiProperty({ type: ArticleAuthor }) author: ArticleAuthor;
}

export class ArticleResponse extends PublicArticle {
  @ApiProperty({ enum: ContentStatus }) status: ContentStatus;
  @ApiProperty() createdAt: Date;
}
