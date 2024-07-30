import { UpdatePasswordUseCase } from '@/users/application/usecases/updatepassword.usecase';

export class UpdatePasswordDto
  implements Omit<UpdatePasswordUseCase.Input, 'id'>
{
  password: string;
  oldPassword: string;
}
