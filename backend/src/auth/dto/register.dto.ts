import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Jane Citizen', description: 'Full legal name' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  fullName: string;

  @ApiProperty({ example: 'jane@example.com', description: 'Email address' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: 'Secure@Pass123',
    description:
      'Min 8 chars, must include uppercase, lowercase, and a number or symbol',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain uppercase, lowercase, and a number or symbol',
  })
  password: string;

  @ApiPropertyOptional({ example: '+92-300-0000000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: '35202-1234567-1' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  cnic?: string;

  @ApiPropertyOptional({ example: '123 Main Street, Lahore' })
  @IsOptional()
  @IsString()
  address?: string;
}
