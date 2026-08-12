import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { LoginRequest } from '@nexus-ed/shared-types';

export class LoginDto implements LoginRequest {
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
