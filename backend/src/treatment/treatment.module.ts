import { Module } from '@nestjs/common';
import { CommonModule } from '@common/common.module';
import { TreatmentController } from './presentation/treatment.controller';
import { CreateTreatmentUseCase } from './application/use-cases/create-treatment.use-case';
import { GetTreatmentUseCase } from './application/use-cases/get-treatment.use-case';
import { ListTreatmentsUseCase } from './application/use-cases/list-treatments.use-case';
import { UpdateTreatmentUseCase } from './application/use-cases/update-treatment.use-case';
import { DeleteTreatmentUseCase } from './application/use-cases/delete-treatment.use-case';
import { TreatmentRepository } from './infrastructure/repositories/treatment.repository';

@Module({
  imports: [CommonModule],
  controllers: [TreatmentController],
  providers: [
    CreateTreatmentUseCase,
    GetTreatmentUseCase,
    ListTreatmentsUseCase,
    UpdateTreatmentUseCase,
    DeleteTreatmentUseCase,
    TreatmentRepository,
  ],
  exports: [TreatmentRepository],
})
export class TreatmentModule {}
