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
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminOnly } from '../common/decorators/admin.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../auth/auth.types';
import {
  CreateExternalMediaDto,
  CreateUploadDto,
  MediaQueryDto,
  MediaResponse,
  MediaUsage,
  UpdateMediaDto,
  UploadIntentResponse,
} from './dto/media.dto';
import { MediaService } from './media.service';

@ApiTags('admin: media')
@AdminOnly()
@Controller('admin/media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  list(@Query() query: MediaQueryDto) {
    return this.media.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: MediaResponse })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.media.get(id);
  }

  @Get(':id/usage')
  @ApiOkResponse({ type: MediaUsage })
  usage(@Param('id', ParseUUIDPipe) id: string) {
    return this.media.usage(id);
  }

  @Post('uploads')
  @ApiCreatedResponse({
    type: UploadIntentResponse,
    description: 'POST the file to uploadUrl with `fields`, then call /confirm',
  })
  createUpload(@Body() dto: CreateUploadDto, @CurrentUser() user: AuthUser) {
    return this.media.createUpload(dto, user.userId);
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MediaResponse })
  confirm(@Param('id', ParseUUIDPipe) id: string) {
    return this.media.confirmUpload(id);
  }

  @Post('external')
  @ApiCreatedResponse({ type: MediaResponse })
  createExternal(
    @Body() dto: CreateExternalMediaDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.media.createExternal(dto, user.userId);
  }

  @Patch(':id')
  @ApiOkResponse({ type: MediaResponse })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMediaDto) {
    return this.media.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiConflictResponse({ description: 'Media is still referenced by content' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.media.remove(id);
  }
}
