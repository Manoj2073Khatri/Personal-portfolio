import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ContentStatus, CredentialKind } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SearchQueryDto } from '../../common/dto/pagination.dto';
import {
  OptionalDate,
  OptionalMediaId,
  OptionalSortOrder,
  OptionalStatus,
  OptionalText,
  OptionalUrl,
} from '../../common/dto/validators';
import { MediaRef } from '../../media/dto/media.dto';

export class CreateCredentialDto {
  @ApiProperty({ enum: CredentialKind })
  @IsEnum(CredentialKind)
  kind: CredentialKind;

  @ApiProperty({
    maxLength: 150,
    description: 'Institution or issuing organisation',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  institution: string;

  @ApiProperty({
    maxLength: 200,
    description: 'Qualification or certificate title',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @OptionalText(150, 'Field of study', { nullable: true })
  field?: string | null;

  @OptionalText(150, undefined, { nullable: true })
  location?: string | null;

  @OptionalDate()
  startDate?: Date | null;

  @OptionalDate('Completion or issue date')
  endDate?: Date | null;

  @OptionalUrl('Verification URL')
  credentialUrl?: string | null;

  @OptionalText(100, undefined, { nullable: true })
  credentialId?: string | null;

  @OptionalText(1000)
  description?: string;

  @OptionalMediaId()
  logoId?: string | null;

  @OptionalSortOrder()
  sortOrder?: number;

  @OptionalStatus()
  status?: ContentStatus;
}

export class UpdateCredentialDto extends PartialType(CreateCredentialDto) {}

export class CredentialQueryDto extends SearchQueryDto {
  @ApiPropertyOptional({ enum: CredentialKind })
  @IsOptional()
  @IsEnum(CredentialKind)
  kind?: CredentialKind;

  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}

export class CredentialResponse {
  @ApiProperty() id: string;
  @ApiProperty({ enum: CredentialKind }) kind: CredentialKind;
  @ApiProperty() institution: string;
  @ApiProperty() title: string;
  @ApiProperty({ nullable: true, type: String }) field: string | null;
  @ApiProperty({ nullable: true, type: String }) location: string | null;
  @ApiProperty({ nullable: true, type: Date }) startDate: Date | null;
  @ApiProperty({ nullable: true, type: Date }) endDate: Date | null;
  @ApiProperty({ nullable: true, type: String }) credentialUrl: string | null;
  @ApiProperty({ nullable: true, type: String }) credentialId: string | null;
  @ApiProperty() description: string;
  @ApiProperty({ nullable: true, type: MediaRef }) logo: MediaRef | null;
  @ApiProperty() sortOrder: number;
  @ApiProperty({ enum: ContentStatus }) status: ContentStatus;
  @ApiProperty() updatedAt: Date;
}
