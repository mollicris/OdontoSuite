import type { Treatment } from './Treatment.types';

export interface TreatmentApiResponse {
  statusCode: number;
  message: string;
  data: Treatment;
  timestamp: string;
}

export interface TreatmentListApiResponse {
  statusCode: number;
  message: string;
  data: Treatment[];
  timestamp: string;
}
