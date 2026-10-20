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
import {
  CreateExperienceDto,
  ExperienceQueryDto,
  ExperienceResponse,
  UpdateExperienceDto,
} from './dto/experience.dto';
import { ExperienceService } from './experience.service';

@ApiTags('admin: experience')
@AdminOnly()
@Controller('admin/experiences')
export class ExperienceController {
  constructor(private readonly experience: ExperienceService) {}

  @Get()
  list(@Query() query: ExperienceQueryDto) {
    return this.experience.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: ExperienceResponse })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.experience.get(id);
  }

  @Post()
  @ApiCreatedResponse({ type: ExperienceResponse })
  create(@Body() dto: CreateExperienceDto, @CurrentUser() user: AuthUser) {
    return this.experience.create(dto, user.userId);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ExperienceResponse })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExperienceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.experience.update(id, dto, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.experience.remove(id);
  }
}
