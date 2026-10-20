import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth.types';
import { AdminOnly } from '../common/decorators/admin.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CredentialsService } from './credentials.service';
import {
  CreateCredentialDto,
  CredentialQueryDto,
  CredentialResponse,
  UpdateCredentialDto,
} from './dto/credentials.dto';

@ApiTags('admin: education & certifications')
@AdminOnly()
@Controller('admin/credentials')
export class CredentialsController {
  constructor(private readonly credentials: CredentialsService) {}

  @Get()
  list(@Query() query: CredentialQueryDto) {
    return this.credentials.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: CredentialResponse })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.credentials.get(id);
  }

  @Post()
  @ApiCreatedResponse({ type: CredentialResponse })
  create(@Body() dto: CreateCredentialDto, @CurrentUser() user: AuthUser) {
    return this.credentials.create(dto, user.userId);
  }

  @Patch(':id')
  @ApiOkResponse({ type: CredentialResponse })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCredentialDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.credentials.update(id, dto, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.credentials.remove(id);
  }
}
