import { Transform } from 'class-transformer';

export type PaginationPresenterProps = {
  currentPage: number;
  perPage: number;
  lastPage: number;
  total: number;
};

export class PaginationPresenter {
  @Transform(({ value }: { value: string }) => parseInt(value))
  currentPage: number;

  @Transform(({ value }: { value: string }) => parseInt(value))
  perPage: number;

  @Transform(({ value }: { value: string }) => parseInt(value))
  lastPage: number;

  @Transform(({ value }: { value: string }) => parseInt(value))
  total: number;

  constructor(props: PaginationPresenterProps) {
    this.currentPage = props.currentPage;
    this.perPage = props.perPage;
    this.lastPage = props.lastPage;
    this.total = props.total;
  }
}
