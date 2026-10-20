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
import { ArticlesService } from './articles.service';
import {
  ArticleQueryDto,
  ArticleResponse,
  CreateArticleDto,
  UpdateArticleDto,
} from './dto/articles.dto';

@ApiTags('admin: articles')
@AdminOnly()
@Controller('admin/articles')
export class ArticlesController {
  constructor(private readonly articles: ArticlesService) {}

  @Get()
  list(@Query() query: ArticleQueryDto) {
    return this.articles.list(query);
  }

  @Get(':id')
  @ApiOkResponse({
    type: ArticleResponse,
    description: 'Includes drafts (used for preview)',
  })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.articles.get(id);
  }

  @Post()
  @ApiCreatedResponse({ type: ArticleResponse })
  create(@Body() dto: CreateArticleDto, @CurrentUser() user: AuthUser) {
    return this.articles.create(dto, user.userId);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ArticleResponse })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateArticleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.articles.update(id, dto, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.articles.remove(id);
  }
}
