import type { TreatmentStatus } from './Treatment.types';

export interface CreateTreatmentRequest {
  patientId: string;
  serviceId: string;
  performedBy: string;
  diagnosis: string;
  treatment: string;
  cost: number;
  scheduledDate: string;
  appointmentId?: string;
  notes?: string;
  observations?: string;
  completedDate?: string;
}

export interface UpdateTreatmentRequest {
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  observations?: string;
  cost?: number;
  scheduledDate?: string;
  completedDate?: string;
  status?: TreatmentStatus;
}

export interface ListTreatmentsRequest {
  patientId: string;
  status?: TreatmentStatus | 'ALL';
  serviceId?: string;
  skip?: number;
  take?: number;
}
