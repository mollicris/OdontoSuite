import { Injectable } from '@nestjs/common';
import { AppointmentRepository } from '../../infrastructure/repositories/appointment.repository';
import { AppointmentResponseDto } from '../dtos/appointment-response.dto';
import { AppointmentStatus } from '../../domain/appointment.entity';

export interface ListAppointmentsInput {
  clinicId: string;
  date?: string;
  status?: AppointmentStatus | 'ALL';
  dentistId?: string;
  skip?: number;
  take?: number;
}

@Injectable()
export class ListAppointmentsUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(input: ListAppointmentsInput): Promise<AppointmentResponseDto[]> {
    const {
      clinicId,
      date,
      status,
      skip = 0,
      take = 10,
    } = input;

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (date) {
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
    }

    const appointments = await this.appointmentRepository.findByClinic(
      clinicId,
      startDate,
      endDate,
      status && status !== 'ALL' ? status : undefined,
      skip,
      take,
    );

    return appointments.map((apt) => this.mapToDto(apt));
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
