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

describe('UsersController search method end-to-end tests', () => {
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
  });

  describe('GET /users/', () => {
    it('should return the users ordered by createdAt', async () => {
      const createdAt = new Date();
      const entities: UserEntity[] = [];
      const arrange = Array(3).fill(UserDataBuilder({}));
      arrange.forEach((element, index) =>
        entities.push(
          new UserEntity({
            ...element,
            email: `test${index}@a.com`,
            createdAt: new Date(createdAt.getTime() + index),
          }),
        ),
      );
      await prismaService.user.createMany({
        data: entities.map(entity => entity.toJSON()),
      });
      const searchParams = {};
      const queryParams = new URLSearchParams(searchParams as any).toString();
      const res = await request(app.getHttpServer())
        .get(`/users/?${queryParams}`)
        .expect(200);

      expect(Object.keys(res.body)).toStrictEqual(['data', 'meta']);
      expect(res.body).toStrictEqual({
        data: [...entities]
          .reverse()
          .map(entity =>
            instanceToPlain(UsersController.userToResponse(entity)),
          ),
        meta: {
          total: 3,
          currentPage: 1,
          perPage: 15,
          lastPage: 1,
        },
      });
    });

    it('should return the users ordered by createdAt', async () => {
      const entities: UserEntity[] = [];
      const arrange = ['test', 'a', 'TEST', 'TeSt', 'b'];
      arrange.forEach((element, index) =>
        entities.push(
          new UserEntity({
            ...UserDataBuilder({}),
            name: element,
            email: `a${index}@gmail.com`,
          }),
        ),
      );
      await prismaService.user.createMany({
        data: entities.map(entity => entity.toJSON()),
      });
      let searchParams = {
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
        filter: 'TEST',
      };
      let queryParams = new URLSearchParams(searchParams as any).toString();

      let res = await request(app.getHttpServer())
        .get(`/users/?${queryParams}`)
        .expect(200);

      expect(Object.keys(res.body)).toStrictEqual(['data', 'meta']);
      expect(res.body).toStrictEqual({
        data: [entities[0], entities[3]].map(entity =>
          instanceToPlain(UsersController.userToResponse(entity)),
        ),
        meta: {
          total: 3,
          currentPage: 1,
          perPage: 2,
          lastPage: 2,
        },
      });

      searchParams = {
        page: 2,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
        filter: 'TEST',
      };

      queryParams = new URLSearchParams(searchParams as any).toString();

      res = await request(app.getHttpServer())
        .get(`/users/?${queryParams}`)
        .expect(200);

      expect(Object.keys(res.body)).toStrictEqual(['data', 'meta']);
      expect(res.body).toStrictEqual({
        data: [entities[2]].map(entity =>
          instanceToPlain(UsersController.userToResponse(entity)),
        ),
        meta: {
          total: 3,
          currentPage: 2,
          perPage: 2,
          lastPage: 2,
        },
      });
    });

    it('should return a error with 422 code when the query params is invalid', async () => {
      const res = await request(app.getHttpServer())
        .get(`/users/?fakeId=10`)
        .expect(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual(['property fakeId should not exist']);
    });
  });
});
