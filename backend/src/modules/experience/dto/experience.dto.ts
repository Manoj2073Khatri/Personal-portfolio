import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ContentStatus, EmploymentType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SearchQueryDto } from '../../common/dto/pagination.dto';
import {
  IfDefined,
  OptionalBoolean,
  OptionalDate,
  OptionalIdList,
  OptionalMediaId,
  OptionalSortOrder,
  OptionalStatus,
  OptionalStringList,
  OptionalText,
  OptionalUrl,
} from '../../common/dto/validators';
import { MediaRef } from '../../media/dto/media.dto';
import { SkillRef } from '../../skills/dto/skills.dto';

export class CreateExperienceDto {
  @ApiProperty({ maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  company: string;

  @OptionalUrl()
  companyUrl?: string | null;

  @ApiProperty({ maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  role: string;

  @ApiPropertyOptional({
    enum: EmploymentType,
    default: EmploymentType.FULL_TIME,
  })
  @IfDefined()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @OptionalText(120, undefined, { nullable: true })
  location?: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @OptionalDate('Leave empty for a current role')
  endDate?: Date | null;

  @OptionalBoolean()
  isCurrent?: boolean;

  @OptionalText(1000)
  summary?: string;

  @OptionalStringList(30, 500)
  responsibilities?: string[];

  @OptionalStringList(30, 500)
  achievements?: string[];

  @OptionalIdList(50)
  skillIds?: string[];

  @OptionalMediaId('Company logo')
  logoId?: string | null;

  @OptionalSortOrder()
  sortOrder?: number;

  @OptionalStatus()
  status?: ContentStatus;
}

export class UpdateExperienceDto extends PartialType(CreateExperienceDto) {}

export class ExperienceQueryDto extends SearchQueryDto {
  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}

export class ExperienceResponse {
  @ApiProperty() id: string;
  @ApiProperty() company: string;
  @ApiProperty({ nullable: true, type: String }) companyUrl: string | null;
  @ApiProperty() role: string;
  @ApiProperty({ enum: EmploymentType }) employmentType: EmploymentType;
  @ApiProperty({ nullable: true, type: String }) location: string | null;
  @ApiProperty() startDate: Date;
  @ApiProperty({ nullable: true, type: Date }) endDate: Date | null;
  @ApiProperty() isCurrent: boolean;
  @ApiProperty() summary: string;
  @ApiProperty({ type: [String] }) responsibilities: string[];
  @ApiProperty({ type: [String] }) achievements: string[];
  @ApiProperty({ type: [SkillRef] }) skills: SkillRef[];
  @ApiProperty({ nullable: true, type: MediaRef }) logo: MediaRef | null;
  @ApiProperty() sortOrder: number;
  @ApiProperty({ enum: ContentStatus }) status: ContentStatus;
  @ApiProperty() updatedAt: Date;
}
