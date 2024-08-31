import { UserRepository } from '@/users/domain/repositories/user.repository';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module';
import { UsersModule } from '../../users.module';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { UpdatePasswordDto } from '../../dto/update-password.dto';
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { applyGlobalConfig } from '@/global-config';
import { BcryptjsHashProvider } from '../../providers/hash-provider/bcryptjs-hash.provider';
import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

describe('UsersController updatePassword method end-to-end tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: UserRepository.Repository;
  let updatePasswordDto: UpdatePasswordDto;
  const prismaService = new PrismaClient();
  let hashProvider: HashProvider;
  let entity: UserEntity;
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
  });

  beforeEach(async () => {
    updatePasswordDto = {
      password: 'NewPassword123',
      oldPassword: 'OldPassword123',
    };
    await prismaService.user.deleteMany();
    const hashPassword = await hashProvider.generateHash('OldPassword123');
    entity = new UserEntity(
      UserDataBuilder({ email: 'a@a.com', password: hashPassword }),
    );
    await repository.insert(entity);
    const loginResponse = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: 'a@a.com', password: 'OldPassword123' })
      .expect(200);
    accessToken = loginResponse.body.accessToken;
  });

  describe('PATCH /users/:id', () => {
    it('should update a user password', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .send(updatePasswordDto)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(Object.keys(res.body)).toStrictEqual(['data']);
      const user = await repository.findById(res.body.data.id);
      const checkNewPassword = await hashProvider.compareHash(
        updatePasswordDto.password,
        user.password,
      );

      expect(checkNewPassword).toBeTruthy();
    });

    it('should throw a unauthorized error when the token is not provided', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .send(updatePasswordDto);

      expect(Object.keys(res.body)).toStrictEqual([
        'statusCode',
        'error',
        'message',
      ]);
      expect(res.body).toStrictEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Token not found',
      });
    });

    it('should throw a unauthorized error when the token is invalid', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .send(updatePasswordDto)
        .set('Authorization', `Bearer ${accessToken + 'fake'}`);
      expect(Object.keys(res.body)).toStrictEqual([
        'statusCode',
        'error',
        'message',
      ]);
      expect(res.body).toStrictEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    });

    it('should return an error with 404 when the id is invalid', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/fakeId`)
        .send(updatePasswordDto)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
      expect(res.body).toStrictEqual({
        statusCode: 404,
        error: 'NotFound',
        message: 'UserModel not found using ID fakeId',
      });
    });

    it('should return an error with 422 code when the request body is invalid', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .send({})
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.body).toStrictEqual({
        statusCode: 422,
        error: 'Unprocessable Entity',
        message: [
          'password should not be empty',
          'password must be a string',
          'oldPassword should not be empty',
          'oldPassword must be a string',
        ],
      });
    });

    it('should return an error with 422 code when the oldPassword field is invalid', async () => {
      delete updatePasswordDto.password;
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .send(updatePasswordDto)
        .expect(422)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.body).toStrictEqual({
        statusCode: 422,
        error: 'Unprocessable Entity',
        message: ['password should not be empty', 'password must be a string'],
      });
    });

    it('should return an error with 422 code when the email field is invalid', async () => {
      delete updatePasswordDto.oldPassword;
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .send(updatePasswordDto)
        .expect(422)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.body).toStrictEqual({
        statusCode: 422,
        error: 'Unprocessable Entity',
        message: [
          'oldPassword should not be empty',
          'oldPassword must be a string',
        ],
      });
    });

    it('should return an error with 422 code with invalid field provider', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .send(Object.assign(updatePasswordDto, { xpto: 'xpto' }))
        .expect(422)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.body).toStrictEqual({
        statusCode: 422,
        error: 'Unprocessable Entity',
        message: ['property xpto should not exist'],
      });
    });

    it('should return an error with 422 code when password does not match', async () => {
      updatePasswordDto.oldPassword = 'fake';
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .send(updatePasswordDto)
        .expect(401)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.body).toStrictEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Old password does not match',
      });
    });
  });
});
