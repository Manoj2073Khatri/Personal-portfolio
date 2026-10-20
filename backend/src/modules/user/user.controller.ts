// user/user.controller.ts
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import type { AuthRequest, AuthUser } from '../auth/auth.types';

@ApiTags('users') // Group name in Swagger
@ApiBearerAuth()
@Controller('users')
export class UserController {
  @UseGuards(GqlAuthGuard)
  @Get('me')
  getProfile(@Req() req: AuthRequest): AuthUser {
    return req.user;
  }
}
