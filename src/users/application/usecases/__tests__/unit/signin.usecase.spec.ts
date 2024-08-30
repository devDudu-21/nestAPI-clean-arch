import { UserInMemoryRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository';
import { SigninUseCase } from '../../signin.usecase';
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptjsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { BadRequestError } from '@/shared/application/errors/bad-request-error';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { InvalidCredentialsError } from '@/shared/application/errors/invalid-credentials-error';
import { UnauthorizedError } from '@/shared/application/errors/invalid-password-error';

describe('SigninUseCase unit tests', () => {
  let sut: SigninUseCase.UseCase;
  let repository: UserInMemoryRepository;
  let hashProvider: HashProvider;

  beforeEach(() => {
    repository = new UserInMemoryRepository();
    hashProvider = new BcryptjsHashProvider();
    sut = new SigninUseCase.UseCase(repository, hashProvider);
  });

  it('should create a user', async () => {
    const spyFindByEmail = jest.spyOn(repository, 'findByEmail');
    const hashPassword = await hashProvider.generateHash('123456');
    const entity = new UserEntity(
      UserDataBuilder({ email: 'a@a.com', password: hashPassword }),
    );
    repository.items = [entity];
    const result = await sut.execute({
      email: entity.email,
      password: '123456',
    });

    expect(result).toStrictEqual(entity.toJSON());
    expect(spyFindByEmail).toHaveBeenCalledTimes(1);
  });

  it('should throws error when email not provided', async () => {
    const props = { email: null, password: '123456' };
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('should throws error when password not provided', async () => {
    const props = { email: 'a@a.com', password: null };
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('should not be able to authenticate with wrong email', async () => {
    const props = { email: 'a@a.com', password: '123456' };
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it('should not be able to authenticate with wrong password', async () => {
    const hashPassword = await hashProvider.generateHash('123456');
    const entity = new UserEntity(
      UserDataBuilder({ email: 'a@a.com', password: hashPassword }),
    );
    repository.items = [entity];

    const props = { email: 'a@a.com', password: 'fake' };
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
  });
});
