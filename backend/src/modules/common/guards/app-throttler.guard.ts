import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ThrottlerGuard,
  type ThrottlerModuleOptions,
  type ThrottlerStorage,
  getOptionsToken,
  getStorageToken,
} from '@nestjs/throttler';
import { Request } from 'express';
import { APP_ENV, type AppEnv } from '../../../config/env';
import { isTrustedServerRequest, resolveClientIp } from '../utils/client-ip';

/**
 * Rate limits per end-user IP. Server-side rendering fetches from the trusted
 * Next.js server that carry no client IP are exempt, because they would
 * otherwise all share the server's IP.
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  constructor(
    @Inject(getOptionsToken()) options: ThrottlerModuleOptions,
    @Inject(getStorageToken()) storage: ThrottlerStorage,
    reflector: Reflector,
    @Inject(APP_ENV) private readonly env: AppEnv,
  ) {
    super(options, storage, reflector);
  }

  protected getTracker(req: Record<string, any>): Promise<string> {
    const ip = resolveClientIp(req as Request, this.env.internalApiKey);
    return Promise.resolve(ip ?? 'unknown');
  }

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    if (
      isTrustedServerRequest(req, this.env.internalApiKey) &&
      !resolveClientIp(req, this.env.internalApiKey)
    ) {
      return true;
    }
    return super.shouldSkip(context);
  }
}
