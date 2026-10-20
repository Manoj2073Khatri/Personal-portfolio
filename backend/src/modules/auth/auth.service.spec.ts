import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { loadEnv } from '../../config/env';
import { UserService } from '../user/user.service';
import { AuthService, hashToken } from './auth.service';
import { JwtPayload } from './auth.types';

const env = loadEnv({
  DATABASE_URL: 'postgresql://unused',
  JWT_SECRET: 'access-secret-'.padEnd(40, 'x'),
  JWT_REFRESH_SECRET: 'refresh-secret-'.padEnd(40, 'y'),
});

describe('AuthService', () => {
  let user: User;
  let users: jest.Mocked<
    Pick<
      UserService,
      | 'findByEmail'
      | 'findById'
      | 'setRefreshTokenHash'
      | 'rotateRefreshTokenHash'
    >
  >;
  let service: AuthService;
  const jwt = new JwtService({});

  beforeEach(async () => {
    user = {
      id: 'user-1',
      email: 'admin@example.com',
      name: 'Admin',
      password: await bcrypt.hash('correct horse battery', 4),
      role: Role.ADMIN,
      refreshToken: null,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users = {
      findByEmail: jest.fn(async (email: string) =>
        email === user.email ? user : null,
      ),
      findById: jest.fn(async (id: string) => (id === user.id ? user : null)),
      setRefreshTokenHash: jest.fn(async (_id: string, hash: string | null) => {
        user.refreshToken = hash;
      }),
      rotateRefreshTokenHash: jest.fn(
        async (_id: string, expected: string, next: string) => {
          if (user.refreshToken !== expected) return false;
          user.refreshToken = next;
          return true;
        },
      ),
    };
    service = new AuthService(users as unknown as UserService, jwt, env);
  });

  it('issues typed access and refresh tokens signed with different secrets', async () => {
    const tokens = await service.login(user.email, 'correct horse battery');
    const access = jwt.verify<JwtPayload>(tokens.accessToken, {
      secret: env.jwtSecret,
    });
    const refresh = jwt.verify<JwtPayload>(tokens.refreshToken, {
      secret: env.jwtRefreshSecret,
    });
    expect(access.typ).toBe('access');
    expect(refresh.typ).toBe('refresh');
    expect(refresh.jti).toBeDefined();
    expect(() =>
      jwt.verify(tokens.refreshToken, { secret: env.jwtSecret }),
    ).toThrow();
    expect(tokens.user).not.toHaveProperty('password');
  });

  it('stores only a SHA-256 hash of the refresh token', async () => {
    const tokens = await service.login(user.email, 'correct horse battery');
    expect(user.refreshToken).toBe(hashToken(tokens.refreshToken));
    expect(user.refreshToken).not.toContain(tokens.refreshToken);
  });

  it.each([
    ['wrong password', 'admin@example.com', 'nope'],
    ['unknown email', 'ghost@example.com', 'correct horse battery'],
  ])('rejects %s with the same message', async (_case, email, password) => {
    await expect(service.login(email, password)).rejects.toThrow(
      'Invalid email or password',
    );
  });

  it('rejects non-admin accounts', async () => {
    user.role = Role.USER;
    await expect(
      service.login(user.email, 'correct horse battery'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rotates refresh tokens and rejects reuse of the old one', async () => {
    const first = await service.login(user.email, 'correct horse battery');
    const second = await service.refresh(first.refreshToken);
    expect(second.refreshToken).not.toBe(first.refreshToken);
    await expect(service.refresh(first.refreshToken)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(service.refresh(second.refreshToken)).resolves.toBeDefined();
  });

  it('does not accept an access token as a refresh token', async () => {
    const tokens = await service.login(user.email, 'correct horse battery');
    await expect(service.refresh(tokens.accessToken)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('logout revokes the refresh token', async () => {
    const tokens = await service.login(user.email, 'correct horse battery');
    await service.logout(user.id);
    await expect(service.refresh(tokens.refreshToken)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
