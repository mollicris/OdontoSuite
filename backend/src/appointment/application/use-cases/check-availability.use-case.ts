import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';

export interface CheckAvailabilityInput {
  clinicId: string;
  dentistId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
}

export interface AvailabilityResponse {
  available: boolean;
  reason?: string;
}

@Injectable()
export class CheckAppointmentAvailabilityUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CheckAvailabilityInput): Promise<AvailabilityResponse> {
    const startTime = new Date(input.startTime);
    const endTime = new Date(input.endTime);

    // Verify clinic exists
    const clinic = await this.prisma.clinic.findUnique({
      where: { id: input.clinicId },
    });
    if (!clinic) {
      return { available: false, reason: 'Clínica no encontrada' };
    }

    // Verify dentist exists and is active
    const dentist = await this.prisma.user.findUnique({
      where: { id: input.dentistId },
    });
    if (!dentist?.isActive) {
      return { available: false, reason: 'Dentista no disponible' };
    }

    // Verify service exists
    const service = await this.prisma.service.findUnique({
      where: { id: input.serviceId },
    });
    if (!service?.isActive) {
      return { available: false, reason: 'Servicio no disponible' };
    }

    // Check clinic schedule (if exists)
    const dayOfWeek = startTime.getDay();
    const schedule = await this.prisma.schedule.findFirst({
      where: {
        clinicId: input.clinicId,
        dayOfWeek: dayOfWeek,
        isActive: true,
      },
    });

    if (schedule) {
      const scheduleStart = schedule.startTime; // HH:mm format
      const scheduleEnd = schedule.endTime;
      const appointmentStart = startTime.toLocaleTimeString('es-BO', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const appointmentEnd = endTime.toLocaleTimeString('es-BO', {
        hour: '2-digit',
        minute: '2-digit',
      });

      if (appointmentStart < scheduleStart || appointmentEnd > scheduleEnd) {
        return {
          available: false,
          reason: `Fuera del horario de atención (${scheduleStart} - ${scheduleEnd})`,
        };
      }
    }

    // Check for overlapping appointments with same dentist
    const overlappingAppointments = await this.prisma.appointment.findMany({
      where: {
        dentistId: input.dentistId,
        clinicId: input.clinicId,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        startTime: {
          lt: endTime,
        },
        endTime: {
          gt: startTime,
        },
      },
    });

    if (overlappingAppointments.length > 0) {
      return {
        available: false,
        reason: 'El dentista tiene otra cita en este horario',
      };
    }

    return { available: true };
  }
}
