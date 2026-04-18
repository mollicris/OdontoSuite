import { Injectable, NotFoundException } from '@nestjs/common';
import { PatientRepository } from '../../infrastructure/repositories/patient.repository';
import { PatientResponseDto } from '../dtos/patient-response.dto';
import { PatientDtoMapper } from '../mappers/patient-dto.mapper';

@Injectable()
export class GetPatientUseCase {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly patientDtoMapper: PatientDtoMapper,
  ) {}

  async execute(patientId: string): Promise<PatientResponseDto> {
    const patient = await this.patientRepository.findById(patientId);
    if (!patient) {
      throw new NotFoundException(`Patient with id ${patientId} not found`);
    }
    return this.patientDtoMapper.mapToDto(patient);
  }
}
