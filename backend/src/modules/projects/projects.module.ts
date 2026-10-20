import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { SkillsModule } from '../skills/skills.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [MediaModule, SkillsModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
