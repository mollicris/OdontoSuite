import { IsNotEmpty, IsString, IsUUID, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AppointmentChannel {
  FRONTEND = 'FRONTEND',
  WHATSAPP = 'WHATSAPP',
  MOBILE = 'MOBILE',
  PHONE = 'PHONE',
}

export class BookAppointmentDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'Clínica ID' })
  declare clinicId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'Paciente ID' })
  declare patientId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'Dentista ID' })
  declare dentistId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'Servicio ID' })
  declare serviceId: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Fecha/hora de inicio (ISO 8601)' })
  declare startTime: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Fecha/hora de fin (ISO 8601)' })
  declare endTime: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Notas adicionales', required: false })
  notes?: string;

  @IsEnum(AppointmentChannel)
  @IsOptional()
  @ApiProperty({ description: 'Canal de origen', enum: AppointmentChannel, default: AppointmentChannel.FRONTEND })
  channel: AppointmentChannel = AppointmentChannel.FRONTEND;
}
