export type PatientGender = 'M' | 'F' | 'O';

export interface Patient {
  id: string;
  clinicId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  age: number;
  gender: PatientGender;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface PatientListState {
  patients: Patient[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
}
