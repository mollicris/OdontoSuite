import { Module } from '@nestjs/common';
import { CommonModule } from '@common/common.module';
import { AppointmentController } from './presentation/appointment.controller';
import { CreateAppointmentUseCase } from './application/use-cases/create-appointment.use-case';
import { ListAppointmentsUseCase } from './application/use-cases/list-appointments.use-case';
import { UpdateAppointmentUseCase } from './application/use-cases/update-appointment.use-case';
import { CheckAppointmentAvailabilityUseCase } from './application/use-cases/check-availability.use-case';
import { AppointmentRepository } from './infrastructure/repositories/appointment.repository';
import { AvailabilityService } from './infrastructure/services/availability.service';
import { AVAILABILITY_SERVICE } from './infrastructure/interfaces/availability-service.interface';

@Module({
  imports: [CommonModule],
  controllers: [AppointmentController],
  providers: [
    CreateAppointmentUseCase,
    ListAppointmentsUseCase,
    UpdateAppointmentUseCase,
    CheckAppointmentAvailabilityUseCase,
    AppointmentRepository,
    { provide: AVAILABILITY_SERVICE, useClass: AvailabilityService },
    AvailabilityService,
  ],
  exports: [AppointmentRepository, AVAILABILITY_SERVICE, AvailabilityService],
})
export class AppointmentModule {}
