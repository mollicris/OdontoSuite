import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { PatientEntity } from '../../domain/patient.entity';

@Injectable()
export class PatientRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapPrismaToEntity(
    data: any,
  ): Partial<PatientEntity> {
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
      medicalConditions: data.medicalConditions
        ? JSON.parse(data.medicalConditions)
        : undefined,
      insuranceProvider: data.insuranceProvider || undefined,
      insurancePolicyNo: data.insurancePolicyNo || undefined,
      currentMedications: data.currentMedications
        ? JSON.parse(data.currentMedications)
        : undefined,
      notes: data.notes || undefined,
    };
  }

  async create(patient: PatientEntity): Promise<PatientEntity> {
    const created = await this.prisma.patient.create({
      data: {
        clinicId: patient.clinicId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        cpf: patient.cpf,
        address: patient.address,
        city: patient.city,
        state: patient.state,
        zipCode: patient.zipCode,
        emergencyContact: patient.emergencyContact,
        emergencyPhone: patient.emergencyPhone,
        allergies: JSON.stringify(patient.allergies || []),
        medicalConditions: JSON.stringify(
          patient.medicalConditions || [],
        ),
        insuranceProvider: patient.insuranceProvider,
        notes: patient.notes,
        isActive: patient.isActive,
      },
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

  async update(id: string, data: Partial<PatientEntity>): Promise<PatientEntity> {
    const updateData = { ...data };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const updated = await this.prisma.patient.update({
      where: { id },
      data: updateData as any,
    });

    return new PatientEntity(this.mapPrismaToEntity(updated));
  }
}
