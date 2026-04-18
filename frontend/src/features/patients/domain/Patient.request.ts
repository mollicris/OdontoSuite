import type { PatientGender } from './Patient.types';

export interface CreatePatientRequest {
  clinicId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: PatientGender;
  cpf?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  allergies?: string[];
  medicalConditions?: string[];
  insuranceProvider?: string;
  notes?: string;
}

export interface ListPatientsRequest {
  clinicId: string;
  skip?: number;
  take?: number;
}
