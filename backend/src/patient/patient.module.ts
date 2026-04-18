import { Module } from '@nestjs/common';
import { CommonModule } from '@common/common.module';
import { PatientController } from './presentation/patient.controller';
import { CreatePatientUseCase } from './application/use-cases/create-patient.use-case';
import { UpdatePatientUseCase } from './application/use-cases/update-patient.use-case';
import { GetPatientUseCase } from './application/use-cases/get-patient.use-case';
import { PatientDtoMapper } from './application/mappers/patient-dto.mapper';
import { PatientRepository } from './infrastructure/repositories/patient.repository';

@Module({
  imports: [CommonModule],
  controllers: [PatientController],
  providers: [PatientDtoMapper, CreatePatientUseCase, UpdatePatientUseCase, GetPatientUseCase, PatientRepository],
  exports: [PatientRepository],
})
export class PatientModule {}
