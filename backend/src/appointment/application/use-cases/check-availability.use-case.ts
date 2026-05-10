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
    // Times from frontend are sent as "YYYY-MM-DDTHH:mm:ss" representing La Paz local time
    // Extract time components directly from the string
    const startMatch = input.startTime.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    const endMatch = input.endTime.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);

    if (!startMatch || !endMatch) {
      return { available: false, reason: 'Formato de fecha inválido' };
    }

    const startYear = parseInt(startMatch[1], 10);
    const startMonth = parseInt(startMatch[2], 10);
    const startDay = parseInt(startMatch[3], 10);
    const startHour = parseInt(startMatch[4], 10);
    const startMin = parseInt(startMatch[5], 10);

    const endYear = parseInt(endMatch[1], 10);
    const endMonth = parseInt(endMatch[2], 10);
    const endDay = parseInt(endMatch[3], 10);
    const endHour = parseInt(endMatch[4], 10);
    const endMin = parseInt(endMatch[5], 10);

    // Frontend sends times in La Paz timezone (UTC-4)
    // Convert to UTC by adding 4 hours for database comparison
    const startTime = new Date(Date.UTC(startYear, startMonth - 1, startDay, startHour + 4, startMin, 0));
    const endTime = new Date(Date.UTC(endYear, endMonth - 1, endDay, endHour + 4, endMin, 0));

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
    const schedule = await this.prisma.schedule.findFirst({
      where: {
        clinicId: input.clinicId,
        dayOfWeek: new Date(startYear, startMonth - 1, startDay).getDay(),
        isActive: true,
      },
    });

    if (schedule) {
      const scheduleStart = schedule.startTime; // HH:mm format
      const scheduleEnd = schedule.endTime;
      const appointmentStart = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
      const appointmentEnd = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

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
