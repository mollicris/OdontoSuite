import { Module } from '@nestjs/common';
import { CommonModule } from '@common/common.module';
import { AppointmentController } from './presentation/appointment.controller';
import { CreateAppointmentUseCase } from './application/use-cases/create-appointment.use-case';
import { AppointmentRepository } from './infrastructure/repositories/appointment.repository';

@Module({
  imports: [CommonModule],
  controllers: [AppointmentController],
  providers: [CreateAppointmentUseCase, AppointmentRepository],
  exports: [AppointmentRepository],
})
export class AppointmentModule {}
