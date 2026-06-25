import { IsEnum, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApplicationType } from '../entities/application.entity';

export class CreateApplicationDto {
  @IsEnum(ApplicationType)
  type: ApplicationType;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  applicantName: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  purpose?: string;
}
