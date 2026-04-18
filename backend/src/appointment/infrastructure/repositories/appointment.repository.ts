import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import {
  AppointmentEntity,
  AppointmentStatus,
} from '../../domain/appointment.entity';

@Injectable()
export class AppointmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapPrismaToEntity(
    data: any,
  ): Partial<AppointmentEntity> {
    return {
      ...data,
      notes: data.notes || undefined,
      cancelReason: data.cancelReason || undefined,
    };
  }

  async create(
    appointment: AppointmentEntity,
  ): Promise<AppointmentEntity & { patient: any; dentist: any; service: any }> {
    console.log('💾 AppointmentRepository.create - Input:', {
      clinicId: appointment.clinicId,
      patientId: appointment.patientId,
      dentistId: appointment.dentistId,
      serviceId: appointment.serviceId,
      status: appointment.status,
    });

    const created = await this.prisma.appointment.create({
      data: {
        clinicId: appointment.clinicId,
        patientId: appointment.patientId,
        dentistId: appointment.dentistId,
        serviceId: appointment.serviceId,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        notes: appointment.notes,
      },
      include: {
        patient: true,
        dentist: true,
        service: true,
      },
    });

    console.log('✅ AppointmentRepository.create - Success:', created.id);
    return new AppointmentEntity(this.mapPrismaToEntity(created)) as any;
  }

  async findById(
    id: string,
  ): Promise<(AppointmentEntity & { patient: any; dentist: any; service: any }) | null> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        dentist: true,
        service: true,
      },
    });

    return appointment
      ? (new AppointmentEntity(this.mapPrismaToEntity(appointment)) as any)
      : null;
  }

  async findByClinic(
    clinicId: string,
    startDate?: Date,
    endDate?: Date,
    status?: AppointmentStatus,
    skip = 0,
    take = 10,
  ): Promise<(AppointmentEntity & { patient: any; dentist: any; service: any })[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        clinicId,
        ...(startDate &&
          endDate && {
            startTime: {
              gte: startDate,
              lte: endDate,
            },
          }),
        ...(status && { status }),
      },
      include: {
        patient: true,
        dentist: true,
        service: true,
      },
      orderBy: { startTime: 'asc' },
      skip,
      take,
    });

    return appointments.map((a) => new AppointmentEntity(this.mapPrismaToEntity(a)) as any);
  }

  async findByClinicAndDate(
    clinicId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<(AppointmentEntity & { patient: any; dentist: any; service: any })[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        clinicId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.IN_PROGRESS],
        },
      },
      include: {
        patient: true,
        dentist: true,
        service: true,
      },
      orderBy: { startTime: 'asc' },
    });

    return appointments.map((a) => new AppointmentEntity(this.mapPrismaToEntity(a)) as any);
  }

  async findByPatient(
    patientId: string,
    skip = 0,
    take = 10,
  ): Promise<(AppointmentEntity & { patient: any; dentist: any; service: any })[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { patientId },
      include: {
        patient: true,
        dentist: true,
        service: true,
      },
      skip,
      take,
      orderBy: { startTime: 'desc' },
    });

    return appointments.map((a) => new AppointmentEntity(this.mapPrismaToEntity(a)) as any);
  }

  async update(
    id: string,
    data: Partial<AppointmentEntity>,
  ): Promise<AppointmentEntity & { patient: any; dentist: any; service: any }> {
    const updateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
        updateData[key] = value;
      }
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: true,
        dentist: true,
        service: true,
      },
    });

    return new AppointmentEntity(this.mapPrismaToEntity(updated)) as any;
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
    cancelReason?: string,
  ): Promise<AppointmentEntity & { patient: any; dentist: any; service: any }> {
    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status,
        ...(cancelReason && { cancelReason }),
      },
      include: {
        patient: true,
        dentist: true,
        service: true,
      },
    });

    return new AppointmentEntity(this.mapPrismaToEntity(updated)) as any;
  }
}
