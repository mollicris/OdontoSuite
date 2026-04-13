import { Injectable } from '@nestjs/common';
import { AppointmentRepository } from '../../infrastructure/repositories/appointment.repository';
import { CreateAppointmentDto } from '../dtos/create-appointment.dto';
import { AppointmentEntity, AppointmentStatus } from '../../domain/appointment.entity';

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(createAppointmentDto: CreateAppointmentDto) {
    const appointment = new AppointmentEntity({
      ...createAppointmentDto,
      startTime: new Date(createAppointmentDto.startTime),
      endTime: new Date(createAppointmentDto.endTime),
      status: AppointmentStatus.SCHEDULED,
    } as Partial<AppointmentEntity>);

    const created =
      await this.appointmentRepository.create(appointment);

    return {
      id: created.id,
      startTime: created.startTime,
      endTime: created.endTime,
      status: created.status,
      message: 'Appointment created successfully',
    };
  }
}
