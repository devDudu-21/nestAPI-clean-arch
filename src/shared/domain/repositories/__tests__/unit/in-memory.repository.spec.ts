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
});
