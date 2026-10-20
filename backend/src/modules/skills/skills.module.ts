import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import {
  SkillCategoriesController,
  SkillsController,
} from './skills.controller';
import { SkillsService } from './skills.service';

@Module({
  imports: [MediaModule],
  controllers: [SkillCategoriesController, SkillsController],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
