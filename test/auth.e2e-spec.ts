import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppTestModule } from './app-test.module';

const request = require('supertest');

describe('AuthController (E2E)', () => {
  let app: INestApplication;
  let token: string;

  const user = {
    email: 'test@example.com',
    fullname: 'Test User',
    password: 'QWEasd123',
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppTestModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register → should register a user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201);

    expect(res.body.token).toBeDefined();
    expect(res.body.email).toBe(user.email);
  });

  it('POST /auth/login → should return token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(200);

    token = res.body.token;
    expect(token).toBeDefined();
  });

  it('GET /auth/me → should return authenticated user', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.email).toBe(user.email);
  });
});
