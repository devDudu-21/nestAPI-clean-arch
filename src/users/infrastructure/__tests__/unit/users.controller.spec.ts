import { SignupUseCase } from '@/users/application/usecases/signup.usecase';
import { UsersController } from '../../users.controller';
import { UserOutput } from '@/users/application/dto/user-output';

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
    const input: SignupUseCase.Input = {
      name: props.name,
      email: props.email,
      password: props.password,
    };
    const result = await sut.create(input);
    expect(output).toMatchObject(result);
    expect(mockSignupUseCase.execute).toHaveBeenCalledWith(input);
  });
});
