import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT ?? 3000;

  // Prefijo global
  app.setGlobalPrefix('api');

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // transforma payloads a DTOs
      transformOptions: {
        enableImplicitConversion: true, // permite conversión de tipos automáticamente
      },
    }),
  );

  // --- CONFIGURACIÓN SWAGGER CON JWT ---
  const config = new DocumentBuilder()
    .setTitle('Mi API')
    .setDescription('Documentación automática de la API con JWT')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT', // Nombre del esquema de seguridad
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true }, // Mantener token al recargar
  });
  // --------------------------------------

  await app.listen(port);
  logger.log(`App running on http://localhost:${port}/api`);
  logger.log(`Swagger docs available on http://localhost:${port}/api/docs`);
}
bootstrap();
