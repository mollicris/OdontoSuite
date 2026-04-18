import { Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentRepository } from '../../infrastructure/repositories/appointment.repository';
import { UpdateAppointmentDto } from '../dtos/update-appointment.dto';
import { AppointmentResponseDto } from '../dtos/appointment-response.dto';

@Injectable()
export class UpdateAppointmentUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(
    appointmentId: string,
    updateDto: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const updateData: Record<string, any> = {};

    if (updateDto.status !== undefined) updateData.status = updateDto.status;
    if (updateDto.notes !== undefined) updateData.notes = updateDto.notes;
    if (updateDto.cancelReason !== undefined)
      updateData.cancelReason = updateDto.cancelReason;
    if (updateDto.startTime !== undefined)
      updateData.startTime = new Date(updateDto.startTime);
    if (updateDto.endTime !== undefined)
      updateData.endTime = new Date(updateDto.endTime);

    try {
      const updated = await this.appointmentRepository.update(appointmentId, updateData);
      return this.mapToDto(updated);
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Appointment with id ${appointmentId} not found`);
      }
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
