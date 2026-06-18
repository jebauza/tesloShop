import { bootstrap } from './main';

jest.mock('helmet', () => jest.fn(() => jest.fn()));

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockReturnValue({
      use: jest.fn(),
      setGlobalPrefix: jest.fn(),
      enableCors: jest.fn(),
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

describe('Main', () => {
  it('should configure the app', async () => {
    await bootstrap();
  });
});
