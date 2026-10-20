import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SearchQueryDto } from '../../common/dto/pagination.dto';
import {
  OptionalMediaId,
  OptionalSlug,
  OptionalSortOrder,
  OptionalStatus,
  OptionalText,
} from '../../common/dto/validators';
import { MediaRef } from '../../media/dto/media.dto';

export class CreateSkillCategoryDto {
  @ApiProperty({ maxLength: 60, example: 'Frontend' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name: string;

  @OptionalSlug()
  slug?: string;

  @OptionalSortOrder()
  sortOrder?: number;
}

export class UpdateSkillCategoryDto extends PartialType(
  CreateSkillCategoryDto,
) {}

export class CreateSkillDto {
  @ApiProperty({ maxLength: 60, example: 'React.js' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name: string;

  @OptionalSlug()
  slug?: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  categoryId: string;

  @OptionalText(
    40,
    'Optional free-text label; leave empty rather than inventing a level',
    {
      nullable: true,
    },
  )
  proficiency?: string | null;

  @OptionalMediaId('Icon image')
  iconId?: string | null;

  @OptionalSortOrder()
  sortOrder?: number;

  @OptionalStatus()
  status?: ContentStatus;
}

export class UpdateSkillDto extends PartialType(CreateSkillDto) {}

export class SkillQueryDto extends SearchQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}

export class SkillCategoryResponse {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
  @ApiProperty() sortOrder: number;
  @ApiProperty({ required: false }) skillCount?: number;
}

/** Compact skill reference embedded in projects and experience. */
export class SkillRef {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
}

export class SkillResponse extends SkillRef {
  @ApiProperty({ nullable: true, type: String }) proficiency: string | null;
  @ApiProperty() sortOrder: number;
  @ApiProperty({ enum: ContentStatus }) status: ContentStatus;
  @ApiProperty({ type: SkillCategoryResponse }) category: SkillCategoryResponse;
  @ApiProperty({ nullable: true, type: MediaRef }) icon: MediaRef | null;
  @ApiProperty() updatedAt: Date;
}

export class PublicSkillGroup {
  @ApiProperty({ type: SkillCategoryResponse }) category: SkillCategoryResponse;
  @ApiProperty({ type: [SkillResponse] }) skills: Omit<
    SkillResponse,
    'status' | 'category' | 'updatedAt'
  >[];
}
