import { Reflector } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { WrapperDataInterceptor } from './shared/infrastructure/interceptors/wrapper-data/wrapper-data.interceptor';
import { ConflictErrorFilter } from './shared/infrastructure/exception-filters/conflict-error/conflict-error.filter';

export function applyGlobalConfig(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 422,
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(
    new WrapperDataInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );
  app.useGlobalFilters(new ConflictErrorFilter());
}
