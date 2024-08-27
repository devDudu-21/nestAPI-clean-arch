import { Controller, Get, INestApplication } from '@nestjs/common';
import { ConflictErrorFilter } from '../../conflict-error.filter';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictError } from '@/shared/domain/errors/conflict-error';
import request from 'supertest';

@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new ConflictError('Conflicting data');
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
    app.useGlobalFilters(new ConflictErrorFilter());
    await app.init();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should catch ConflictError', async () => {
    return request(app.getHttpServer()).get('/stub').expect(409).expect({
      statusCode: 409,
      error: 'Conflict',
      message: 'Conflicting data',
    });
  });
});
