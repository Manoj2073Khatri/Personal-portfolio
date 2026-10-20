import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubmissionStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SearchQueryDto } from '../../common/dto/pagination.dto';

const trim = Transform(({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value,
);

export class CreateContactSubmissionDto {
  @ApiProperty({ maxLength: 100 })
  @trim
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ maxLength: 254 })
  @trim
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ minLength: 10, maxLength: 5000 })
  @trim
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message: string;

  @ApiPropertyOptional({
    description: 'Honeypot. Must be left empty; bots tend to fill it.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  website?: string;
}

export class UpdateSubmissionDto {
  @ApiProperty({ enum: SubmissionStatus })
  @IsEnum(SubmissionStatus)
  status: SubmissionStatus;
}

export class SubmissionQueryDto extends SearchQueryDto {
  @ApiPropertyOptional({ enum: SubmissionStatus })
  @IsOptional()
  @IsEnum(SubmissionStatus)
  status?: SubmissionStatus;
}

export class SubmissionResponse {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty() message: string;
  @ApiProperty({ enum: SubmissionStatus }) status: SubmissionStatus;
  @ApiProperty({ nullable: true, type: String }) userAgent: string | null;
  @ApiProperty() createdAt: Date;
}

export class ContactAccepted {
  @ApiProperty({ example: true }) accepted: boolean;
}
