import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  role?: string;

  // Student specific fields
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  learningGoals?: string;

  @IsOptional()
  @IsString()
  interests?: string;

  // Instructor specific fields
  @IsOptional()
  @IsString()
  headline?: string;

  @IsOptional()
  @IsString()
  biography?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  socialLinks?: string;
}
