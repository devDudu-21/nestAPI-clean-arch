import { UserOutput } from '@/users/application/dto/user-output';
import { UserPresenter } from '../../user.presenter';
import { UserCollectionPresenter } from '../../user-collection.presenter';
import { PaginationPresenter } from '@/shared/infrastructure/presenters/pagination.presenter';
import { instanceToPlain } from 'class-transformer';

describe('UserColletionPresenter unit tests', () => {
  const createdAt = new Date();
  const props: UserOutput = {
    id: 'a86e1d1c-276d-41c7-8ef9-fc1f4d10bf48',
    name: 'Test name',
    email: 'a@a.com',
    password: 'fake',
    createdAt,
  };

  describe('constructor', () => {
    it('should set values', () => {
      const sut = new UserCollectionPresenter({
        items: [props],
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 1,
      });
      expect(sut.meta).toBeInstanceOf(PaginationPresenter);
      expect(sut.meta).toStrictEqual(
        new PaginationPresenter({
          currentPage: 1,
          perPage: 2,
          lastPage: 1,
          total: 1,
        }),
      );
      expect(sut.data).toStrictEqual([new UserPresenter(props)]);
    });
  });

  it('should presenter data', () => {
    let sut = new UserCollectionPresenter({
      items: [props],
      currentPage: 1,
      perPage: 2,
      lastPage: 1,
      total: 1,
    });

    let output = instanceToPlain(sut);
    expect(output).toStrictEqual({
      data: [
        {
          id: 'a86e1d1c-276d-41c7-8ef9-fc1f4d10bf48',
          name: 'Test name',
          email: 'a@a.com',
          createdAt: createdAt.toISOString(),
        },
      ],
      meta: {
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 1,
      },
    });

    sut = new UserCollectionPresenter({
      items: [props],
      currentPage: '1' as any,
      perPage: '2' as any,
      lastPage: '1' as any,
      total: '1' as any,
    });

    output = instanceToPlain(sut);
    expect(output).toStrictEqual({
      data: [
        {
          id: 'a86e1d1c-276d-41c7-8ef9-fc1f4d10bf48',
          name: 'Test name',
          email: 'a@a.com',
          createdAt: createdAt.toISOString(),
        },
      ],
      meta: {
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 1,
      },
    });
  });
});
