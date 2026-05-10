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
      // Parse date string (YYYY-MM-DD) as La Paz local time (UTC-4)
      const parts = date.split('-');
      const year = Number.parseInt(parts[0], 10);
      const month = Number.parseInt(parts[1], 10);
      const day = Number.parseInt(parts[2], 10);

      // La Paz start of day (00:00:00) = UTC 04:00:00
      startDate = new Date(Date.UTC(year, month - 1, day, 4, 0, 0, 0));

      // La Paz end of day (23:59:59) = UTC next day 03:59:59
      endDate = new Date(Date.UTC(year, month - 1, day + 1, 3, 59, 59, 999));
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
