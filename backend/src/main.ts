import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── Security headers ─────────────────────────────────────
  app.use(
    helmet({
      // Relax CSP for Swagger UI to load its own scripts/styles
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production'
          ? {
              directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:'],
                scriptSrc: ["'self'"],
              },
            }
          : false,
    }),
  );

  // ─── API versioning & prefix ──────────────────────────────
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // ─── Global validation ────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Global exception filter ──────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());

  // ─── CORS ─────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // ─── Swagger / OpenAPI 3.1 ────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Avenza — API')
    .setDescription(
      `
## Overview
REST API for the Avenza e-governance platform.

## Authentication
All protected endpoints require a **Bearer token** in the Authorization header.

1. Call **POST /api/v1/auth/login** to receive an \`accessToken\` (15 min) and \`refreshToken\` (7 days).
2. Pass \`Authorization: Bearer <accessToken>\` on every subsequent request.
3. When the access token expires, call **POST /api/v1/auth/refresh** with your refresh token to receive a new token pair.
4. Call **POST /api/v1/auth/logout** to invalidate both tokens immediately.

## Roles
- **CITIZEN** — can manage their own complaints and document requests.
- **ADMIN** — can view and update all submissions system-wide.
      `,
    )
    .setVersion('2.0.0')
    .setContact('Avenza Platform Team', '', 'admin@avenza.gov.pk')
    .setLicense('Proprietary', '')
    .addBearerAuth()
    .addServer('http://localhost:4000', 'Local development')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // keeps your Bearer token across page refreshes
      docExpansion: 'list',
      filter: true,
      tagsSorter: 'alpha',
    },
    customSiteTitle: 'Avenza API Docs',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`\n🏛️  Avenza backend running on port ${port}`);
  console.log(`📖  Swagger UI:  http://localhost:${port}/api/docs`);
  console.log(`❤️   Health:      http://localhost:${port}/api/v1/health\n`);
}

bootstrap();
