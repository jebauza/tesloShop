import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const mockUserRepository = {
      findOneBy: jest.fn(),
    };

    const mockConfigService = {
      getOrThrow: jest.fn().mockReturnValue('secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('should return user if user is found and active', async () => {
    const payload: JwtPayload = { id: '123' };
    const mockUser = {
      id: '123',
      isActive: true,
    } as User;

    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);

    const result = await jwtStrategy.validate(payload);

    expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: payload.id });
    expect(result).toEqual(mockUser);
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    const payload: JwtPayload = { id: '123' };

    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

    await expect(jwtStrategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(jwtStrategy.validate(payload)).rejects.toThrow(
      'Token not valid',
    );
  });

  it('should throw UnauthorizedException if user is inactive', async () => {
    const payload: JwtPayload = { id: '123' };
    const mockUser = {
      id: '123',
      isActive: false,
    } as User;

    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);

    await expect(jwtStrategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(jwtStrategy.validate(payload)).rejects.toThrow(
      'User is inactive, talk to an admin',
    );
  });
});
