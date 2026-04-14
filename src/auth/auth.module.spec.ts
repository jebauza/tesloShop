import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from './entities/user.entity';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '2h' },
        }),
        AuthModule,
      ],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue({
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
      })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn().mockReturnValue('test-secret'),
        getOrThrow: jest.fn().mockReturnValue('test-secret'),
      })
      .compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have AuthController as controller', () => {
    const controller = module.get<AuthController>(AuthController);
    expect(controller).toBeDefined();
  });

  it('should have AuthService as provider', () => {
    const service = module.get<AuthService>(AuthService);
    expect(service).toBeDefined();
  });

  it('should have JwtStrategy as provider', () => {
    const strategy = module.get<JwtStrategy>(JwtStrategy);
    expect(strategy).toBeDefined();
  });

  it('should have JwtModule as module', () => {
    const jwtModule = module.get<JwtModule>(JwtModule);
    expect(jwtModule).toBeDefined();
  });
});
