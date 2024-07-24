import { Entity } from '@/shared/domain/entities/entity';
import { InMemoryRepository } from '../../in-memory.repository';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';

type StubEntityProps = {
  name: string;
  price: number;
};

class StubEntity extends Entity<StubEntityProps> {}

class StubInMemoryRepository extends InMemoryRepository<StubEntity> {}

describe('InMemoryRepository unit tests', () => {
  let sut: StubInMemoryRepository;

  beforeEach(() => {
    sut = new StubInMemoryRepository();
  });

  it('should inserts a new entity', async () => {
    const entity = new StubEntity({ name: 'test name', price: 10 });
    await sut.insert(entity);
    expect(entity.toJson()).toStrictEqual(sut.items[0].toJson());
  });

  it('should throw error when entity is not found', async () => {
    await expect(sut.findById('fake id')).rejects.toThrow(
      new NotFoundError('Entity not found'),
    );
  });

  it('should find a entity by id', async () => {
    const entity = new StubEntity({ name: 'test name', price: 10 });
    await sut.insert(entity);
    const result = await sut.findById(entity._id);
    expect(entity.toJson()).toStrictEqual(result.toJson());
  });

  it('should return all entities', async () => {
    const entity = new StubEntity({ name: 'test name', price: 10 });
    await sut.insert(entity);
    const result = await sut.findAll();
    expect([entity]).toStrictEqual(result);
  });

  it('should throw error on update when entity is not found', async () => {
    const entity = new StubEntity({ name: 'test name', price: 10 });
    await expect(sut.update(entity)).rejects.toThrow(
      new NotFoundError('Entity not found'),
    );
  });

  it('should update an entity', async () => {
    const entity = new StubEntity({ name: 'test name', price: 10 });
    await sut.insert(entity);
    const entityUpdated = new StubEntity(
      { name: 'updated name', price: 20 },
      entity._id,
    );
    await sut.update(entityUpdated);
    expect(entityUpdated.toJson()).toStrictEqual(sut.items[0].toJson());
  });

  it('should throw error on delete when entity is not found', async () => {
    await expect(sut.delete('fakeId')).rejects.toThrow(
      new NotFoundError('Entity not found'),
    );
  });

  it('should delete an entity', async () => {
    const entity = new StubEntity({ name: 'test name', price: 10 });
    await sut.insert(entity);
    await sut.delete(entity._id);
    expect(sut.items).toHaveLength(0);
  });
});
