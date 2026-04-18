import { Module } from '@nestjs/common';
import { CommonModule } from '@common/common.module';
import { ClinicController } from './presentation/clinic.controller';
import { ListClinicsUseCase } from './application/use-cases/list-clinics.use-case';
import { ClinicRepository } from './infrastructure/repositories/clinic.repository';

@Module({
  imports: [CommonModule],
  controllers: [ClinicController],
  providers: [ListClinicsUseCase, ClinicRepository],
  exports: [ClinicRepository],
})
export class ClinicModule {}
