import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { getUser } from './get-user.decorator';

jest.mock('@nestjs/common', () => ({
  createParamDecorator: jest.fn(),
  InternalServerErrorException:
    jest.requireActual('@nestjs/common').InternalServerErrorException,
}));

describe('GetUserDecorator', () => {
  const user = {
    id: 'a2ca3231-a184-4789-81fc-8ce327c77c1a',
    email: 'test@test.com',
    fullname: 'Test User',
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        user: user,
      }),
    }),
  } as unknown as ExecutionContext;

  it('should return the user from the request', () => {
    const result = getUser('', mockExecutionContext);

    expect(result).toEqual(user);
  });

  it('should return a specific user property', () => {
    const result = getUser('email', mockExecutionContext);

    expect(result).toEqual(user.email);
  });

  it('should throw an InternalServerErrorException if user is not found in request', () => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
      }),
    } as unknown as ExecutionContext;

    try {
      getUser('', mockExecutionContext);
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error.message).toBe('User not found (request)');
    }
  });

  it('should throw an InternalServerErrorException if user is empty in request', () => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: null,
        }),
      }),
    } as unknown as ExecutionContext;

    try {
      getUser('', mockExecutionContext);
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error.message).toBe('User not found (request)');
    }
  });

  it('should call createParamDecorator with getRawHeaders', () => {
    expect(createParamDecorator).toHaveBeenCalledWith(getUser);
  });
});
