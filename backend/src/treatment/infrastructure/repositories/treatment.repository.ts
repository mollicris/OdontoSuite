import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { TreatmentEntity } from '../../domain/treatment.entity';

interface FindByPatientFilters {
  status?: string;
  serviceId?: string;
  skip?: number;
  take?: number;
}

@Injectable()
export class TreatmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<TreatmentEntity> {
    const treatment = await this.prisma.treatment.create({
      data,
      include: { patient: true, service: true, dentist: true },
    });
    return this.mapPrismaToEntity(treatment);
  }

  async findById(id: string): Promise<TreatmentEntity | null> {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id },
      include: { patient: true, service: true, dentist: true },
    });
    return treatment ? this.mapPrismaToEntity(treatment) : null;
  }

  async findByPatient(
    patientId: string,
    filters: FindByPatientFilters = {},
  ): Promise<TreatmentEntity[]> {
    const { status, serviceId, skip = 0, take = 10 } = filters;

    const treatments = await this.prisma.treatment.findMany({
      where: {
        patientId,
        ...(status && status !== 'ALL' && { status }),
        ...(serviceId && { serviceId }),
      },
      include: { patient: true, service: true, dentist: true },
      orderBy: { scheduledDate: 'desc' },
      skip,
      take,
    });

    return treatments.map((t) => this.mapPrismaToEntity(t));
  }

  async update(id: string, data: any): Promise<TreatmentEntity> {
    const treatment = await this.prisma.treatment.update({
      where: { id },
      data,
      include: { patient: true, service: true, dentist: true },
    });
    return this.mapPrismaToEntity(treatment);
  }

  async softDelete(id: string): Promise<TreatmentEntity> {
    const treatment = await this.prisma.treatment.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { patient: true, service: true, dentist: true },
    });
    return this.mapPrismaToEntity(treatment);
  }

  private mapPrismaToEntity(data: any): TreatmentEntity {
    const entity = new TreatmentEntity(data);
    return entity;
  }
}
