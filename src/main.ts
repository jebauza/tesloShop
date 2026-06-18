import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT ?? 3000;

  // Helmet configura cabeceras HTTP seguras para proteger contra vulnerabilidades
  // comunes como XSS, clickjacking y MIME-type sniffing.
  app.use(helmet());

  // En producción se restringe CORS a los orígenes explícitos definidos en variables de entorno
  // para evitar peticiones cross-origin no autorizadas.
  // En desarrollo se permiten todos los orígenes por comodidad.
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];
  app.enableCors({
    origin: process.env.STAGE === 'prod' ? allowedOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Se excluyen OPTIONS, HEAD y TRACE para reducir la superficie de ataque
    credentials: true, // Permite cookies y cabeceras Authorization en peticiones cross-origin
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation
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
