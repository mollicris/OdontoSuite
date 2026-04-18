import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { ClinicEntity } from '../../domain/clinic.entity';

@Injectable()
export class ClinicRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ClinicEntity[]> {
    const clinics = await this.prisma.clinic.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return clinics.map((clinic) => new ClinicEntity(clinic));
  }

  async findById(id: string): Promise<ClinicEntity | null> {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id },
    });
    return clinic ? new ClinicEntity(clinic) : null;
  }
}
