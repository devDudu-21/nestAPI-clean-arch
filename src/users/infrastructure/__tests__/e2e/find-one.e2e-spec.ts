import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserRepository } from '@/users/domain/repositories/user.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module';
import { UsersModule } from '../../users.module';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import request from 'supertest';
import { UsersController } from '../../users.controller';
import { instanceToPlain } from 'class-transformer';
import { applyGlobalConfig } from '@/global-config';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';

describe('UsersController findOne method end-to-end tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: UserRepository.Repository;
  const prismaService = new PrismaClient();
  let entity: UserEntity;

  beforeAll(async () => {
    setupPrismaTests();
    module = await Test.createTestingModule({
      imports: [
        EnvConfigModule,
        UsersModule,
        DatabaseModule.forTest(prismaService),
      ],
    }).compile();
    app = module.createNestApplication();
    applyGlobalConfig(app);
    await app.init();
    repository = module.get<UserRepository.Repository>('UserRepository');
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany();
    entity = new UserEntity(UserDataBuilder({}));
    await repository.insert(entity);
  });

  describe('GET /users/:id', () => {
    it('should create an user', async () => {
      const res = await request(app.getHttpServer())
        .get(`/users/${entity._id}`)
        .expect(200);
      const presenter = UsersController.userToResponse(entity.toJSON());
      const serialized = instanceToPlain(presenter);
      expect(res.body.data).toStrictEqual(serialized);
    });

    it('should return an error with 404 code when the id is invalid', async () => {
      const res = await request(app.getHttpServer())
        .get(`/users/fakeId`)
        .expect(404);
      expect(res.body.statusCode).toBe(404);
      expect(res.body.error).toBe('NotFound');
      expect(res.body.message).toBe('UserModel not found using ID fakeId');
    });
  });
});
