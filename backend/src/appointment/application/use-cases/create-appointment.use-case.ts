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
    try {
      console.log('📝 CreateAppointmentUseCase - Received DTO:', JSON.stringify(createAppointmentDto));

      // Parse times from La Paz timezone (UTC-4)
      const startMatch = createAppointmentDto.startTime.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
      const endMatch = createAppointmentDto.endTime.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);

      if (!startMatch || !endMatch) {
        throw new Error('Invalid date format');
      }

      // Extract date/time components
      const startYear = Number.parseInt(startMatch[1], 10);
      const startMonth = Number.parseInt(startMatch[2], 10);
      const startDay = Number.parseInt(startMatch[3], 10);
      const startHour = Number.parseInt(startMatch[4], 10);
      const startMin = Number.parseInt(startMatch[5], 10);

      const endYear = Number.parseInt(endMatch[1], 10);
      const endMonth = Number.parseInt(endMatch[2], 10);
      const endDay = Number.parseInt(endMatch[3], 10);
      const endHour = Number.parseInt(endMatch[4], 10);
      const endMin = Number.parseInt(endMatch[5], 10);

      // Convert from La Paz time (UTC-4) to UTC (+4 hours)
      const startTime = new Date(Date.UTC(startYear, startMonth - 1, startDay, startHour + 4, startMin, 0));
      const endTime = new Date(Date.UTC(endYear, endMonth - 1, endDay, endHour + 4, endMin, 0));

      const appointment = new AppointmentEntity({
        ...createAppointmentDto,
        startTime,
        endTime,
        status: AppointmentStatus.SCHEDULED,
      } as Partial<AppointmentEntity>);

      console.log('📝 CreateAppointmentUseCase - Created Entity:', {
        clinicId: appointment.clinicId,
        patientId: appointment.patientId,
        dentistId: appointment.dentistId,
        serviceId: appointment.serviceId,
        startTime: appointment.startTime.toISOString(),
        endTime: appointment.endTime.toISOString(),
        status: appointment.status,
      });

      const created = await this.appointmentRepository.create(appointment);

      return this.mapToDto(created);
    } catch (error: any) {
      console.error('❌ CreateAppointmentUseCase - Error:', error?.message || error);
      throw error;
    }
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
