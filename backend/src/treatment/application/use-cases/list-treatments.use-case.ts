import { Injectable } from '@nestjs/common';
import { TreatmentRepository } from '../../infrastructure/repositories/treatment.repository';
import { TreatmentResponseDto } from '../dtos/treatment-response.dto';

export interface ListTreatmentsInput {
  patientId: string;
  status?: string;
  serviceId?: string;
  skip?: number;
  take?: number;
}

@Injectable()
export class ListTreatmentsUseCase {
  constructor(private readonly treatmentRepository: TreatmentRepository) {}

  async execute(input: ListTreatmentsInput): Promise<TreatmentResponseDto[]> {
    const treatments = await this.treatmentRepository.findByPatient(
      input.patientId,
      {
        status: input.status,
        serviceId: input.serviceId,
        skip: input.skip,
        take: input.take,
      },
    );

    return treatments.map((t) => this.mapToResponseDto(t));
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
