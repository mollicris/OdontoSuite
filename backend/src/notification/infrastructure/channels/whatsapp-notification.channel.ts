import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  INotificationChannel,
  ReminderNotificationPayload,
} from '../interfaces/notification-channel.interface';
import {
  IWhatsAppApiService,
  WHATSAPP_API_SERVICE,
} from '@whatsapp/infrastructure/interfaces/whatsapp-api.interface';

@Injectable()
export class WhatsAppNotificationChannel implements INotificationChannel {
  readonly channelName = 'whatsapp';
  private readonly logger = new Logger(WhatsAppNotificationChannel.name);

  constructor(
    @Inject(WHATSAPP_API_SERVICE)
    private readonly whatsapp: IWhatsAppApiService,
  ) {}

  async send(payload: ReminderNotificationPayload): Promise<void> {
    const timeStr = payload.startTimeLocal.toLocaleTimeString('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const dateStr = payload.startTimeLocal.toLocaleDateString('es-BO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    const message =
      payload.hoursUntil >= 24
        ? `Hola ${payload.patientName}, le recordamos su cita de *${payload.serviceName}* mañana ${dateStr} a las *${timeStr}* con ${payload.dentistName}. Por favor confirme o llame si necesita reagendar.`
        : `Recordatorio: su cita de *${payload.serviceName}* es HOY a las *${timeStr}* con ${payload.dentistName}. Le esperamos en ${payload.clinicName}.`;

    const msgId = await this.whatsapp.sendMessage(payload.patientPhone, message);

    if (!msgId) {
      throw new Error(`WhatsApp API retornó null para ${payload.patientPhone}`);
    }

    this.logger.log(
      `[WhatsApp] Recordatorio enviado a ${payload.patientPhone}, msgId=${msgId}`,
    );
  }
}
