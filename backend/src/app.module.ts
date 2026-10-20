import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './infra/prisma/prisma.module';
import { StorageModule } from './infra/storage/storage.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaExceptionFilter } from './modules/common/filters/prisma-exception.filter';
import { AppThrottlerGuard } from './modules/common/guards/app-throttler.guard';
import { ContactModule } from './modules/contact/contact.module';
import { CredentialsModule } from './modules/credentials/credentials.module';
import { ExperienceModule } from './modules/experience/experience.module';
import { HealthController } from './modules/health/health.controller';
import { MediaModule } from './modules/media/media.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { PublicModule } from './modules/public/public.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SkillsModule } from './modules/skills/skills.module';
import { StatsModule } from './modules/stats/stats.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    StorageModule,
    // Default: 120 requests/minute per client IP. Auth and contact routes set stricter limits.
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 120 }],
      errorMessage: 'Too many requests, please try again later',
    }),
    UserModule,
    AuthModule,
    MediaModule,
    SettingsModule,
    SkillsModule,
    ProjectsModule,
    ArticlesModule,
    ExperienceModule,
    CredentialsModule,
    TestimonialsModule,
    ContactModule,
    StatsModule,
    PublicModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
  ],
})
export class AppModule {}
