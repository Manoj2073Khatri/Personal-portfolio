import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHash, randomUUID } from 'node:crypto';
import { APP_ENV, type AppEnv } from '../../config/env';
import { UserService } from '../user/user.service';
import { JwtPayload } from './auth.types';
import { AuthUserResponse, TokenResponse } from './dto/auth.dto';

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

// Compared against when the email is unknown so response time doesn't reveal accounts.
const DUMMY_HASH = bcrypt.hashSync('timing-equalizer', 12);

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function toAuthUser(user: User): AuthUserResponse {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(APP_ENV) private readonly env: AppEnv,
  ) {}

  /** Only admins can sign in: the CMS is the only consumer of these tokens. */
  async login(email: string, password: string): Promise<TokenResponse> {
    const user = await this.userService.findByEmail(email);
    const valid = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
    if (!user || !valid || user.role !== Role.ADMIN) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueTokens(user, true);
  }

  async refresh(refreshToken: string): Promise<TokenResponse> {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.env.jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (payload.typ !== 'refresh')
      throw new UnauthorizedException('Invalid refresh token');

    const user = await this.userService.findById(payload.sub);
    if (
      !user ||
      user.role !== Role.ADMIN ||
      user.refreshToken !== hashToken(refreshToken)
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.signTokens(user);
    const rotated = await this.userService.rotateRefreshTokenHash(
      user.id,
      hashToken(refreshToken),
      hashToken(tokens.refreshToken),
    );
    if (!rotated) throw new UnauthorizedException('Refresh token already used');
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.userService.setRefreshTokenHash(userId, null);
  }

  async me(userId: string): Promise<AuthUserResponse> {
    const user = await this.userService.findById(userId);
    if (!user) throw new UnauthorizedException();
    return toAuthUser(user);
  }

  private async issueTokens(
    user: User,
    isLogin: boolean,
  ): Promise<TokenResponse> {
    const tokens = await this.signTokens(user);
    await this.userService.setRefreshTokenHash(
      user.id,
      hashToken(tokens.refreshToken),
      isLogin,
    );
    return tokens;
  }

  private async signTokens(user: User): Promise<TokenResponse> {
    const base = { sub: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...base, typ: 'access' } satisfies JwtPayload,
        { secret: this.env.jwtSecret, expiresIn: ACCESS_TOKEN_TTL_SECONDS },
      ),
      this.jwtService.signAsync(
        { ...base, typ: 'refresh', jti: randomUUID() } satisfies JwtPayload,
        {
          secret: this.env.jwtRefreshSecret,
          expiresIn: REFRESH_TOKEN_TTL_SECONDS,
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: ACCESS_TOKEN_TTL_SECONDS,
      refreshTokenExpiresIn: REFRESH_TOKEN_TTL_SECONDS,
      user: toAuthUser(user),
    };
  }
}
