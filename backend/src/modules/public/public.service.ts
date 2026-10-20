import { Injectable } from '@nestjs/common';
import { CredentialKind } from '@prisma/client';
import { ArticlesService } from '../articles/articles.service';
import { CredentialsService } from '../credentials/credentials.service';
import { ExperienceService } from '../experience/experience.service';
import { ProjectsService } from '../projects/projects.service';
import { HomepageSectionKey } from '../settings/dto/settings.dto';
import { SettingsService } from '../settings/settings.service';
import { SkillsService } from '../skills/skills.service';
import { TestimonialsService } from '../testimonials/testimonials.service';

const HOME_PROJECT_LIMIT = 12;
const HOME_ARTICLE_LIMIT = 3;

@Injectable()
export class PublicService {
  constructor(
    private readonly settings: SettingsService,
    private readonly projects: ProjectsService,
    private readonly articles: ArticlesService,
    private readonly skills: SkillsService,
    private readonly experience: ExperienceService,
    private readonly credentials: CredentialsService,
    private readonly testimonials: TestimonialsService,
  ) {}

  /**
   * Everything the homepage renders, in one request. Disabled sections are
   * returned empty without querying them.
   */
  async home() {
    const settings = await this.settings.get();
    const enabled = new Set<HomepageSectionKey>(
      settings.homepageSections.filter((s) => s.enabled).map((s) => s.key),
    );
    const when = <T>(
      key: HomepageSectionKey,
      load: () => Promise<T>,
      empty: T,
    ) => (enabled.has(key) ? load() : Promise.resolve(empty));
    const needCredentials =
      enabled.has('education') || enabled.has('certifications');

    const [projects, articles, skills, experience, credentials, testimonials] =
      await Promise.all([
        when(
          'projects',
          () =>
            this.projects.publicList({ page: 1, limit: HOME_PROJECT_LIMIT }),
          null,
        ),
        when(
          'articles',
          () =>
            this.articles.publicList({ page: 1, limit: HOME_ARTICLE_LIMIT }),
          null,
        ),
        when('skills', () => this.skills.publicGroups(), []),
        when('experience', () => this.experience.publicList(), []),
        needCredentials ? this.credentials.publicList() : Promise.resolve([]),
        when('testimonials', () => this.testimonials.publicList(), []),
      ]);

    return {
      settings,
      projects: projects?.data ?? [],
      totalProjects: projects?.meta.total ?? 0,
      articles: articles?.data ?? [],
      totalArticles: articles?.meta.total ?? 0,
      skills,
      experience,
      education: enabled.has('education')
        ? credentials.filter((c) => c.kind === CredentialKind.EDUCATION)
        : [],
      certifications: enabled.has('certifications')
        ? credentials.filter((c) => c.kind === CredentialKind.CERTIFICATION)
        : [],
      testimonials,
    };
  }

  async sitemap() {
    const [projects, articles, settings] = await Promise.all([
      this.projects.publicSlugs(),
      this.articles.publicSlugs(),
      this.settings.get(),
    ]);
    return { siteUpdatedAt: settings.updatedAt, projects, articles };
  }
}
