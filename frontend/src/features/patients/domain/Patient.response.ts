import type { Patient } from './Patient.types';

export interface PatientApiResponse {
  statusCode: number;
  message: string;
  data: Patient;
  timestamp: string;
}

export interface PatientListApiResponse {
  statusCode: number;
  message: string;
  data: Patient[];
  timestamp: string;
}

export interface CreatePatientApiResponse {
  statusCode: number;
  message: string;
  data: Patient;
  timestamp: string;
}
