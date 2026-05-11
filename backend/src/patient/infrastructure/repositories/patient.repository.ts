import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { PatientEntity } from '../../domain/patient.entity';

@Injectable()
export class PatientRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapPrismaToEntity(data: any): Partial<PatientEntity> {
    return {
      ...data,
      cpf: data.cpf || undefined,
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      zipCode: data.zipCode || undefined,
      emergencyContact: data.emergencyContact || undefined,
      emergencyPhone: data.emergencyPhone || undefined,
      allergies: data.allergies ? JSON.parse(data.allergies) : undefined,
      medicalConditions: data.medicalConditions ? JSON.parse(data.medicalConditions) : undefined,
      currentMedications: data.currentMedications ? JSON.parse(data.currentMedications) : undefined,
      insuranceProvider: data.insuranceProvider || undefined,
      insurancePolicyNo: data.insurancePolicyNo || undefined,
      notes: data.notes || undefined,
    };
  }

  private serializeForPrisma(data: Partial<PatientEntity>): Record<string, any> {
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = data as any;
    return {
      ...rest,
      allergies: rest.allergies === undefined ? undefined : JSON.stringify(rest.allergies),
      medicalConditions: rest.medicalConditions === undefined ? undefined : JSON.stringify(rest.medicalConditions),
      currentMedications: rest.currentMedications === undefined ? undefined : JSON.stringify(rest.currentMedications),
    };
  }

  async create(patient: PatientEntity): Promise<PatientEntity> {
    const created = await this.prisma.patient.create({
      data: this.serializeForPrisma(patient) as any,
    });
    return new PatientEntity(this.mapPrismaToEntity(created));
  }

  async findById(id: string): Promise<PatientEntity | null> {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) return null;

    return new PatientEntity(this.mapPrismaToEntity(patient));
  }

  async findByClinicAndEmail(
    clinicId: string,
    email: string,
  ): Promise<PatientEntity | null> {
    const patient = await this.prisma.patient.findFirst({
      where: {
        clinicId,
        email,
      },
    });

    if (!patient) return null;

    return new PatientEntity(this.mapPrismaToEntity(patient));
  }

  async findByClinic(
    clinicId: string,
    skip = 0,
    take = 10,
  ): Promise<PatientEntity[]> {
    const patients = await this.prisma.patient.findMany({
      where: { clinicId, isActive: true },
      skip,
      take,
    });

    return patients.map((p) => new PatientEntity(this.mapPrismaToEntity(p)));
  }

  async findByPhone(phone: string): Promise<PatientEntity | null> {
    const patient = await this.prisma.patient.findFirst({
      where: { phone },
    });

    if (!patient) return null;

    return new PatientEntity(this.mapPrismaToEntity(patient));
  }

  async update(id: string, data: Partial<PatientEntity>): Promise<PatientEntity> {
    const updated = await this.prisma.patient.update({
      where: { id },
      data: this.serializeForPrisma(data) as any,
    });
    return new PatientEntity(this.mapPrismaToEntity(updated));
  }
}
