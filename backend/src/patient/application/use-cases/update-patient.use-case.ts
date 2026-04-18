import { Injectable, NotFoundException } from '@nestjs/common';
import { PatientRepository } from '../../infrastructure/repositories/patient.repository';
import { PatientResponseDto } from '../dtos/patient-response.dto';

export interface UpdatePatientInput {
  patientId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'M' | 'F' | 'O';
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
  isActive?: boolean;
}

@Injectable()
export class UpdatePatientUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(input: UpdatePatientInput): Promise<PatientResponseDto> {
    const { patientId, ...fields } = input;
    const updateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updateData[key] = value;
    }

    try {
      const updatedPatient = await this.patientRepository.update(patientId, updateData);
      return this.mapToDto(updatedPatient);
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Patient with id ${patientId} not found`);
      }
      throw error;
    }
  }

  private mapToDto(patient: any): PatientResponseDto {
    return {
      id: patient.id,
      clinicId: patient.clinicId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      fullName: `${patient.firstName} ${patient.lastName}`,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      age: this.calculateAge(patient.dateOfBirth),
      gender: patient.gender,
      cpf: patient.cpf,
      address: patient.address,
      city: patient.city,
      state: patient.state,
      zipCode: patient.zipCode,
      emergencyContact: patient.emergencyContact,
      emergencyPhone: patient.emergencyPhone,
      allergies: patient.allergies,
      medicalConditions: patient.medicalConditions,
      insuranceProvider: patient.insuranceProvider,
      notes: patient.notes,
      isActive: patient.isActive,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }

  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
}
