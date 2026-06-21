import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT ?? 3000;

  // --- HELMET ---
  // Sets secure HTTP headers to protect against common web vulnerabilities
  // such as XSS, clickjacking, and MIME-type sniffing.
  app.use(helmet());
  // --------------

  // --- CORS ---
  // In production, restricted to explicit origins from environment variables
  // to prevent unauthorized cross-origin requests.
  // In development, all origins are allowed for convenience.
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];
  app.enableCors({
    origin: process.env.STAGE === 'prod' ? allowedOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // OPTIONS, HEAD and TRACE are excluded to reduce attack surface
    credentials: true, // Allows cookies and Authorization headers in cross-origin requests
  });
  // ------------

  // --- GLOBAL PREFIX ---
  // All routes are prefixed with /api (e.g. /api/products, /api/auth).
  app.setGlobalPrefix('api');
  // ---------------------

  // --- GLOBAL VALIDATION ---
  // Validates and transforms all incoming request payloads using class-validator.
  // Strips unknown properties (whitelist) and rejects requests with extra fields.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // transforms payloads to DTOs
      transformOptions: {
        enableImplicitConversion: true, // enables automatic type conversion
      },
    }),
  );
  // -------------------------

  // --- SWAGGER WITH JWT ---
  const config = new DocumentBuilder()
    .setTitle('Teslo RESTFul API')
    .setDescription('Teslo shop endpoints')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT',
    )
    .addTag('Auth')
    .addTag('Products')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true }, // Persist token on refresh
  });
  // --------------------------------------

  await app.listen(port);
  logger.log(`App running on http://localhost:${port}/api`);
  logger.log(`Swagger docs available on http://localhost:${port}/api/docs`);
}
bootstrap();
