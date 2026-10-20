import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { SkillsModule } from '../skills/skills.module';
import { ExperienceController } from './experience.controller';
import { ExperienceService } from './experience.service';

@Module({
  imports: [MediaModule, SkillsModule],
  controllers: [ExperienceController],
  providers: [ExperienceService],
  exports: [ExperienceService],
})
export class ExperienceModule {}
