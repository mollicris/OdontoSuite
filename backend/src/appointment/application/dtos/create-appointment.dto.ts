import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  clinicId!: string;

  @IsNotEmpty()
  patientId!: string;

  @IsNotEmpty()
  dentistId!: string;

  @IsNotEmpty()
  serviceId!: string;

  @IsNotEmpty()
  @IsString()
  startTime!: string;

  @IsNotEmpty()
  @IsString()
  endTime!: string;

  @IsOptional()
  notes?: string;
}
