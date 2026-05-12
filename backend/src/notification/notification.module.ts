import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CommonModule } from '@common/common.module';
import { WhatsAppModule } from '@whatsapp/whatsapp.module';
import { NOTIFICATION_CHANNELS } from './infrastructure/interfaces/notification-channel.interface';
import { WhatsAppNotificationChannel } from './infrastructure/channels/whatsapp-notification.channel';
import { EmailNotificationChannel } from './infrastructure/channels/email-notification.channel';
import { RedisDedupService } from './infrastructure/services/redis-dedup.service';
import { ReminderRepository } from './infrastructure/repositories/reminder.repository';
import { SendAppointmentRemindersUseCase } from './application/use-cases/send-appointment-reminders.use-case';
import { ReminderJob } from './jobs/reminder.job';

@Module({
  imports: [CommonModule, WhatsAppModule, ScheduleModule.forRoot()],
  providers: [
    {
      provide: NOTIFICATION_CHANNELS,
      useClass: WhatsAppNotificationChannel,
      multi: true,
    } as any,
    {
      provide: NOTIFICATION_CHANNELS,
      useClass: EmailNotificationChannel,
      multi: true,
    } as any,
    WhatsAppNotificationChannel,
    EmailNotificationChannel,
    RedisDedupService,
    ReminderRepository,
    SendAppointmentRemindersUseCase,
    ReminderJob,
  ],
})
export class NotificationModule {}
