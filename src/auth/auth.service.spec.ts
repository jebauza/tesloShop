import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/request/create-user.dto';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto } from './dto/request/login-user.dto';

jest.mock('bcrypt', () => ({
  hashSync: jest.fn().mockReturnValue('hashed-password'),
  compareSync: jest.fn().mockReturnValue(true),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const mockUsersRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };
    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        AuthService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    const dto: CreateUserDto = {
      email: 'test@test.com',
      fullname: 'Test Test',
      password: 'Abcd1234!',
    };

    const user = {
      id: '7f1e94b2-8a3c-4e5d-b21a-90f4321c876b',
      email: dto.email,
      fullname: dto.fullname,
      isActive: true,
      roles: ['user'],
    } as User;

    it('should call create and return AuthResponseDto with a JWT token', async () => {
      jest.spyOn(authService, 'create').mockResolvedValue(user);

      const result = await authService.register(dto);

      expect(authService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        token: 'mock-jwt-token',
      });
    });

    it('should propagate exceptions thrown by create', async () => {
      jest
        .spyOn(authService, 'create')
        .mockRejectedValue(new BadRequestException('Email already exists'));

      await expect(authService.register(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('create', () => {
    const dto: CreateUserDto = {
      email: 'test@test.com',
      fullname: 'Test Test',
      password: 'Abcd1234!',
    };

    it('should create and return a new user with hashed password', async () => {
      const user = {
        id: '7f1e94b2-8a3c-4e5d-b21a-90f4321c876b',
        email: dto.email,
        fullname: dto.fullname,
        isActive: true,
        roles: ['user'],
      } as User;

      jest.spyOn(usersRepository, 'create').mockReturnValue(user);

      const result = await authService.create(dto);

      expect(bcrypt.hashSync).toHaveBeenCalledWith(dto.password, 10);
      expect(result).toEqual({
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        isActive: user.isActive,
        roles: user.roles,
      });
    });

    it('should throw BadRequestException when email is already taken (DB error 23505)', async () => {
      const error = { code: '23505', detail: 'Email already exists' };
      jest.spyOn(usersRepository, 'save').mockRejectedValue(error);

      await expect(authService.create(dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(authService.create(dto)).rejects.toThrow(error.detail);
    });

    it('should throw InternalServerErrorException and log error for unknown DB exceptions', async () => {
      const error = { code: 'not-23505', detail: 'Unknown error' };
      jest.spyOn(usersRepository, 'save').mockRejectedValue(error);
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => {});
      // const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await expect(authService.create(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(authService.create(dto)).rejects.toThrow(
        'Internal server error',
      );

      expect(loggerSpy).toHaveBeenCalledTimes(2);
      expect(loggerSpy).toHaveBeenCalledWith(error);
      // expect(console.log).toHaveBeenCalledTimes(2);
      // expect(console.log).toHaveBeenCalledWith(error);

      // logSpy.mockRestore();
    });
  });

  describe('login', () => {
    const dto: LoginUserDto = {
      email: 'test@test.com',
      password: 'Abcd1234!',
    };

    const user = {
      ...dto,
      id: '7f1e94b2-8a3c-4e5d-b21a-90f4321c876b',
      fullname: 'Test Test',
    } as User;

    it('should login successfully and return user data with a JWT token', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

      const result = await authService.login(dto);

      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        dto.password,
        user.password,
      );
      expect(result).toEqual({
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        token: 'mock-jwt-token',
      });
    });

    it('should throw UnauthorizedException when user email is not found', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      await expect(authService.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(dto)).rejects.toThrow(
        'Invalid credentials (email)',
      );
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      await expect(authService.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(dto)).rejects.toThrow(
        'Invalid credentials (password)',
      );
    });
  });

  describe('checkAuthStatus', () => {
    const user = {
      id: '7f1e94b2-8a3c-4e5d-b21a-90f4321c876b',
      email: 'test@test.com',
      fullname: 'Test Test',
      isActive: true,
    } as User;

    it('should return an AuthResponseDto with user details and a JWT token', () => {
      const result = authService.checkAuthStatus(user);

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        token: 'mock-jwt-token',
      });
    });
  });

  describe('getJwtToken', () => {});
});
