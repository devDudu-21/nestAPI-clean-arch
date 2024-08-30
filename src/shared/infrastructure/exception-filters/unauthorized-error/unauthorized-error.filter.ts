import { FastifyReply } from 'fastify';
import { UnauthorizedError } from '@/shared/application/errors/invalid-password-error';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch(UnauthorizedError)
export class UnauthorizedErrorFilter implements ExceptionFilter {
  catch(exception: UnauthorizedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    response.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: exception.message,
    });
  }
}
