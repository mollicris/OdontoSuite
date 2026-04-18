export type AppointmentStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  patientName: string;
  dentistId: string;
  dentistName: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string }> = {
  SCHEDULED: { label: 'Agendada', color: 'blue' },
  IN_PROGRESS: { label: 'En curso', color: 'orange' },
  COMPLETED: { label: 'Completada', color: 'green' },
  CANCELLED: { label: 'Cancelada', color: 'red' },
};
