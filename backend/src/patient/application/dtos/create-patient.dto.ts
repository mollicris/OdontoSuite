import { IsEmail, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({ example: 'clinic-1', description: 'Clinic ID' })
  @IsNotEmpty()
  clinicId!: string;

  @ApiProperty({ example: 'Carlos', description: 'Patient first name' })
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'López', description: 'Patient last name' })
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: 'carlos@email.com', description: 'Patient email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+34 987 654 321', description: 'Patient phone' })
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: '1990-05-15', description: 'Date of birth (YYYY-MM-DD)' })
  @IsDateString()
  dateOfBirth!: string;

  @ApiProperty({ example: 'M', description: 'Gender (M/F/O)', enum: ['M', 'F', 'O'] })
  @IsNotEmpty()
  gender!: string;

  @ApiProperty({ example: '12345678901', description: 'CPF (optional)', required: false })
  @IsOptional()
  cpf?: string;

  @ApiProperty({ example: 'Calle Principal 123', description: 'Address (optional)', required: false })
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'Madrid', description: 'City (optional)', required: false })
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'Madrid', description: 'State (optional)', required: false })
  @IsOptional()
  state?: string;

  @ApiProperty({ example: '28001', description: 'Zip code (optional)', required: false })
  @IsOptional()
  zipCode?: string;

  @ApiProperty({ example: 'Juan García', description: 'Emergency contact (optional)', required: false })
  @IsOptional()
  emergencyContact?: string;

  @ApiProperty({ example: '+34 666 777 888', description: 'Emergency phone (optional)', required: false })
  @IsOptional()
  emergencyPhone?: string;

  @ApiProperty({
    example: ['Penicilina', 'Aspirin'],
    description: 'Allergies (optional)',
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
  allergies?: string[];

  @ApiProperty({
    example: ['Diabetes', 'Hipertensión'],
    description: 'Medical conditions (optional)',
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
  medicalConditions?: string[];

  @ApiProperty({ example: 'Axa', description: 'Insurance provider (optional)', required: false })
  @IsOptional()
  insuranceProvider?: string;

  @ApiProperty({ example: 'Notas adicionales', description: 'Additional notes (optional)', required: false })
  @IsOptional()
  notes?: string;
}
