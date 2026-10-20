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
  CreateSkillCategoryDto,
  CreateSkillDto,
  SkillCategoryResponse,
  SkillQueryDto,
  SkillResponse,
  UpdateSkillCategoryDto,
  UpdateSkillDto,
} from './dto/skills.dto';
import { SkillsService } from './skills.service';

@ApiTags('admin: skills')
@AdminOnly()
@Controller('admin/skill-categories')
export class SkillCategoriesController {
  constructor(private readonly skills: SkillsService) {}

  @Get()
  @ApiOkResponse({ type: [SkillCategoryResponse] })
  list() {
    return this.skills.listCategories();
  }

  @Post()
  @ApiCreatedResponse({ type: SkillCategoryResponse })
  create(@Body() dto: CreateSkillCategoryDto) {
    return this.skills.createCategory(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: SkillCategoryResponse })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSkillCategoryDto,
  ) {
    return this.skills.updateCategory(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.skills.removeCategory(id);
  }
}

@ApiTags('admin: skills')
@AdminOnly()
@Controller('admin/skills')
export class SkillsController {
  constructor(private readonly skills: SkillsService) {}

  @Get()
  list(@Query() query: SkillQueryDto) {
    return this.skills.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: SkillResponse })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.skills.get(id);
  }

  @Post()
  @ApiCreatedResponse({ type: SkillResponse })
  create(@Body() dto: CreateSkillDto, @CurrentUser() user: AuthUser) {
    return this.skills.create(dto, user.userId);
  }

  @Patch(':id')
  @ApiOkResponse({ type: SkillResponse })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSkillDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.skills.update(id, dto, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.skills.remove(id);
  }
}
