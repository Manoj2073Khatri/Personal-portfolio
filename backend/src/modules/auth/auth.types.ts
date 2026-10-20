import { Role } from '@prisma/client';
import { Request } from 'express';

export type TokenType = 'access' | 'refresh';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  typ: TokenType;
  /** Present on refresh tokens; makes each issued token unique. */
  jti?: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}

export type AuthRequest = Request & { user: AuthUser };
