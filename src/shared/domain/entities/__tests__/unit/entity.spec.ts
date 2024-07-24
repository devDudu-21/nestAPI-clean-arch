import { validate as validateUUID } from 'uuid';
import { Entity } from '../../entity';

type StubProps = {
  prop1: string;
  prop2: number;
};

class StubEntity extends Entity<StubProps> {}
describe('Entity unit tests', () => {
  it('should se props and id', () => {
    const props = { prop1: 'value1', prop2: 15 };
    const entity = new StubEntity(props);

    expect(entity.props).toStrictEqual(props);
    expect(entity._id).not.toBeNull();
    expect(validateUUID(entity._id)).toBeTruthy();
  });

  it('should accept a valid uuid', () => {
    const props = { prop1: 'value1', prop2: 15 };
    const id = '98fa40ea-9cf2-4e0d-a150-4cf12d379ba3';
    const entity = new StubEntity(props, id);

    expect(validateUUID(entity._id)).toBeTruthy();
    expect(entity._id).toEqual(id);
  });

  it('should return the id', () => {
    const props = { prop1: 'value1', prop2: 15 };
    const id = '98fa40ea-9cf2-4e0d-a150-4cf12d379ba3';
    const entity = new StubEntity(props, id);

    expect(entity._id).toEqual(id);
  });

  it('should convert a entity to a json', () => {
    const props = { prop1: 'value1', prop2: 15 };
    const id = '98fa40ea-9cf2-4e0d-a150-4cf12d379ba3';
    const entity = new StubEntity(props, id);

    expect(entity.toJson()).toStrictEqual({
      id,
      ...props,
    });
  });
});
