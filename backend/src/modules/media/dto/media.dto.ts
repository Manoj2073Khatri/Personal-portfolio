import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaKind, MediaStatus } from '@prisma/client';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Max,
  MaxLength,
} from 'class-validator';
import { SearchQueryDto } from '../../common/dto/pagination.dto';
import { ALLOWED_MIME_TYPES } from '../media.constants';

export class CreateUploadDto {
  @ApiProperty({ example: 'screenshot.png', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  filename: string;

  @ApiProperty({ enum: ALLOWED_MIME_TYPES })
  @IsIn(ALLOWED_MIME_TYPES)
  mimeType: string;

  @ApiProperty({ description: 'File size in bytes' })
  @IsInt()
  @IsPositive()
  @Max(20 * 1024 * 1024)
  size: number;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  alt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(20000)
  width?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(20000)
  height?: number;
}

export class CreateExternalMediaDto {
  @ApiProperty({ example: 'https://cdn.example.com/image.png' })
  @IsUrl({ protocols: ['https'], require_protocol: true, require_tld: true })
  @MaxLength(2000)
  url: string;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  alt?: string;

  @ApiPropertyOptional({
    enum: ALLOWED_MIME_TYPES,
    description: 'Inferred from the URL when omitted',
  })
  @IsOptional()
  @IsIn(ALLOWED_MIME_TYPES)
  mimeType?: string;
}

export class UpdateMediaDto {
  @ApiProperty({ maxLength: 300 })
  @IsString()
  @MaxLength(300)
  alt: string;
}

export class MediaQueryDto extends SearchQueryDto {
  @ApiPropertyOptional({ enum: MediaKind })
  @IsOptional()
  @IsEnum(MediaKind)
  kind?: MediaKind;

  @ApiPropertyOptional({ enum: MediaStatus })
  @IsOptional()
  @IsEnum(MediaStatus)
  status?: MediaStatus;
}

/** Media as embedded in content responses (public and admin). */
export class MediaRef {
  @ApiProperty() id: string;
  @ApiProperty({ enum: MediaKind }) kind: MediaKind;
  @ApiProperty() url: string;
  @ApiProperty() alt: string;
  @ApiProperty() mimeType: string;
  @ApiProperty({ nullable: true, type: Number }) width: number | null;
  @ApiProperty({ nullable: true, type: Number }) height: number | null;
}

export class MediaResponse extends MediaRef {
  @ApiProperty({ enum: MediaStatus }) status: MediaStatus;
  @ApiProperty() filename: string;
  @ApiProperty({ nullable: true, type: Number }) size: number | null;
  @ApiProperty({ description: 'True for externally hosted media' })
  external: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class UploadIntentResponse {
  @ApiProperty({ type: MediaResponse }) media: MediaResponse;
  @ApiProperty({ description: 'S3 presigned POST target' }) uploadUrl: string;
  @ApiProperty({
    description: 'Form fields to send before the file field',
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  fields: Record<string, string>;
  @ApiProperty() expiresInSeconds: number;
}

export class MediaUsage {
  @ApiProperty() total: number;
  @ApiProperty({ type: 'object', additionalProperties: { type: 'number' } })
  byField: Record<string, number>;
}
