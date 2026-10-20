import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import type { AppEnv } from './config/env';
import { createValidationPipe } from './modules/common/validation';

export const API_PREFIX = 'api/v1';

/** HTTP pipeline shared by main.ts and the e2e tests. */
export function configureApp(app: NestExpressApplication, env: AppEnv): void {
  if (env.trustProxy > 0) app.set('trust proxy', env.trustProxy);
  app.disable('x-powered-by');
  app.use(helmet());
  app.enableCors({
    origin: env.corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  });
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(createValidationPipe());
  app.enableShutdownHooks();
}

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Portfolio CMS API')
    .setDescription(
      'Public read endpoints under /public, admin endpoints under /admin (bearer token, ADMIN role). See docs/api-contracts.md.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Swagger UI needs inline scripts, so relax CSP only for its route.
  app.use('/api/docs', (_req: Request, res: Response, next: NextFunction) => {
    res.removeHeader('Content-Security-Policy');
    next();
  });
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
  });
}
