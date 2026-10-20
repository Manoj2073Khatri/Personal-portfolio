import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../common/decorators/admin.decorator';
import { StatsResponse, StatsService } from './stats.service';

@ApiTags('admin: dashboard')
@AdminOnly()
@Controller('admin/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOkResponse({ type: StatsResponse })
  stats(): Promise<StatsResponse> {
    return this.statsService.stats();
  }
}
