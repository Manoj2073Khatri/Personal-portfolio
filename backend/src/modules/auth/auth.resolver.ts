import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { UnauthorizedException } from '@nestjs/common';
import express from 'express';

import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CreateUserInput } from '../user/dto/create-user.input';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Mutation(() => String)
  async signup(
    @Args('createUserInput') createUserInput: CreateUserInput,
    @Context('res') res: express.Response,
  ): Promise<string> {
    const user = await this.userService.create(createUserInput);
    const { access_token } = await this.authService.login(user, res);
    return access_token;
  }

  @Mutation(() => String)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
    @Context('res') res: express.Response,
  ): Promise<string> {
    const user = await this.authService.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const { access_token } = await this.authService.login(user, res);
    return access_token;
  }

  @Mutation(() => String)
  async refreshToken(
    @Context('req') req: express.Request,
    @Context('res') res: express.Response,
  ): Promise<string> {
    const token = req.cookies?.['refresh_token'] as string | undefined;
    if (!token) throw new UnauthorizedException('No refresh token');

    const payload = this.authService.verifyRefreshToken(token);
    const user = await this.authService.validateRefreshToken(
      payload.sub,
      token,
    );
    if (!user) throw new UnauthorizedException('Invalid refresh token');

    const { access_token } = await this.authService.login(user, res);
    return access_token;
  }

  @Mutation(() => Boolean)
  logout(@Context('res') res: express.Response): boolean {
    res.clearCookie('refresh_token');
    return true;
  }
}
