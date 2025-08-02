import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // ✅ Middleware for cookie support
  app.use(cookieParser());

  app.enableCors({
    origin: [
      // 'http://localhost:3000', // frontend dev
      'https://www.manoj-khatri.com.np/', // frontend prod
    ],
    credentials: true,
  });

  app.use(
    helmet({
      contentSecurityPolicy: false, // disable if needed, else configure properly
    }),
  );
  // ✅ Swagger config
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API documentation for REST endpoints')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter access token',
        in: 'header',
      },
      'access-token', // Reference name
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Accessible at /api/docs

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
