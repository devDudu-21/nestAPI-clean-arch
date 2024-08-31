import { UpdatePasswordUseCase } from '@/users/application/usecases/updatepassword.usecase';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDto
  implements Omit<UpdatePasswordUseCase.Input, 'id'>
{
  @ApiProperty({ description: 'Senha nova do usuário' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Senha antiga do usuário' })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;
}
