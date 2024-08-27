import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { NotfoundErrorFilter } from '../../notfound-error.filter';

@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new NotFoundError('UserModel not found');
  }
}

describe('ConflictErrorFilter end-to-end tests', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [StubController],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalFilters(new NotfoundErrorFilter());
    await app.init();
  });

  it('should catch ConflictError', async () => {
    return request(app.getHttpServer()).get('/stub').expect(404).expect({
      statusCode: 404,
      error: 'NotFound',
      message: 'UserModel not found',
    });
  });
});
