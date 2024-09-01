import { ArgumentsHost } from '@nestjs/common';
import { UnauthorizedErrorFilter } from '../../unauthorized-error.filter';
import { UnauthorizedError } from '@/shared/application/errors/unauthorized-error';

describe('UnauthorizedErrorFilter unit tests', () => {
  it('should be defined', () => {
    const filter = new UnauthorizedErrorFilter();
    expect(filter).toBeDefined();
  });

  it('should catch InvalidPasswordError and send the correct response', () => {
    const filter = new UnauthorizedErrorFilter();
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
    const exception = new UnauthorizedError('Unauthorized');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.send).toHaveBeenCalledWith({
      statusCode: 401,
      error: 'Unauthorized',
      message: exception.message,
    });
  });

  it('should handle different exception messages', () => {
    const filter = new UnauthorizedErrorFilter();
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
    const exception = new UnauthorizedError('Password does not match');

    filter.catch(exception, mockHost);

    expect(mockResponse.send).toHaveBeenCalledWith({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Password does not match',
    });
  });

  it('should always return HTTP status 401', () => {
    const filter = new UnauthorizedErrorFilter();
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
    const exception = new UnauthorizedError('Unauthorized');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
  });
});
