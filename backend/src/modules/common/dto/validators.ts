import { applyDecorators } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { ContentStatus } from '@prisma/client';
import { SLUG_PATTERN } from '../utils/content';

/**
 * Field decorators shared by content DTOs. On updates, `undefined` leaves a
 * field unchanged; `null` clears it only where the column is nullable.
 */

/** Like IsOptional, but `null` still fails validation (for NOT NULL columns). */
export const IfDefined = () =>
  ValidateIf((_obj: unknown, value: unknown) => value !== undefined);

const trim = Transform(({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value,
);

export const OptionalText = (
  max: number,
  description?: string,
  { nullable = false }: { nullable?: boolean } = {},
) =>
  applyDecorators(
    ApiPropertyOptional({
      maxLength: max,
      description,
      nullable,
      type: String,
    }),
    nullable ? IsOptional() : IfDefined(),
    trim,
    IsString(),
    MaxLength(max),
  );

export const OptionalUrl = (description?: string) =>
  applyDecorators(
    ApiPropertyOptional({
      format: 'uri',
      description,
      nullable: true,
      type: String,
    }),
    IsOptional(),
    trim,
    IsUrl({
      protocols: ['http', 'https'],
      require_protocol: true,
      require_tld: false,
    }),
    MaxLength(2000),
  );

export const OptionalSlug = () =>
  applyDecorators(
    ApiPropertyOptional({
      pattern: SLUG_PATTERN.source,
      description:
        'Lowercase, hyphen-separated. Derived from the title when omitted.',
    }),
    IfDefined(),
    trim,
    Matches(SLUG_PATTERN, {
      message: 'slug must be lowercase letters, numbers and hyphens',
    }),
    MaxLength(80),
  );

export const OptionalDate = (description?: string) =>
  applyDecorators(
    ApiPropertyOptional({
      type: String,
      format: 'date-time',
      nullable: true,
      description,
    }),
    IsOptional(),
    Type(() => Date),
    IsDate(),
  );

export const OptionalMediaId = (description?: string) =>
  applyDecorators(
    ApiPropertyOptional({
      format: 'uuid',
      nullable: true,
      type: String,
      description,
    }),
    IsOptional(),
    IsUUID(),
  );

export const OptionalIdList = (max: number, description?: string) =>
  applyDecorators(
    ApiPropertyOptional({ type: [String], format: 'uuid', description }),
    IfDefined(),
    IsArray(),
    ArrayMaxSize(max),
    IsUUID('all', { each: true }),
  );

export const OptionalStringList = (maxItems: number, maxLength: number) =>
  applyDecorators(
    ApiPropertyOptional({ type: [String] }),
    IfDefined(),
    IsArray(),
    ArrayMaxSize(maxItems),
    IsString({ each: true }),
    MaxLength(maxLength, { each: true }),
  );

export const OptionalSortOrder = () =>
  applyDecorators(
    ApiPropertyOptional({ default: 0, description: 'Ascending display order' }),
    IfDefined(),
    IsInt(),
    Min(-10000),
    Max(10000),
  );

export const OptionalBoolean = (description?: string) =>
  applyDecorators(
    ApiPropertyOptional({ description }),
    IfDefined(),
    IsBoolean(),
  );

export const OptionalStatus = () =>
  applyDecorators(
    ApiPropertyOptional({ enum: ContentStatus }),
    IfDefined(),
    IsEnum(ContentStatus),
  );

/** Query-string booleans arrive as "true"/"false". */
export const QueryBoolean = () =>
  applyDecorators(
    ApiPropertyOptional({ type: Boolean }),
    IsOptional(),
    Transform(({ value }: { value: unknown }) =>
      value === 'true' ? true : value === 'false' ? false : value,
    ),
    IsBoolean(),
  );
