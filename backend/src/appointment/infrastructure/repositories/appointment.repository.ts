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

  async create(appointment: AppointmentEntity): Promise<AppointmentEntity> {
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
    });

    return new AppointmentEntity(this.mapPrismaToEntity(created));
  }

  async findById(id: string): Promise<AppointmentEntity | null> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    return appointment ? new AppointmentEntity(this.mapPrismaToEntity(appointment)) : null;
  }

  async findByClinicAndDate(
    clinicId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AppointmentEntity[]> {
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
      orderBy: { startTime: 'asc' },
    });

    return appointments.map((a) => new AppointmentEntity(this.mapPrismaToEntity(a)));
  }

  async findByPatient(
    patientId: string,
    skip = 0,
    take = 10,
  ): Promise<AppointmentEntity[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { patientId },
      skip,
      take,
      orderBy: { startTime: 'desc' },
    });

    return appointments.map((a) => new AppointmentEntity(this.mapPrismaToEntity(a)));
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
    cancelReason?: string,
  ): Promise<AppointmentEntity> {
    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status,
        ...(cancelReason && { cancelReason }),
      },
    });

    return new AppointmentEntity(this.mapPrismaToEntity(updated));
  }
}
