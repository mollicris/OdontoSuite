import { Injectable } from '@nestjs/common';
import { AppointmentRepository } from '../../infrastructure/repositories/appointment.repository';
import { CreateAppointmentDto } from '../dtos/create-appointment.dto';
import { AppointmentResponseDto } from '../dtos/appointment-response.dto';
import { AppointmentEntity, AppointmentStatus } from '../../domain/appointment.entity';

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(createAppointmentDto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    console.log('📝 CreateAppointmentUseCase - Received DTO:', JSON.stringify(createAppointmentDto));

    const appointment = new AppointmentEntity({
      ...createAppointmentDto,
      startTime: new Date(createAppointmentDto.startTime),
      endTime: new Date(createAppointmentDto.endTime),
      status: AppointmentStatus.SCHEDULED,
    } as Partial<AppointmentEntity>);

    console.log('📝 CreateAppointmentUseCase - Created Entity:', {
      clinicId: appointment.clinicId,
      patientId: appointment.patientId,
      dentistId: appointment.dentistId,
      serviceId: appointment.serviceId,
      status: appointment.status,
    });

    const created = await this.appointmentRepository.create(appointment);

    return this.mapToDto(created);
  }

  private mapToDto(appointment: any): AppointmentResponseDto {
    return {
      id: appointment.id,
      clinicId: appointment.clinicId,
      patientId: appointment.patientId,
      patientName: appointment.patient
        ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
        : '',
      dentistId: appointment.dentistId,
      dentistName: appointment.dentist
        ? `${appointment.dentist.firstName} ${appointment.dentist.lastName}`
        : '',
      serviceId: appointment.serviceId,
      serviceName: appointment.service ? appointment.service.name : '',
      serviceDuration: appointment.service ? appointment.service.duration : 0,
      startTime: appointment.startTime.toISOString(),
      endTime: appointment.endTime.toISOString(),
      status: appointment.status,
      notes: appointment.notes,
      cancelReason: appointment.cancelReason,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    };
  }
}
