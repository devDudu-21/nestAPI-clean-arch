import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { NotfoundErrorFilter } from '../../notfound-error.filter';
import { ArgumentsHost } from '@nestjs/common';

describe('NotfoundErrorFilter unit tests', () => {
  it('should be defined', () => {
    const filter = new NotfoundErrorFilter();
    expect(filter).toBeDefined();
  });

  it('should catch NotFoundError and send the correct response', () => {
    const filter = new NotfoundErrorFilter();
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
    const exception = new NotFoundError('Conflict occurred');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.send).toHaveBeenCalledWith({
      statusCode: 404,
      error: 'NotFound',
      message: exception.message,
    });
  });

  it('should handle different exception messages', () => {
    const filter = new NotfoundErrorFilter();
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
    const exception = new NotFoundError('Another conflict error');

    filter.catch(exception, mockHost);

    expect(mockResponse.send).toHaveBeenCalledWith({
      statusCode: 404,
      error: 'NotFound',
      message: 'Another conflict error',
    });
  });

  it('should always return HTTP status 404', () => {
    const filter = new NotfoundErrorFilter();
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
    const exception = new NotFoundError('Any conflict error');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
  });
});
