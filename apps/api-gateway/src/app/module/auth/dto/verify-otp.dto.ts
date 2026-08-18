import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(['REGISTER', 'RESET_PASSWORD'])
  @IsNotEmpty()
  type: 'REGISTER' | 'RESET_PASSWORD';
}
