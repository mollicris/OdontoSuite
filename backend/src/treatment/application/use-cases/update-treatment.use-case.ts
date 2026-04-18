import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TreatmentRepository } from '../../infrastructure/repositories/treatment.repository';
import { UpdateTreatmentDto } from '../dtos/update-treatment.dto';
import { TreatmentResponseDto } from '../dtos/treatment-response.dto';

@Injectable()
export class UpdateTreatmentUseCase {
  constructor(private readonly treatmentRepository: TreatmentRepository) {}

  async execute(id: string, dto: UpdateTreatmentDto): Promise<TreatmentResponseDto> {
    const existing = await this.treatmentRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Treatment with ID ${id} not found`);
    }

    // Validations
    if (
      dto.status === 'COMPLETED' &&
      !dto.completedDate &&
      !existing.completedDate
    ) {
      throw new BadRequestException(
        'completedDate is required when marking treatment as COMPLETED',
      );
    }

    const updateData: any = {};

    if (dto.diagnosis !== undefined) updateData.diagnosis = dto.diagnosis;
    if (dto.treatment !== undefined) updateData.treatment = dto.treatment;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.observations !== undefined) updateData.observations = dto.observations;
    if (dto.procedure !== undefined) updateData.procedure = dto.procedure;
    if (dto.tooth !== undefined) updateData.tooth = dto.tooth;
    if (dto.cost !== undefined) updateData.cost = dto.cost;
    if (dto.scheduledDate !== undefined)
      updateData.scheduledDate = new Date(dto.scheduledDate);
    if (dto.completedDate !== undefined)
      updateData.completedDate = new Date(dto.completedDate);
    if (dto.status !== undefined) updateData.status = dto.status;

    const treatment = await this.treatmentRepository.update(id, updateData);

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
