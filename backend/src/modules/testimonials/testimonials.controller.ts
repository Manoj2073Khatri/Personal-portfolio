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
  CreateTestimonialDto,
  TestimonialQueryDto,
  TestimonialResponse,
  UpdateTestimonialDto,
} from './dto/testimonials.dto';
import { TestimonialsService } from './testimonials.service';

@ApiTags('admin: testimonials')
@AdminOnly()
@Controller('admin/testimonials')
export class TestimonialsController {
  constructor(private readonly testimonials: TestimonialsService) {}

  @Get()
  list(@Query() query: TestimonialQueryDto) {
    return this.testimonials.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: TestimonialResponse })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.testimonials.get(id);
  }

  @Post()
  @ApiCreatedResponse({ type: TestimonialResponse })
  create(@Body() dto: CreateTestimonialDto, @CurrentUser() user: AuthUser) {
    return this.testimonials.create(dto, user.userId);
  }

  @Patch(':id')
  @ApiOkResponse({ type: TestimonialResponse })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTestimonialDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.testimonials.update(id, dto, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.testimonials.remove(id);
  }
}
