import { SortDirection } from '@/shared/domain/repositories/searchable-repository-contract';
import { ListUsersUseCase } from '@/users/application/usecases/listusers.usecase';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ListUsersDto implements ListUsersUseCase.Input {
  @ApiProperty({ description: 'Página que será retornada' })
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Quantidade de registros por página' })
  @IsOptional()
  perPage?: number;

  @ApiProperty({
    description: 'Coluna definida para ordenar os dados: "name" ou "createdAt"',
  })
  @IsOptional()
  sort?: string;

  @ApiProperty({
    description: 'Ordenação dos dados: crescente (asc) ou descrescente (desc) ',
  })
  @IsOptional()
  sortDir?: SortDirection;

  @ApiProperty({ description: 'Dado informado para filtrar o resultado ' })
  @IsOptional()
  filter?: string;
}
