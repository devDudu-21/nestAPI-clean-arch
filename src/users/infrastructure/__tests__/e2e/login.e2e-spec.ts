import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserRepository } from '@/users/domain/repositories/user.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module';
import { UsersModule } from '../../users.module';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import request from 'supertest';
import { applyGlobalConfig } from '@/global-config';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { SigninDto } from '../../dto/signin.dto';
import { BcryptjsHashProvider } from '../../providers/hash-provider/bcryptjs-hash.provider';

describe('UsersController Login method end-to-end tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: UserRepository.Repository;
  let signinDto: SigninDto;
  let hashProvider: HashProvider;
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
    hashProvider = new BcryptjsHashProvider();
  });

  beforeEach(async () => {
    signinDto = {
      email: 'a@a.com',
      password: 'TestPassword123',
    };
    await prismaService.user.deleteMany();
  });

  describe('POST /users/login', () => {
    it('should authenticate a user', async () => {
      const passwordHash = await hashProvider.generateHash(signinDto.password);
      const entity = new UserEntity({
        ...UserDataBuilder({}),
        email: signinDto.email,
        password: passwordHash,
      });
      await repository.insert(entity);

      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send(signinDto)
        .expect(200);
      expect(Object.keys(res.body)).toStrictEqual(['accessToken']);
      expect(typeof res.body.accessToken).toStrictEqual('string');
    });

    it('should return an error with 422 code when the request body is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send({})
        .expect(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'email must be an email',
        'email should not be empty',
        'email must be a string',
        'password should not be empty',
        'password must be a string',
      ]);
    });

    it('should return an error with 422 code when the email field is invalid', async () => {
      delete signinDto.email;
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send(signinDto)
        .expect(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'email must be an email',
        'email should not be empty',
        'email must be a string',
      ]);
    });

    it('should return an error with 422 code when the password field is invalid', async () => {
      delete signinDto.password;
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send(signinDto)
        .expect(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'password should not be empty',
        'password must be a string',
      ]);
    });

    it('should return an error with 422 code with invalid field provider', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send(Object.assign(signinDto, { xpto: 'xpto' }))
        .expect(422);
      expect(res.body.message).toEqual(['property xpto should not exist']);
      expect(res.body.error).toBe('Unprocessable Entity');
    });

    it('should return an error with 401 code when the email not found', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send(signinDto)
        .expect(401);
      expect(res.body.error).toBe('Unauthorized');
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should return an error with 401 code when the password is incorrect', async () => {
      const passwordHash = await hashProvider.generateHash(signinDto.password);
      const entity = new UserEntity({
        ...UserDataBuilder({}),
        email: signinDto.email,
        password: passwordHash,
      });
      await repository.insert(entity);

      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send({ ...signinDto, password: 'wrongPassword' })
        .expect(401);
      expect(entity.password).not.toEqual('wrongPassword');
      expect(res.body.error).toBe('Unauthorized');
      expect(res.body.message).toBe('Invalid credentials');
    });
  });
});
