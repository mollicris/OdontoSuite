import { Injectable, Inject, Logger } from '@nestjs/common';
import { ReminderRepository } from '../../infrastructure/repositories/reminder.repository';
import { RedisDedupService } from '../../infrastructure/services/redis-dedup.service';
import {
  INotificationChannel,
  NOTIFICATION_CHANNELS,
  ReminderNotificationPayload,
} from '../../infrastructure/interfaces/notification-channel.interface';

const LA_PAZ_OFFSET_MS = -4 * 60 * 60 * 1000; // UTC-4

@Injectable()
export class SendAppointmentRemindersUseCase {
  private readonly logger = new Logger(SendAppointmentRemindersUseCase.name);

  constructor(
    private readonly reminderRepository: ReminderRepository,
    private readonly dedupService: RedisDedupService,
    @Inject(NOTIFICATION_CHANNELS)
    private readonly channels: INotificationChannel[],
  ) {}

  async execute(hoursBeforeWindow: number): Promise<void> {
    const nowUtc = new Date();
    const windowStart = new Date(nowUtc.getTime() + hoursBeforeWindow * 3600_000);
    const windowEnd = new Date(windowStart.getTime() + 5 * 60_000);

    const appointments = await this.reminderRepository.findScheduledInWindow(
      windowStart,
      windowEnd,
    );

    this.logger.log(
      `[Reminder ${hoursBeforeWindow}h] Encontradas ${appointments.length} citas en ventana`,
    );

    for (const appt of appointments) {
      const dedupKey = `reminder:${appt.id}:${hoursBeforeWindow}h`;

      const alreadySent = await this.dedupService.isAlreadySent(dedupKey);
      if (alreadySent) {
        this.logger.debug(`[Reminder] Saltando ${appt.id} — ya fue enviado`);
        continue;
      }

      // Convertir a hora local de La Paz
      const startTimeLocal = new Date(appt.startTime.getTime() + LA_PAZ_OFFSET_MS);

      const payload: ReminderNotificationPayload = {
        appointmentId: appt.id,
        patientName: `${appt.patient.firstName} ${appt.patient.lastName}`,
        patientPhone: appt.patient.phone,
        patientEmail: appt.patient.email,
        dentistName: `${appt.dentist.firstName} ${appt.dentist.lastName}`,
        serviceName: appt.service.name,
        startTimeLocal,
        clinicName: appt.clinic.name,
        hoursUntil: hoursBeforeWindow,
      };

      // Enviar por todos los canales en paralelo
      const results = await Promise.allSettled(
        this.channels.map((channel) =>
          channel.send(payload).then(() => channel.channelName),
        ),
      );

      const succeeded = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
        .map((r) => r.value);

      const failed = results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map((r, i) => ({ channel: this.channels[i].channelName, reason: r.reason }));

      if (succeeded.length > 0) {
        const ttlSeconds = hoursBeforeWindow * 3600 + 3600;
        await this.dedupService.markAsSent(dedupKey, ttlSeconds);
      }

      if (failed.length > 0) {
        failed.forEach(({ channel, reason }) =>
          this.logger.error(
            `[Reminder] Canal "${channel}" falló para ${appt.id}: ${reason}`,
          ),
        );
      }

      this.logger.log(
        `[Reminder ${hoursBeforeWindow}h] ${appt.id}: OK=[${succeeded.join(',')}] FAIL=[${failed.map((f) => f.channel).join(',')}]`,
      );
    }
  }
}
