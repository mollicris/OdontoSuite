import type { AppointmentStatus } from './Appointment.types';

export interface CreateAppointmentRequest {
  clinicId: string;
  patientId: string;
  dentistId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  status?: AppointmentStatus;
  notes?: string;
  cancelReason?: string;
  startTime?: string;
  endTime?: string;
}

export interface ListAppointmentsRequest {
  clinicId: string;
  date?: string;
  status?: AppointmentStatus | 'ALL';
  dentistId?: string;
  skip?: number;
  take?: number;
}
