import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { RegisterRequest } from '@nexus-ed/shared-types';

export class RegisterDto implements RegisterRequest {
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  role!: 'STUDENT' | 'INSTRUCTOR';
}
