import { UpdateUserUseCase } from '@/users/application/usecases/updateuser.usecase';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto implements Omit<UpdateUserUseCase.Input, 'id'> {
  @IsString()
  @IsNotEmpty()
  name: string;
}
