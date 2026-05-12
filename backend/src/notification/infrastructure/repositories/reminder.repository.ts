import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';

export interface AppointmentWithRelations {
  id: string;
  startTime: Date;
  patient: { firstName: string; lastName: string; phone: string; email: string };
  dentist: { firstName: string; lastName: string };
  service: { name: string };
  clinic: { name: string };
}

@Injectable()
export class ReminderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findScheduledInWindow(
    windowStart: Date,
    windowEnd: Date,
  ): Promise<AppointmentWithRelations[]> {
    return this.prisma.appointment.findMany({
      where: {
        status: 'SCHEDULED',
        startTime: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      select: {
        id: true,
        startTime: true,
        patient: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        dentist: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        service: {
          select: { name: true },
        },
        clinic: {
          select: { name: true },
        },
      },
    });
  }
}
