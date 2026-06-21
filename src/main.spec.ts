import { NestFactory } from '@nestjs/core';
import { bootstrap } from './main';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Observable } from 'rxjs';

jest.mock('@nestjs/common', () => ({
  Logger: jest.fn().mockReturnValue({
    log: jest.fn(),
  }),
  ValidationPipe: jest.requireActual('@nestjs/common').ValidationPipe,
}));

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockReturnValue({
      use: jest.fn(),
      enableCors: jest.fn(),
      setGlobalPrefix: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn(),
    }),
  },
}));

jest.mock('@nestjs/swagger', () => ({
  DocumentBuilder: jest.fn().mockReturnValue({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addBearerAuth: jest.fn().mockReturnThis(),
    addTag: jest.fn().mockReturnThis(),
    build: jest.fn(),
  }),
  SwaggerModule: {
    createDocument: jest.fn(),
    setup: jest.fn(),
  },
}));

jest.mock('./app.module', () => ({
  AppModule: jest.fn().mockReturnValue('AppModule'),
}));

const mockHelmetMiddleware = jest.fn();
jest.mock('helmet', () => jest.fn(() => mockHelmetMiddleware));

describe('Main', () => {
  let mockApp: {
    use: jest.Mock;
    enableCors: jest.Mock;
    setGlobalPrefix: jest.Mock;
    useGlobalPipes: jest.Mock;
    listen: jest.Mock;
  };

  let mockLogger: { log: jest.Mock };

  beforeEach(() => {
    mockApp = {
      use: jest.fn(),
      enableCors: jest.fn(),
      setGlobalPrefix: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn(),
    };

    mockLogger = { log: jest.fn() };

    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
    (Logger as unknown as jest.Mock).mockReturnValue(mockLogger);
  });

  it('should configure the app', async () => {
    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(mockLogger.log).toHaveBeenCalledWith(
      'App running on http://localhost:3000/api',
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      'Swagger docs available on http://localhost:3000/api/docs',
    );
  });

  it('should use custom port from environment variable when PORT is set', async () => {
    const port = '3001';
    process.env.PORT = port;
    await bootstrap();

    expect(mockLogger.log).toHaveBeenCalledWith(
      `App running on http://localhost:${port}/api`,
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      `Swagger docs available on http://localhost:${port}/api/docs`,
    );

    delete process.env.PORT;
  });

  it('should use helmet middleware', async () => {
    await bootstrap();

    expect(mockApp.use).toHaveBeenCalledWith(mockHelmetMiddleware);
  });

  it('should allow all origins in development environment', async () => {
    await bootstrap();

    expect(mockApp.enableCors).toHaveBeenCalledWith({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    });
  });

  it('should restrict CORS to allowed origins in production environment', async () => {
    process.env.STAGE = 'prod';
    process.env.ALLOWED_ORIGINS = 'https://example.com,https://app.example.com';
    await bootstrap();

    expect(mockApp.enableCors).toHaveBeenCalledWith({
      origin: ['https://example.com', 'https://app.example.com'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    });

    delete process.env.STAGE;
    delete process.env.ALLOWED_ORIGINS;
  });

  it('should set global prefix to /api', async () => {
    await bootstrap();

    expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api');
  });

  it('should configure global validation pipe', async () => {
    await bootstrap();

    expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
      expect.objectContaining({
        errorHttpStatusCode: 400,
        isTransformEnabled: true,
        transformOptions: { enableImplicitConversion: true },
        validatorOptions: expect.objectContaining({
          forbidNonWhitelisted: true,
          forbidUnknownValues: false,
          whitelist: true,
        }),
      }),
    );
  });

  it('should instantiate DocumentBuilder with no arguments', async () => {
    await bootstrap();

    expect(DocumentBuilder).toHaveBeenCalled();
    expect(DocumentBuilder).toHaveBeenCalledWith();
  });

  it('should configure Swagger with JWT bearer auth', async () => {
    await bootstrap();
    const mockBuilder = (DocumentBuilder as jest.Mock).mock.results[0].value;

    expect(mockBuilder.setTitle).toHaveBeenCalledWith('Teslo RESTFul API');
    expect(mockBuilder.setDescription).toHaveBeenCalledWith(
      'Teslo shop endpoints',
    );
    expect(mockBuilder.setVersion).toHaveBeenCalledWith('1.0');
    expect(mockBuilder.addBearerAuth).toHaveBeenCalledWith(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    );
    expect(mockBuilder.addTag).toHaveBeenCalledWith('Auth');
    expect(mockBuilder.addTag).toHaveBeenCalledWith('Products');
    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(
      mockApp,
      undefined,
    );
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'api/docs',
      mockApp,
      undefined,
      {
        swaggerOptions: { persistAuthorization: true },
      },
    );
  });
});
