import { IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  clinicId!: string;

  @IsNotEmpty()
  patientId!: string;

  @IsNotEmpty()
  dentistId!: string;

  @IsNotEmpty()
  serviceId!: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsOptional()
  notes?: string;
}
