import type { Clinic } from './Clinic.types';

export interface ClinicListApiResponse {
  statusCode: number;
  message: string;
  data: Clinic[];
  timestamp: string;
}
