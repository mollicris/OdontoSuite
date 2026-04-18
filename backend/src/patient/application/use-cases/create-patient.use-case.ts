import { Injectable } from '@nestjs/common';
import { PatientRepository } from '../../infrastructure/repositories/patient.repository';
import { CreatePatientDto } from '../dtos/create-patient.dto';
import { PatientResponseDto } from '../dtos/patient-response.dto';
import { PatientEntity } from '../../domain/patient.entity';
import { PatientDtoMapper } from '../mappers/patient-dto.mapper';

@Injectable()
export class CreatePatientUseCase {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly patientDtoMapper: PatientDtoMapper,
  ) {}

  async execute(createPatientDto: CreatePatientDto): Promise<PatientResponseDto> {
    const patient = new PatientEntity({
      ...createPatientDto,
      dateOfBirth: new Date(createPatientDto.dateOfBirth),
      isActive: true,
      allergies: createPatientDto.allergies || [],
      medicalConditions: createPatientDto.medicalConditions || [],
    } as Partial<PatientEntity>);

    const created = await this.patientRepository.create(patient);

    return this.patientDtoMapper.mapToDto(created);
  }
}
