import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import {
  UserRules,
  UserValidator,
  UserValidatorFactory,
} from '../../user.validator';
import { UserProps } from '@/users/domain/entities/user.entity';

let sut: UserValidator;
let props: UserProps;

describe('UserValidator unit tests', () => {
  beforeEach(() => {
    sut = UserValidatorFactory.create();
    props = UserDataBuilder({});
  });

  it('valid case for user validator class', () => {
    const props = UserDataBuilder({});
    const isValid = sut.validate(props);
    expect(isValid).toBeTruthy();
    expect(sut.validatedData).toStrictEqual(new UserRules(props));
  });

  it('Invalidation case for name field', () => {
    let isValid = sut.validate(null as any);
    expect(isValid).toBeFalsy();
    expect(sut.errors['name']).toStrictEqual([
      'name should not be empty',
      'name must be a string',
      'name must be shorter than or equal to 255 characters',
    ]);

    isValid = sut.validate({ ...UserDataBuilder({}), name: '' as any });
    expect(isValid).toBeFalsy();
    expect(sut.errors['name']).toStrictEqual(['name should not be empty']);

    isValid = sut.validate({ ...UserDataBuilder({}), name: 10 as any });
    expect(isValid).toBeFalsy();
    expect(sut.errors['name']).toStrictEqual([
      'name must be a string',
      'name must be shorter than or equal to 255 characters',
    ]);

    isValid = sut.validate({
      ...UserDataBuilder({}),
      name: 'a'.repeat(256),
    });
    expect(isValid).toBeFalsy();
    expect(sut.errors['name']).toStrictEqual([
      'name must be shorter than or equal to 255 characters',
    ]);
  });

  it('Invalidation case for email field', () => {
    let isValid = sut.validate(null as any);
    expect(isValid).toBeFalsy();
    expect(sut.errors['email']).toStrictEqual([
      'email should not be empty',
      'email must be an email',
      'email must be a string',
      'email must be shorter than or equal to 255 characters',
    ]);

    isValid = sut.validate({ ...UserDataBuilder({}), email: '' as any });
    expect(isValid).toBeFalsy();
    expect(sut.errors['email']).toStrictEqual([
      'email should not be empty',
      'email must be an email',
    ]);

    isValid = sut.validate({ ...UserDataBuilder({}), email: 10 as any });
    expect(isValid).toBeFalsy();
    expect(sut.errors['email']).toStrictEqual([
      'email must be an email',
      'email must be a string',
      'email must be shorter than or equal to 255 characters',
    ]);

    isValid = sut.validate({
      ...UserDataBuilder({}),
      email: 'a'.repeat(256),
    });
    expect(isValid).toBeFalsy();
    expect(sut.errors['email']).toStrictEqual([
      'email must be an email',
      'email must be shorter than or equal to 255 characters',
    ]);
  });

  it('Invalidation case for password field', () => {
    let isValid = sut.validate(null as any);
    expect(isValid).toBeFalsy();
    expect(sut.errors['password']).toStrictEqual([
      'password should not be empty',
      'password must be a string',
      'password must be shorter than or equal to 100 characters',
    ]);

    isValid = sut.validate({ ...UserDataBuilder({}), password: '' as any });
    expect(isValid).toBeFalsy();
    expect(sut.errors['password']).toStrictEqual([
      'password should not be empty',
    ]);

    isValid = sut.validate({ ...UserDataBuilder({}), password: 10 as any });
    expect(isValid).toBeFalsy();
    expect(sut.errors['password']).toStrictEqual([
      'password must be a string',
      'password must be shorter than or equal to 100 characters',
    ]);

    isValid = sut.validate({
      ...UserDataBuilder({}),
      password: 'a'.repeat(256),
    });
    expect(isValid).toBeFalsy();
    expect(sut.errors['password']).toStrictEqual([
      'password must be shorter than or equal to 100 characters',
    ]);
  });

  it('Invalidation case for createdAt field', () => {
    let isValid = sut.validate({ ...props, createdAt: 10 as any });
    expect(isValid).toBeFalsy();
    expect(sut.errors['createdAt']).toStrictEqual([
      'createdAt must be a Date instance',
    ]);

    isValid = sut.validate({ ...props, createdAt: '2023' as any });
    expect(isValid).toBeFalsy();
    expect(sut.errors['createdAt']).toStrictEqual([
      'createdAt must be a Date instance',
    ]);
  });

  it('Valid case for user rules', () => {
    const isValid = sut.validate(props);
    expect(isValid).toBeTruthy();
    expect(sut.validatedData).toStrictEqual(new UserRules(props));
  });
});
