import { Module } from '@nestjs/common';
import { CommonModule } from '@common/common.module';
import { PatientController } from './presentation/patient.controller';
import { CreatePatientUseCase } from './application/use-cases/create-patient.use-case';
import { PatientRepository } from './infrastructure/repositories/patient.repository';

@Module({
  imports: [CommonModule],
  controllers: [PatientController],
  providers: [CreatePatientUseCase, PatientRepository],
  exports: [PatientRepository],
})
export class PatientModule {}
