export class PatientResponseDto {
  id!: string;
  clinicId!: string;
  firstName!: string;
  lastName!: string;
  fullName!: string;
  email!: string;
  phone!: string;
  dateOfBirth!: Date;
  age!: number;
  gender!: string;
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
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
