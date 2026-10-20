import { Resolver, Query, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.entity';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { AuthRequest } from '../auth/auth.types';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Query(() => [User])
  findAllUsers() {
    return this.userService.findAll();
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  async getProfile(@Context('req') req: AuthRequest) {
    return this.userService.findByEmail(req.user.email);
  }
}
