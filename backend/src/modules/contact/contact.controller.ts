import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { APP_ENV, type AppEnv } from '../../config/env';
import { AdminOnly } from '../common/decorators/admin.decorator';
import { resolveClientIp } from '../common/utils/client-ip';
import { ContactService } from './contact.service';
import {
  ContactAccepted,
  CreateContactSubmissionDto,
  SubmissionQueryDto,
  SubmissionResponse,
  UpdateSubmissionDto,
} from './dto/contact.dto';

@ApiTags('public')
@Controller('public/contact')
export class PublicContactController {
  constructor(
    private readonly contact: ContactService,
    @Inject(APP_ENV) private readonly env: AppEnv,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 3, ttl: 10 * 60_000 } })
  @ApiAcceptedResponse({ type: ContactAccepted })
  @ApiTooManyRequestsResponse({
    description: 'More than 3 submissions per 10 minutes',
  })
  async submit(
    @Body() dto: CreateContactSubmissionDto,
    @Req() req: Request,
  ): Promise<ContactAccepted> {
    await this.contact.submit(dto, {
      ip: resolveClientIp(req, this.env.internalApiKey),
      userAgent: req.headers['user-agent'],
    });
    return { accepted: true };
  }
}

@ApiTags('admin: contact submissions')
@AdminOnly()
@Controller('admin/contact-submissions')
export class ContactSubmissionsController {
  constructor(private readonly contact: ContactService) {}

  @Get()
  list(@Query() query: SubmissionQueryDto) {
    return this.contact.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: SubmissionResponse })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.contact.get(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: SubmissionResponse })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubmissionDto,
  ) {
    return this.contact.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.contact.remove(id);
  }
}
