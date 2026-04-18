export type TreatmentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Treatment {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  diagnosis: string;
  treatment: string;
  notes?: string;
  observations?: string;
  cost: number;
  performedBy: string;
  dentistName: string;
  scheduledDate: string;
  completedDate?: string;
  status: TreatmentStatus;
  createdAt: string;
  updatedAt: string;
}

export const TREATMENT_STATUS_CONFIG: Record<TreatmentStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'yellow' },
  IN_PROGRESS: { label: 'En Progreso', color: 'blue' },
  COMPLETED: { label: 'Completado', color: 'green' },
  CANCELLED: { label: 'Cancelado', color: 'red' },
};
