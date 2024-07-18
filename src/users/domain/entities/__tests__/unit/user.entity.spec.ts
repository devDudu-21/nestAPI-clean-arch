import { UserProps } from './../../user.entity';
import { faker } from '@faker-js/faker';
import { UserEntity } from '../../user.entity';
describe('UserEntity unit tests', () => {
  let props: UserProps;
  let sut: UserEntity;
  beforeEach(() => {
    props = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    sut = new UserEntity(props);
  });
  it('Constructor method', () => {
    expect(sut.props.name).toEqual(props.name);
    expect(sut.props.email).toEqual(props.email);
    expect(sut.props.password).toEqual(props.password);
    expect(sut.props.createdAt).toBeInstanceOf(Date);
  });

  it('Getter of name field', () => {
    expect(sut.getName()).toBeDefined();
    expect(typeof sut.getName()).toBe('string');
    expect(sut.getName()).toEqual(props.name);
  });

  it('Getter of email field', () => {
    expect(sut.getEmail()).toBeDefined();
    expect(typeof sut.getEmail()).toBe('string');
    expect(sut.getEmail()).toEqual(props.email);
  });

  it('Getter of password field', () => {
    expect(sut.getPassword()).toBeDefined();
    expect(typeof sut.getPassword()).toBe('string');
    expect(sut.getPassword()).toEqual(props.password);
  });

  it('Getter of createdAt field', () => {
    expect(sut.getCreatedAt()).toBeDefined();
    expect(sut.getCreatedAt()).toBeInstanceOf(Date);
  });
});
