import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getRawHeaders } from './raw-headers.decorator';

jest.mock('@nestjs/common', () => ({
  // createParamDecorator: jest.fn().mockImplementation(() => jest.fn()),
  createParamDecorator: jest.fn(),
}));

describe('RawHeadersDecorator', () => {
  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        rawHeaders: ['Authorization', 'Bearer token', 'User-Agent'],
      }),
    }),
  } as unknown as ExecutionContext;

  it('should return the raw headers from the request', () => {
    const result = getRawHeaders('', mockExecutionContext);

    expect(result).toEqual(['Authorization', 'Bearer token', 'User-Agent']);
  });

  it('should call createParamDecorator with getRawHeaders', () => {
    expect(createParamDecorator).toHaveBeenCalledWith(getRawHeaders);
  });
});
