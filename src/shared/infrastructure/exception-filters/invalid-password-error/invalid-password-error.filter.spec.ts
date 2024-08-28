import { ArgumentsHost } from '@nestjs/common';
import { InvalidPasswordErrorFilter } from './invalid-password-error.filter';
import { InvalidPasswordError } from '@/shared/application/errors/invalid-password-error';

describe('InvalidPasswordErrorFilter unit tests', () => {
  it('should be defined', () => {
    const filter = new InvalidPasswordErrorFilter();
    expect(filter).toBeDefined();
  });

  it('should catch InvalidPasswordError and send the correct response', () => {
    const filter = new InvalidPasswordErrorFilter();
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
    const exception = new InvalidPasswordError('Conflict occurred');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(422);
    expect(mockResponse.send).toHaveBeenCalledWith({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: exception.message,
    });
  });

  it('should handle different exception messages', () => {
    const filter = new InvalidPasswordErrorFilter();
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
    const exception = new InvalidPasswordError('Password does not match');

    filter.catch(exception, mockHost);

    expect(mockResponse.send).toHaveBeenCalledWith({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: 'Password does not match',
    });
  });

  it('should always return HTTP status 422', () => {
    const filter = new InvalidPasswordErrorFilter();
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
    const exception = new InvalidPasswordError('Any conflict error');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(422);
  });
});
