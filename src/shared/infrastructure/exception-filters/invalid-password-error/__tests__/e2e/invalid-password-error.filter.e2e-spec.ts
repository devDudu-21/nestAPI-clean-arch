import { InvalidPasswordError } from '@/shared/application/errors/invalid-password-error';
import { Controller, INestApplication, Patch } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InvalidPasswordErrorFilter } from '../../invalid-password-error.filter';
import request from 'supertest';

@Controller('stub')
class StubController {
  @Patch() index() {
    throw new InvalidPasswordError('Password does not match');
  }
}

describe('InvalidPasswordErrorFilter end-to-end tests', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [StubController],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalFilters(new InvalidPasswordErrorFilter());
    await app.init();
  });

  it('should catch InvalidPasswordError', async () => {
    return request(app.getHttpServer()).patch('/stub').expect(422).expect({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: 'Password does not match',
    });
  });
});
