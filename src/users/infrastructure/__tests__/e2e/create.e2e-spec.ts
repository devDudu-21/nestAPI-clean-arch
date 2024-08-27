import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserRepository } from '@/users/domain/repositories/user.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { SignupDto } from '../../dto/signup.dto';
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

describe('UsersController Create method end-to-end tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: UserRepository.Repository;
  let signupDto: SignupDto;
  const prismaService = new PrismaClient();

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
    signupDto = {
      name: 'test name',
      email: 'a@a.com',
      password: 'TestPassword123',
    };
    await prismaService.user.deleteMany();
  });

  describe('POST /users', () => {
    it('should create an user', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(signupDto)
        .expect(201);
      expect(Object.keys(res.body)).toStrictEqual(['data']);

      const user = await repository.findById(res.body.data.id);
      const presenter = UsersController.userToResponse(user.toJSON());
      const serialized = instanceToPlain(presenter);
      expect(res.body.data).toStrictEqual(serialized);
    });

    it('should return an error with 442 code when the request body is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({})
        .expect(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'name should not be empty',
        'name must be a string',
        'email must be an email',
        'email should not be empty',
        'email must be a string',
        'password should not be empty',
        'password must be a string',
      ]);
    });

    it('should return an error with 442 code when the name field is invalid', async () => {
      delete signupDto.name;
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(signupDto)
        .expect(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'name should not be empty',
        'name must be a string',
      ]);
    });

    it('should return an error with 442 code when the email field is invalid', async () => {
      delete signupDto.email;
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(signupDto)
        .expect(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'email must be an email',
        'email should not be empty',
        'email must be a string',
      ]);
    });

    it('should return an error with 442 code when the password field is invalid', async () => {
      delete signupDto.password;
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(signupDto)
        .expect(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'password should not be empty',
        'password must be a string',
      ]);
    });

    it('should return an error with 442 code with invalid field provider', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(Object.assign(signupDto, { xpto: 'xpto' }))
        .expect(422);
      expect(res.body.message).toEqual(['property xpto should not exist']);
      expect(res.body.error).toBe('Unprocessable Entity');
    });

    it('should return an error with 409 code when the email is duplicated', async () => {
      const entity = new UserEntity(UserDataBuilder({ ...signupDto }));
      await repository.insert(entity);

      const res = await request(app.getHttpServer())
        .post('/users')
        .send(signupDto)
        .expect(409);
      expect(res.body.error).toBe('Conflict');
      expect(res.body.message).toBe('Email adress already used');
    });
  });
});
