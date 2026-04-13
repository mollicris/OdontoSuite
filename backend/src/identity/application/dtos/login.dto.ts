import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'doctor@clinic.com',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Password123',
    description: 'User password (minimum 6 characters)',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
