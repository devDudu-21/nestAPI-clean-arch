import { CollectionPresenter } from '@/shared/infrastructure/presenters/collection.presenter';
import { UserPresenter } from './user.presenter';
import { PaginationPresenter } from '@/shared/infrastructure/presenters/pagination.presenter';
import { ListUsersUseCase } from '@/users/application/usecases/listusers.usecase';

export class UserCollectionPresenter extends CollectionPresenter {
  data: UserPresenter[];

  constructor(output: ListUsersUseCase.Output) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map(item => new UserPresenter(item));
  }
}
