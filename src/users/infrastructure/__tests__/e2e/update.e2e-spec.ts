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
import { UpdateUserDto } from '../../dto/update-user.dto';
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptjsHashProvider } from '../../providers/hash-provider/bcryptjs-hash.provider';

describe('UsersController Update method end-to-end tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: UserRepository.Repository;
  let updateUserDto: UpdateUserDto;
  const prismaService = new PrismaClient();
  let entity: UserEntity;
  let hashProvider: HashProvider;
  let hashPassword: string;
  let accessToken: string;

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
    hashProvider = new BcryptjsHashProvider();
    hashPassword = await hashProvider.generateHash('fake_password');
  });

  beforeEach(async () => {
    updateUserDto = {
      name: 'test name',
    };
    await prismaService.user.deleteMany();
    entity = new UserEntity(
      UserDataBuilder({ email: 'a@a.com', password: hashPassword }),
    );
    await repository.insert(entity);
    const loginResponse = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: 'a@a.com', password: 'fake_password' })
      .expect(200);
    accessToken = loginResponse.body.accessToken;
  });

  describe('PUT /users/:id', () => {
    it('should update a user', async () => {
      updateUserDto.name = 'new name';
      const res = await request(app.getHttpServer())
        .put(`/users/${entity._id}`)
        .send(updateUserDto)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      const user = await repository.findById(entity._id);
      const presenter = UsersController.userToResponse(user.toJSON());
      const serialized = instanceToPlain(presenter);
      expect(res.body.data).toStrictEqual(serialized);
    });

    it('should throw unauthorized error with code 401 when the token is not provided', async () => {
      updateUserDto.name = 'new name';
      const res = await request(app.getHttpServer())
        .put(`/users/${entity._id}`)
        .send(updateUserDto);

      expect(res.body).toStrictEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Token not found',
      });
    });

    it('should throw unauthorized error with code 401 when the token is invalid', async () => {
      updateUserDto.name = 'new name';
      const res = await request(app.getHttpServer())
        .put(`/users/${entity._id}`)
        .send(updateUserDto)
        .set('Authorization', `Bearer ${accessToken + 'fake'}`);

      expect(res.body).toStrictEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    });

    it('should return an error with 422 code when the request body is invalid', async () => {
      const res = await request(app.getHttpServer())
        .put(`/users/${entity._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(422);

      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'name should not be empty',
        'name must be a string',
      ]);
    });

    it('should return an error with 422 code when the name field is invalid', async () => {
      delete updateUserDto.name;
      const res = await request(app.getHttpServer())
        .put(`/users/${entity._id}`)
        .send(updateUserDto)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'name should not be empty',
        'name must be a string',
      ]);
    });

    it('should return an error with 422 code with invalid field provider', async () => {
      const res = await request(app.getHttpServer())
        .put(`/users/${entity._id}`)
        .send(Object.assign(updateUserDto, { xpto: 'xpto' }))
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(422);
      expect(res.body.message).toEqual(['property xpto should not exist']);
      expect(res.body.error).toBe('Unprocessable Entity');
    });

    it('should return an error with 404 code when the id is invalid', async () => {
      const res = await request(app.getHttpServer())
        .put(`/users/fakeId`)
        .send(updateUserDto)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
      expect(res.body.statusCode).toBe(404);
      expect(res.body.error).toBe('NotFound');
      expect(res.body.message).toBe('UserModel not found using ID fakeId');
    });
  });
});
