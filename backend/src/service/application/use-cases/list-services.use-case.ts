import { Injectable } from '@nestjs/common';
import { ServiceRepository } from '../../infrastructure/repositories/service.repository';
import type { ListServicesDto, ServiceResponseDto } from '../dtos/list-services.dto';

@Injectable()
export class ListServicesUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(filters: ListServicesDto): Promise<ServiceResponseDto[]> {
    const services = await this.serviceRepository.findAll(filters);
    return services.map((service) => ({
      id: service.id,
      clinicId: service.clinicId,
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      isActive: service.isActive,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    }));
  }
}
