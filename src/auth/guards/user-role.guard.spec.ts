import { Reflector } from '@nestjs/core';
import { UserRoleGuard } from './user-role.guard';
import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

describe('UserRoleGuard', () => {
  let guard: UserRoleGuard;
  let reflector: Reflector;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new UserRoleGuard(reflector);

    mockExecutionContext = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: {
            id: 'a2ca3231-a184-4789-81fc-8ce327c77c1a',
            email: 'test@test.com',
            fullname: 'Test User',
            roles: ['admin'],
          },
        }),
      }),
    } as unknown as ExecutionContext;
  });

  it('should return true if user has a valid role', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

    expect(guard.canActivate(mockExecutionContext)).toBe(true);
  });

  it('should return true if no roles are defined', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);

    expect(guard.canActivate(mockExecutionContext)).toBe(true);
  });

  it('should return true if the roles array is empty', () => {
    jest.spyOn(reflector, 'get').mockReturnValue([]);

    expect(guard.canActivate(mockExecutionContext)).toBe(true);
  });

  it('should throw BadRequestException if user is not found in request', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    jest
      .spyOn(mockExecutionContext.switchToHttp(), 'getRequest')
      .mockReturnValue({});

    expect(() => guard.canActivate(mockExecutionContext)).toThrow(
      BadRequestException,
    );
    expect(() => guard.canActivate(mockExecutionContext)).toThrow(
      'User not found',
    );
  });

  it('should throw ForbiddenException if user does not have required roles', () => {
    const validRoles = ['admin'];
    jest.spyOn(reflector, 'get').mockReturnValue(validRoles);
    jest
      .spyOn(mockExecutionContext.switchToHttp(), 'getRequest')
      .mockReturnValue({
        user: {
          id: 'a2ca3231-a184-4789-81fc-8ce327c77c1a',
          email: 'test@test.com',
          fullname: 'Test User',
          roles: ['role-not-allowed'],
        },
      });

    expect(() => guard.canActivate(mockExecutionContext)).toThrow(
      ForbiddenException,
    );
    expect(() => guard.canActivate(mockExecutionContext)).toThrow(
      `User does not have required roles: [${validRoles}]`,
    );
  });
});
