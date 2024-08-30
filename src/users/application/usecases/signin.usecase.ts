import { HashProvider } from '@/shared/application/providers/hash-provider';
import { UserRepository } from '@/users/domain/repositories/user.repository';
import { BadRequestError } from '@/shared/application/errors/bad-request-error';
import { UserOutput, UserOutputMapper } from '../dto/user-output';
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case';
import { InvalidCredentialsError } from '@/shared/application/errors/invalid-credentials-error';
import { UnauthorizedError } from '@/shared/application/errors/invalid-password-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';

export namespace SigninUseCase {
  export type Input = {
    email: string;
    password: string;
  };

  export type Output = UserOutput;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly userRepository: UserRepository.Repository,
      private hashProvider: HashProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      const { email, password } = input;

      if (!email || !password) {
        throw new BadRequestError('Missing required fields');
      }

      let entity: UserEntity;

      try {
        entity = await this.userRepository.findByEmail(email);
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new UnauthorizedError('Invalid credentials');
        }
        throw error;
      }

      const checkPassword = await this.hashProvider.compareHash(
        password,
        entity.password,
      );

      if (!checkPassword) {
        throw new UnauthorizedError('Invalid credentials');
      }

      return UserOutputMapper.toOutput(entity);
    }
  }
}
