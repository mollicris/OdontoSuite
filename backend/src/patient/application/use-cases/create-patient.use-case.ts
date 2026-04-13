import { Injectable } from '@nestjs/common';
import { PatientRepository } from '../../infrastructure/repositories/patient.repository';
import { CreatePatientDto } from '../dtos/create-patient.dto';
import { PatientEntity } from '../../domain/patient.entity';

@Injectable()
export class CreatePatientUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(createPatientDto: CreatePatientDto) {
    const patient = new PatientEntity({
      ...createPatientDto,
      dateOfBirth: new Date(createPatientDto.dateOfBirth),
      isActive: true,
      allergies: createPatientDto.allergies || [],
      medicalConditions: createPatientDto.medicalConditions || [],
    } as Partial<PatientEntity>);

    const created = await this.patientRepository.create(patient);

    return {
      id: created.id,
      firstName: created.firstName,
      lastName: created.lastName,
      email: created.email,
      message: 'Patient created successfully',
    };
  }
}
