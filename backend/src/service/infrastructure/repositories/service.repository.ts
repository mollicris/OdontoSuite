import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { ServiceEntity } from '../../domain/service.entity';
import type { ListServicesDto } from '../../application/dtos/list-services.dto';

@Injectable()
export class ServiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: ListServicesDto): Promise<ServiceEntity[]> {
    const { clinicId, isActive, skip = 0, take = 100 } = filters;

    const where: any = {};
    if (clinicId) where.clinicId = clinicId;
    if (isActive !== undefined) where.isActive = isActive;

    const services = await this.prisma.service.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return services.map((service) => new ServiceEntity({
      ...service,
      description: service.description ?? undefined,
    }));
  }

  async findById(id: string): Promise<ServiceEntity | null> {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });
    return service ? new ServiceEntity({
      ...service,
      description: service.description ?? undefined,
    }) : null;
  }
}
