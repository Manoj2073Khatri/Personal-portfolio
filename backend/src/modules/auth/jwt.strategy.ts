import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { APP_ENV, type AppEnv } from '../../config/env';
import { UserService } from '../user/user.service';
import { AuthUser, JwtPayload } from './auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(APP_ENV) env: AppEnv,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.jwtSecret,
      ignoreExpiration: false,
    });
  }

  /** Re-reads the user so deleted or demoted accounts lose access immediately. */
  async validate(payload: JwtPayload): Promise<AuthUser> {
    if (payload.typ !== 'access')
      throw new UnauthorizedException('Invalid token type');
    const user = await this.userService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return { userId: user.id, email: user.email, role: user.role };
  }
}
