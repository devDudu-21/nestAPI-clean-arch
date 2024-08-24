import { UserOutput } from '@/users/application/dto/user-output';
import { UserPresenter } from '../../user.presenter';
import { instanceToPlain } from 'class-transformer';

describe('UserPresenter unit tests', () => {
  const createdAt = new Date();
  const props: UserOutput = {
    id: 'a86e1d1c-276d-41c7-8ef9-fc1f4d10bf48',
    name: 'Test name',
    email: 'a@a.com',
    password: 'fake',
    createdAt,
  };

  let sut: UserPresenter;

  beforeEach(() => {
    sut = new UserPresenter(props);
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(sut.id).toEqual(props.id);
      expect(sut.name).toEqual(props.name);
      expect(sut.email).toEqual(props.email);
      expect(sut.createdAt).toEqual(props.createdAt);
    });
  });
  it('should presenter data', () => {
    const output = instanceToPlain(sut);
    expect(output).toStrictEqual({
      id: 'a86e1d1c-276d-41c7-8ef9-fc1f4d10bf48',
      name: 'Test name',
      email: 'a@a.com',
      createdAt: createdAt.toISOString(),
    });
  });
});
