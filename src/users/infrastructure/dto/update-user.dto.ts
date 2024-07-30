import { UpdateUserUseCase } from '@/users/application/usecases/updateuser.usecase';

export class UpdateUserDto implements Omit<UpdateUserUseCase.Input, 'id'> {
  name: string;
}
