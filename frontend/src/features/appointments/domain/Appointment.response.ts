import type { Appointment } from './Appointment.types';

export interface AppointmentApiResponse {
  statusCode: number;
  message: string;
  data: Appointment;
  timestamp: string;
}

export interface AppointmentListApiResponse {
  statusCode: number;
  message: string;
  data: Appointment[];
  timestamp: string;
}
