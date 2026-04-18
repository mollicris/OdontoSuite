import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateTreatmentDto {
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsString()
  @IsNotEmpty()
  serviceId!: string;

  @IsString()
  @IsNotEmpty()
  performedBy!: string; // dentistId

  @IsOptional()
  @IsString()
  appointmentId?: string;

  @IsString()
  @IsNotEmpty()
  diagnosis!: string;

  @IsString()
  @IsNotEmpty()
  treatment!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsString()
  procedure?: string;

  @IsOptional()
  @IsString()
  tooth?: string;

  @IsNumber()
  @Min(0)
  cost!: number;

  @IsDateString()
  scheduledDate!: string;

  @IsOptional()
  @IsDateString()
  completedDate?: string;
}
