import { Injectable } from '@nestjs/common';
import { TreatmentRepository } from '../../infrastructure/repositories/treatment.repository';
import { CreateTreatmentDto } from '../dtos/create-treatment.dto';
import { TreatmentResponseDto } from '../dtos/treatment-response.dto';

@Injectable()
export class CreateTreatmentUseCase {
  constructor(private readonly treatmentRepository: TreatmentRepository) {}

  async execute(dto: CreateTreatmentDto): Promise<TreatmentResponseDto> {
    const treatment = await this.treatmentRepository.create({
      patientId: dto.patientId,
      serviceId: dto.serviceId,
      appointmentId: dto.appointmentId || null,
      diagnosis: dto.diagnosis,
      treatment: dto.treatment,
      notes: dto.notes,
      observations: dto.observations,
      procedure: dto.procedure,
      tooth: dto.tooth,
      cost: dto.cost,
      performedBy: dto.performedBy,
      scheduledDate: new Date(dto.scheduledDate),
      completedDate: dto.completedDate ? new Date(dto.completedDate) : null,
      status: 'PENDING',
    });

    return this.mapToResponseDto(treatment);
  }

  private mapToResponseDto(entity: any): TreatmentResponseDto {
    return {
      id: entity.id,
      patientId: entity.patientId,
      patientName: entity.patient
        ? `${entity.patient.firstName} ${entity.patient.lastName}`
        : '',
      appointmentId: entity.appointmentId,
      serviceId: entity.serviceId,
      serviceName: entity.service?.name || '',
      servicePrice: entity.service?.price || 0,
      diagnosis: entity.diagnosis,
      treatment: entity.treatment,
      notes: entity.notes,
      observations: entity.observations,
      procedure: entity.procedure,
      tooth: entity.tooth,
      prescriptions: entity.prescriptions,
      attachments: entity.attachments,
      cost: entity.cost,
      performedBy: entity.performedBy,
      dentistName: entity.dentist
        ? `${entity.dentist.firstName} ${entity.dentist.lastName}`
        : '',
      scheduledDate: entity.scheduledDate.toISOString(),
      completedDate: entity.completedDate?.toISOString(),
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
