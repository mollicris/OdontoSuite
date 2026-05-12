import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SendAppointmentRemindersUseCase } from '../application/use-cases/send-appointment-reminders.use-case';

@Injectable()
export class ReminderJob {
  private readonly logger = new Logger(ReminderJob.name);

  constructor(
    private readonly sendRemindersUseCase: SendAppointmentRemindersUseCase,
  ) {}

  @Cron('*/5 * * * *', { name: 'appointment-reminders' })
  async handleReminders(): Promise<void> {
    this.logger.log('[ReminderJob] Iniciando ciclo de recordatorios');

    await Promise.allSettled([
      this.sendRemindersUseCase.execute(24),
      this.sendRemindersUseCase.execute(1),
    ]);

    this.logger.log('[ReminderJob] Ciclo completado');
  }
}
