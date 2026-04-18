import { Injectable } from '@nestjs/common';
import { PatientResponseDto } from '../dtos/patient-response.dto';

@Injectable()
export class PatientDtoMapper {
  mapToDto(patient: any): PatientResponseDto {
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
