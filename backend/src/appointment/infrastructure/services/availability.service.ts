import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { IAvailabilityService } from '../interfaces/availability-service.interface';

@Injectable()
export class AvailabilityService implements IAvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailableSlots(
    clinicId: string,
    date: string, // YYYY-MM-DD
    dentistId: string,
    serviceDurationMinutes: number = 30,
  ): Promise<string[]> {
    console.log(`📅 [Availability] Buscando slots para ${date} en clínica ${clinicId} con dentista ${dentistId}`);

    try {
      // 1. Obtener horario de la clínica para ese día de la semana
      const dateObj = new Date(`${date}T00:00:00`);
      const dayOfWeek = dateObj.getDay();

      const clinicSchedule = await this.prisma.schedule.findUnique({
        where: {
          clinicId_dayOfWeek: {
            clinicId,
            dayOfWeek,
          },
        },
      });

      if (!clinicSchedule || !clinicSchedule.isActive) {
        console.log(`⚠️ [Availability] Clínica cerrada el ${date} (${dayOfWeek})`);
        return [];
      }

      console.log(`✅ [Availability] Horario clínica: ${clinicSchedule.startTime} - ${clinicSchedule.endTime}`);

      // 2. Obtener citas existentes del dentista para ese día
      const startOfDay = new Date(`${date}T00:00:00`);
      const endOfDay = new Date(`${date}T23:59:59`);

      const existingAppointments = await this.prisma.appointment.findMany({
        where: {
          clinicId,
          dentistId,
          startTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        },
        select: {
          startTime: true,
          endTime: true,
        },
      });

      console.log(`📋 [Availability] Citas existentes: ${existingAppointments.length}`);

      // 3. Generar slots disponibles
      const slots = this.generateAvailableSlots(
        clinicSchedule.startTime,
        clinicSchedule.endTime,
        existingAppointments,
        serviceDurationMinutes,
      );

      console.log(`✅ [Availability] Slots disponibles: ${slots.length}`);
      return slots;
    } catch (err: any) {
      console.error(`❌ [Availability] Error obteniendo slots:`, err.message);
      throw err;
    }
  }

  private generateAvailableSlots(
    startTimeStr: string, // HH:mm
    endTimeStr: string, // HH:mm
    occupiedSlots: Array<{ startTime: Date; endTime: Date }>,
    durationMinutes: number,
  ): string[] {
    const slots: string[] = [];
    const [startHour, startMin] = startTimeStr.split(':').map(Number);
    const [endHour, endMin] = endTimeStr.split(':').map(Number);

    // Convertir horarios a minutos desde medianoche
    const clinicStartMinutes = startHour * 60 + startMin;
    const clinicEndMinutes = endHour * 60 + endMin;

    // Convertir citas existentes a minutos
    const occupiedMinutes = occupiedSlots.map(slot => ({
      start: (slot.startTime.getHours() * 60 + slot.startTime.getMinutes()),
      end: (slot.endTime.getHours() * 60 + slot.endTime.getMinutes()),
    }));

    // Generar slots de 30 min
    for (let minutes = clinicStartMinutes; minutes < clinicEndMinutes; minutes += 30) {
      const slotEnd = minutes + durationMinutes;

      // Verificar que el slot no se salga del horario de la clínica
      if (slotEnd > clinicEndMinutes) break;

      // Verificar que no colisione con citas existentes
      const isOccupied = occupiedMinutes.some(
        occupied => minutes < occupied.end && slotEnd > occupied.start,
      );

      if (!isOccupied) {
        const hour = Math.floor(minutes / 60);
        const min = minutes % 60;
        const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }

    return slots;
  }
}
