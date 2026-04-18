export class PatientEntity {
  id!: string;
  clinicId!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  phone!: string;
  dateOfBirth!: Date;
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
  currentMedications?: string[];
  insuranceProvider?: string;
  insurancePolicyNo?: string;
  notes?: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<PatientEntity>) {
    Object.assign(this, data);
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  getAge(): number {
    const today = new Date();
    let age = today.getFullYear() - this.dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - this.dateOfBirth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < this.dateOfBirth.getDate())
    ) {
      age--;
    }
    return age;
  }
}
