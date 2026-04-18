import { Module } from '@nestjs/common';
import { CommonModule } from '@common/common.module';
import { AppointmentController } from './presentation/appointment.controller';
import { CreateAppointmentUseCase } from './application/use-cases/create-appointment.use-case';
import { ListAppointmentsUseCase } from './application/use-cases/list-appointments.use-case';
import { UpdateAppointmentUseCase } from './application/use-cases/update-appointment.use-case';
import { CheckAppointmentAvailabilityUseCase } from './application/use-cases/check-availability.use-case';
import { AppointmentRepository } from './infrastructure/repositories/appointment.repository';

@Module({
  imports: [CommonModule],
  controllers: [AppointmentController],
  providers: [
    CreateAppointmentUseCase,
    ListAppointmentsUseCase,
    UpdateAppointmentUseCase,
    CheckAppointmentAvailabilityUseCase,
    AppointmentRepository,
  ],
  exports: [AppointmentRepository],
})
export class AppointmentModule {}
