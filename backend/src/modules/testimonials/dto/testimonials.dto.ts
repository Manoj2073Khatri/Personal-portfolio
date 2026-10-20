import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SearchQueryDto } from '../../common/dto/pagination.dto';
import {
  OptionalMediaId,
  OptionalSortOrder,
  OptionalStatus,
  OptionalText,
} from '../../common/dto/validators';
import { MediaRef } from '../../media/dto/media.dto';

export class CreateTestimonialDto {
  @ApiProperty({ maxLength: 1000 })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  quote: string;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  authorName: string;

  @OptionalText(100, undefined, { nullable: true })
  authorTitle?: string | null;

  @OptionalText(100, undefined, { nullable: true })
  authorCompany?: string | null;

  @OptionalMediaId()
  avatarId?: string | null;

  @OptionalSortOrder()
  sortOrder?: number;

  @OptionalStatus()
  status?: ContentStatus;
}

export class UpdateTestimonialDto extends PartialType(CreateTestimonialDto) {}

export class TestimonialQueryDto extends SearchQueryDto {
  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}

export class TestimonialResponse {
  @ApiProperty() id: string;
  @ApiProperty() quote: string;
  @ApiProperty() authorName: string;
  @ApiProperty({ nullable: true, type: String }) authorTitle: string | null;
  @ApiProperty({ nullable: true, type: String }) authorCompany: string | null;
  @ApiProperty({ nullable: true, type: MediaRef }) avatar: MediaRef | null;
  @ApiProperty() sortOrder: number;
  @ApiProperty({ enum: ContentStatus }) status: ContentStatus;
  @ApiProperty() updatedAt: Date;
}
