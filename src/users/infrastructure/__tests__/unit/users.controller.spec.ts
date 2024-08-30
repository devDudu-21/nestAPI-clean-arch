import { UpdatePasswordDto } from './../../dto/update-password.dto';
import { SignupUseCase } from '@/users/application/usecases/signup.usecase';
import { UsersController } from '../../users.controller';
import { UserOutput } from '@/users/application/dto/user-output';
import { SigninDto } from '../../dto/signin.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { SignupDto } from '../../dto/signup.dto';
import { UpdateUserUseCase } from '@/users/application/usecases/updateuser.usecase';
import { UpdatePasswordUseCase } from '@/users/application/usecases/updatepassword.usecase';
import { GetUserUseCase } from '@/users/application/usecases/getuser.usecase';
import { ListUsersUseCase } from '@/users/application/usecases/listusers.usecase';
import { UserPresenter } from '../../presenters/user.presenter';
import { UserCollectionPresenter } from '../../presenters/user-collection.presenter';

describe('UsersController unit tests', () => {
  let sut: UsersController;
  let id: string;
  let props: UserOutput;

  beforeEach(async () => {
    sut = new UsersController();
    id = 'eac761dc-5cb1-4558-beac-732fd03c8853';
    props = {
      id: id,
      name: 'Jhon Doe',
      email: 'a@a.com',
      password: '123456',
      createdAt: new Date(),
    };
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should create a user', async () => {
    const output: SignupUseCase.Output = props;
    const mockSignupUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    sut['signupUseCase'] = mockSignupUseCase as any;
    const input: SignupDto = {
      name: props.name,
      email: props.email,
      password: props.password,
    };
    const presenter = await sut.create(input);

    expect(presenter).toBeInstanceOf(UserPresenter);
    expect(presenter).toStrictEqual(new UserPresenter(output));
    expect(mockSignupUseCase.execute).toHaveBeenCalledWith(input);
  });

  it('should be able to authenticate a user', async () => {
    const output = 'fake_token';
    const mockSigninUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    const mockAuthService = {
      generateJwt: jest.fn().mockReturnValue(Promise.resolve(output)),
    };

    sut['signinUseCase'] = mockSigninUseCase as any;
    sut['authService'] = mockAuthService as any;

    const input: SigninDto = {
      email: props.email,
      password: props.password,
    };

    const result = await sut.login(input);

    expect(result).toStrictEqual(output);
    expect(mockSigninUseCase.execute).toHaveBeenCalledWith(input);
  });

  it('should be able to update a user', async () => {
    const output: UpdateUserUseCase.Output = props;
    const mockUpdateUserUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    sut['updateUserUseCase'] = mockUpdateUserUseCase as any;
    const input: UpdateUserDto = {
      name: 'other name',
    };
    const presenter = await sut.update(id, input);

    expect(presenter).toBeInstanceOf(UserPresenter);
    expect(presenter).toStrictEqual(new UserPresenter(output));
    expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith({
      id,
      ...input,
    });
  });

  it('should be able to update a password', async () => {
    const output: UpdatePasswordUseCase.Output = props;
    const mockUpdatePasswordUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    sut['updatePasswordUseCase'] = mockUpdatePasswordUseCase as any;
    const input: UpdatePasswordDto = {
      password: props.password,
      oldPassword: '1234567',
    };
    const presenter = await sut.updatePassword(id, input);

    expect(presenter).toBeInstanceOf(UserPresenter);
    expect(presenter).toStrictEqual(new UserPresenter(output));
    expect(mockUpdatePasswordUseCase.execute).toHaveBeenCalledWith({
      id,
      ...input,
    });
  });

  it('should be able to delete a user', async () => {
    const output: void = undefined;
    const mockDeleteUserUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    sut['deleteUserUseCase'] = mockDeleteUserUseCase as any;

    const result: void = await sut.remove(id);
    expect(output).toStrictEqual(result);
    expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith({
      id,
    });
  });

  it('should gets a user', async () => {
    const output: GetUserUseCase.Output = props;
    const mockGetUserUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    sut['getUserUseCase'] = mockGetUserUseCase as any;
    const presenter = await sut.findOne(id);

    expect(presenter).toBeInstanceOf(UserPresenter);
    expect(presenter).toStrictEqual(new UserPresenter(output));
    expect(mockGetUserUseCase.execute).toHaveBeenCalledWith({ id });
  });

  it('should list all users', async () => {
    const output: ListUsersUseCase.Output = {
      items: [props],
      total: 1,
      currentPage: 1,
      lastPage: 1,
      perPage: 1,
    };
    const mockListUsersUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    const searchParams = {
      page: 1,
      perPage: 1,
    };
    sut['listUsersUseCase'] = mockListUsersUseCase as any;
    const presenter = await sut.search(searchParams);
    expect(presenter).toBeInstanceOf(UserCollectionPresenter);
    expect(presenter).toStrictEqual(new UserCollectionPresenter(output));
    expect(mockListUsersUseCase.execute).toHaveBeenCalledWith(searchParams);
  });
});
