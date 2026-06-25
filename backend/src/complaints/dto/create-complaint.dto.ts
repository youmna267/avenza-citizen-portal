import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateComplaintDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  category: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description: string;
}
