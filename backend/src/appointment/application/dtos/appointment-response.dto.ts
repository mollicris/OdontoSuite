import { AppointmentStatus } from '../../domain/appointment.entity';

export class AppointmentResponseDto {
  id!: string;
  clinicId!: string;
  patientId!: string;
  patientName!: string;
  dentistId!: string;
  dentistName!: string;
  serviceId!: string;
  serviceName!: string;
  serviceDuration!: number;
  startTime!: string;
  endTime!: string;
  status!: AppointmentStatus;
  notes?: string;
  cancelReason?: string;
  createdAt!: string;
  updatedAt!: string;
}
