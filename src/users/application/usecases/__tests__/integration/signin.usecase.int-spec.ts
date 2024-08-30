import { HashProvider } from '@/shared/application/providers/hash-provider';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository';
import { TestingModule, Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { BcryptjsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { SigninUseCase } from '../../signin.usecase';
import { InvalidCredentialsError } from '@/shared/application/errors/invalid-credentials-error';
import { BadRequestError } from '@/shared/application/errors/bad-request-error';
import { UnauthorizedError } from '@/shared/application/errors/invalid-password-error';

describe('SigninUseCase integration tests', () => {
  const prismaService = new PrismaClient();
  let sut: SigninUseCase.UseCase;
  let repository: UserPrismaRepository;
  let module: TestingModule;
  let hashProvider: HashProvider;

  beforeAll(async () => {
    setupPrismaTests();
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile();
    repository = new UserPrismaRepository(prismaService as any);
    hashProvider = new BcryptjsHashProvider();
  });

  beforeEach(async () => {
    sut = new SigninUseCase.UseCase(repository, hashProvider);
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should not be able to authenticate with invalid email', async () => {
    const entity = new UserEntity(UserDataBuilder({}));
    await expect(() =>
      sut.execute({
        email: entity.email,
        password: 'fake password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('should not be able to authenticate with invalid password', async () => {
    const hashPassword = await hashProvider.generateHash('fake password');
    const entity = new UserEntity(
      UserDataBuilder({
        email: 'a@a.com',
        password: hashPassword,
      }),
    );
    await prismaService.user.create({
      data: entity.toJSON(),
    });

    await expect(() =>
      sut.execute({
        email: 'a@a.com',
        password: 'wrong password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('should throws error when email not provided', async () => {
    await expect(() =>
      sut.execute({
        email: null,
        password: 'fake password',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('should throws error when password not provided', async () => {
    await expect(() =>
      sut.execute({
        email: 'a@a.com',
        password: null,
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('should authenticate a user', async () => {
    const hashPassword = await hashProvider.generateHash('fake password');
    const entity = new UserEntity(
      UserDataBuilder({
        email: 'a@a.com',
        password: hashPassword,
      }),
    );

    await prismaService.user.create({
      data: entity.toJSON(),
    });

    const output = await sut.execute({
      email: 'a@a.com',
      password: 'fake password',
    });

    expect(output).toMatchObject(entity.toJSON());
  });
});
