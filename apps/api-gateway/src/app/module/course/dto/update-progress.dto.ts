import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateProgressDto {
  @IsString()
  @IsNotEmpty()
  lectureId: string;

  @IsBoolean()
  completed: boolean;
}
