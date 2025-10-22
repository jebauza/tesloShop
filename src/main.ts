import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT ?? 3000;

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true,
      // transform: true,
      transformOptions: {
        exposeUnsetFields: false,
        // enableImplicitConversion: true,
      }
    }),
  );

  await app.listen(port);
  logger.log(`App running on port ${port}`);
}
bootstrap();
