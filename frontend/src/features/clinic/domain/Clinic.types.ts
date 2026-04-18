export interface Clinic {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  isActive: boolean;
}

export interface ClinicState {
  clinics: Clinic[];
  selectedClinicId: string | null;
  isLoading: boolean;
  error: string | null;
}
