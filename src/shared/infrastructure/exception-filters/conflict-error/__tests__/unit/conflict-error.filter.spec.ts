import { ArgumentsHost } from '@nestjs/common';
import { ConflictErrorFilter } from '../../conflict-error.filter';
import { ConflictError } from '@/shared/domain/errors/conflict-error';

describe('ConflictErrorFilter unit tests', () => {
  it('should be defined', () => {
    const filter = new ConflictErrorFilter();
    expect(filter).toBeDefined();
  });

  it('should catch ConflictError and send the correct response', () => {
    const filter = new ConflictErrorFilter();
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
    const exception = new ConflictError('Conflict occurred');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.send).toHaveBeenCalledWith({
      statusCode: 409,
      error: 'Conflict',
      message: exception.message,
    });
  });

  it('should handle different exception messages', () => {
    const filter = new ConflictErrorFilter();
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
    const exception = new ConflictError('Another conflict error');

    filter.catch(exception, mockHost);

    expect(mockResponse.send).toHaveBeenCalledWith({
      statusCode: 409,
      error: 'Conflict',
      message: 'Another conflict error',
    });
  });

  it('should always return HTTP status 409', () => {
    const filter = new ConflictErrorFilter();
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
    const exception = new ConflictError('Any conflict error');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
  });
});
