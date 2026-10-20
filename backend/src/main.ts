import { config } from 'dotenv';
// Load env before any module reads it. Real environment variables take precedence.
config({ path: '.env.local', quiet: true });

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp, setupSwagger } from './app.setup';
import { APP_ENV, AppEnv } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const env = app.get<AppEnv>(APP_ENV);

  configureApp(app, env);
  if (env.swaggerEnabled) setupSwagger(app);

  await app.listen(env.port);
  Logger.log(`API listening on port ${env.port}`, 'Bootstrap');
}
void bootstrap();
