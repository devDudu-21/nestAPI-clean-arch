import { FastifyReply } from 'fastify';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch(NotFoundError)
export class NotfoundErrorFilter implements ExceptionFilter {
  catch(exception: NotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    response
      .status(404)
      .send({ statusCode: 404, error: 'NotFound', message: exception.message });
  }
}
