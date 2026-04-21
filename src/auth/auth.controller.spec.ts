import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/request/create-user.dto';
import { LoginUserDto } from './dto/request/login-user.dto';
import { User } from './entities/user.entity';
import { Reflector } from '@nestjs/core';
import { META_ROLES } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      checkAuthStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        Reflector,
      ],
      controllers: [AuthController],
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('registerUser: calling authService.register', async () => {
    const dto: CreateUserDto = {
      email: 'juan@email.com',
      fullname: 'Juan Perez',
      password: 'Abcd1234!',
    };

    await authController.registerUser(dto);

    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('loginUser: calling authService.login', async () => {
    const dto: LoginUserDto = {
      email: 'juan@email.com',
      password: 'Abcd1234!',
    };

    await authController.loginUser(dto);

    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('meUser: calling authService.checkAuthStatus', () => {
    const user = {
      id: '123',
      email: 'juan@email.com',
      fullname: 'Juan Perez',
      password: 'Abcd1234!',
    } as User;

    authController.meUser(user);

    expect(authService.checkAuthStatus).toHaveBeenCalledWith(user);
  });

  it('testingPrivateRoute2: should return user and have superUser+admin role metadata', () => {
    const user = {
      id: '123',
      email: 'juan@email.com',
      fullname: 'Juan Perez',
      roles: [ValidRoles.superUser],
    } as User;

    const result = authController.testingPrivateRoute2(user);

    expect(result).toEqual({ user });

    const reflector = new Reflector();
    const roles = reflector.get<ValidRoles[]>(
      META_ROLES,
      authController.testingPrivateRoute2,
    );
    expect(roles).toEqual([ValidRoles.superUser, ValidRoles.admin]);
  });

  it('testingPrivateRoute3: should return user and have no role metadata', () => {
    const user = {
      id: '123',
      email: 'juan@email.com',
      fullname: 'Juan Perez',
      roles: [ValidRoles.user],
    } as User;

    const result = authController.testingPrivateRoute3(user);

    expect(result).toEqual({ user });

    const reflector = new Reflector();
    const roles = reflector.get<ValidRoles[]>(
      META_ROLES,
      authController.testingPrivateRoute3,
    );
    expect(roles).toEqual([]);
  });

  it('testingPrivateRoute4: should return user and have admin role metadata', () => {
    const user = {
      id: '123',
      email: 'juan@email.com',
      fullname: 'Juan Perez',
      roles: [ValidRoles.admin],
    } as User;

    const result = authController.testingPrivateRoute4(user);

    expect(result).toEqual({ user });

    const reflector = new Reflector();
    const roles = reflector.get<ValidRoles[]>(
      META_ROLES,
      authController.testingPrivateRoute4,
    );
    expect(roles).toEqual([ValidRoles.admin]);
  });

  it('testingPrivateRoute: should return user, email, and headers', () => {
    const request = {} as Express.Request;
    const user = {
      id: '123',
      email: 'juan@email.com',
      fullname: 'Juan Perez',
    } as User;
    const rawHeaders = ['header1: value1', 'header2: value2'];
    const headers = { header1: 'value1', header2: 'value2' };

    const result = authController.testingPrivateRoute(
      request,
      user,
      user.email,
      rawHeaders,
      headers,
    );

    expect(result).toEqual({
      user,
      email: user.email,
      rawHeaders,
      headers,
    });
  });
});
