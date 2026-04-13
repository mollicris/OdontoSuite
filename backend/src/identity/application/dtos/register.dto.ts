import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'doctor@clinic.com',
    description: 'Email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Password123',
    description: 'Password (minimum 6 characters)',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    example: 'Juan',
    description: 'First name',
  })
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({
    example: 'García',
    description: 'Last name',
  })
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({
    example: '+34 123 456 789',
    description: 'Phone number (optional)',
    required: false,
  })
  @IsOptional()
  phone?: string;
}
