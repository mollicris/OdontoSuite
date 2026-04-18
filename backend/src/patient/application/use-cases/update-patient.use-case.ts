import { Injectable, NotFoundException } from '@nestjs/common';
import { PatientRepository } from '../../infrastructure/repositories/patient.repository';
import { PatientResponseDto } from '../dtos/patient-response.dto';
import { PatientDtoMapper } from '../mappers/patient-dto.mapper';

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
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly patientDtoMapper: PatientDtoMapper,
  ) {}

  async execute(input: UpdatePatientInput): Promise<PatientResponseDto> {
    const { patientId, ...fields } = input;
    const updateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updateData[key] = value;
    }

    try {
      const updatedPatient = await this.patientRepository.update(patientId, updateData);
      return this.patientDtoMapper.mapToDto(updatedPatient);
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Patient with id ${patientId} not found`);
      }
      throw error;
    }
  }
}
