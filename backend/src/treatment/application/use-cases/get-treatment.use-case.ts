import { Injectable, NotFoundException } from '@nestjs/common';
import { TreatmentRepository } from '../../infrastructure/repositories/treatment.repository';
import { TreatmentResponseDto } from '../dtos/treatment-response.dto';

@Injectable()
export class GetTreatmentUseCase {
  constructor(private readonly treatmentRepository: TreatmentRepository) {}

  async execute(id: string): Promise<TreatmentResponseDto> {
    const treatment = await this.treatmentRepository.findById(id);

    if (!treatment) {
      throw new NotFoundException(`Treatment with ID ${id} not found`);
    }

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
