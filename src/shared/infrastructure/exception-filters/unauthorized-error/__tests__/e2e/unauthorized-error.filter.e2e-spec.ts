import { UnauthorizedError } from '@/shared/application/errors/invalid-password-error';
import { Controller, INestApplication, Patch } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { UnauthorizedErrorFilter } from '../../unauthorized-error.filter';

@Controller('stub')
class StubController {
  @Patch() index() {
    throw new UnauthorizedError('Old password does not match');
  }
}

describe('UnauUnauthorizedErrorFilter end-to-end tests', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [StubController],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalFilters(new UnauthorizedErrorFilter());
    await app.init();
  });

  it('should be defined', () => {
    expect(new UnauthorizedErrorFilter()).toBeDefined();
  });

  it('should catch InvalidPasswordError', async () => {
    return request(app.getHttpServer()).patch('/stub').expect(401).expect({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Old password does not match',
    });
  });
});
