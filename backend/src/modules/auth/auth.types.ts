import { Role } from '@prisma/client';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}

export type AuthRequest = Request & { user: AuthUser };
