import { Injectable } from '@nestjs/common';
import { ClinicRepository } from '../../infrastructure/repositories/clinic.repository';
import { ClinicResponseDto } from '../dtos/clinic-response.dto';

@Injectable()
export class ListClinicsUseCase {
  constructor(private readonly clinicRepository: ClinicRepository) {}

  async execute(): Promise<ClinicResponseDto[]> {
    const clinics = await this.clinicRepository.findAll();
    return clinics.map((clinic) => ({
      id: clinic.id,
      name: clinic.name,
      email: clinic.email,
      phone: clinic.phone,
      address: clinic.address,
      city: clinic.city,
      state: clinic.state,
      isActive: clinic.isActive,
    } as ClinicResponseDto));
  }
}
