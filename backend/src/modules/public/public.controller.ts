import {
  Controller,
  Get,
  Injectable,
  NotFoundException,
  Param,
  PipeTransform,
  Query,
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ArticlesService } from '../articles/articles.service';
import {
  PublicArticle,
  PublicArticleQueryDto,
} from '../articles/dto/articles.dto';
import { SLUG_PATTERN } from '../common/utils/content';
import {
  ProjectResponse,
  PublicProjectQueryDto,
} from '../projects/dto/projects.dto';
import { ProjectsService } from '../projects/projects.service';
import { SettingsResponse } from '../settings/dto/settings.dto';
import { SettingsService } from '../settings/settings.service';
import { PublicService } from './public.service';

/** Malformed slugs can never match a record, so they are a 404, not a 400. */
@Injectable()
export class ParseSlugPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!SLUG_PATTERN.test(value) || value.length > 80)
      throw new NotFoundException();
    return value;
  }
}

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(
    private readonly publicService: PublicService,
    private readonly settings: SettingsService,
    private readonly projects: ProjectsService,
    private readonly articles: ArticlesService,
  ) {}

  @Get('site')
  @ApiOkResponse({ type: SettingsResponse })
  site() {
    return this.settings.get();
  }

  @Get('home')
  @ApiOkResponse({
    description: 'Settings plus every published homepage section',
  })
  home() {
    return this.publicService.home();
  }

  @Get('projects')
  projectList(@Query() query: PublicProjectQueryDto) {
    return this.projects.publicList(query);
  }

  @Get('projects/:slug')
  @ApiOkResponse({
    type: ProjectResponse,
    description: 'Published projects only (no status field)',
  })
  @ApiNotFoundResponse()
  project(@Param('slug', ParseSlugPipe) slug: string) {
    return this.projects.publicBySlug(slug);
  }

  @Get('articles')
  articleList(@Query() query: PublicArticleQueryDto) {
    return this.articles.publicList(query);
  }

  @Get('articles/tags')
  articleTags() {
    return this.articles.publicTags();
  }

  @Get('articles/:slug')
  @ApiOkResponse({ type: PublicArticle })
  @ApiNotFoundResponse()
  article(@Param('slug', ParseSlugPipe) slug: string) {
    return this.articles.publicBySlug(slug);
  }

  @Get('sitemap')
  @ApiOkResponse({ description: 'Published slugs with last-modified dates' })
  sitemap() {
    return this.publicService.sitemap();
  }
}
