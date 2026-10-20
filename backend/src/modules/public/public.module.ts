import { Module } from '@nestjs/common';
import { ArticlesModule } from '../articles/articles.module';
import { CredentialsModule } from '../credentials/credentials.module';
import { ExperienceModule } from '../experience/experience.module';
import { ProjectsModule } from '../projects/projects.module';
import { SettingsModule } from '../settings/settings.module';
import { SkillsModule } from '../skills/skills.module';
import { TestimonialsModule } from '../testimonials/testimonials.module';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

@Module({
  imports: [
    SettingsModule,
    ProjectsModule,
    ArticlesModule,
    SkillsModule,
    ExperienceModule,
    CredentialsModule,
    TestimonialsModule,
  ],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
