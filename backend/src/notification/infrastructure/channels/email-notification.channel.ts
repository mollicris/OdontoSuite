import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { LoggerService } from '@common/services/logger.service';
import {
  INotificationChannel,
  ReminderNotificationPayload,
} from '../interfaces/notification-channel.interface';

@Injectable()
export class EmailNotificationChannel implements INotificationChannel {
  readonly channelName = 'email';
  private readonly transporter: nodemailer.Transporter;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    const smtpUser = this.config.get<string>('SMTP_USER');
    const smtpPass = this.config.get<string>('SMTP_PASS');

    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'localhost'),
      port: this.config.get<number>('SMTP_PORT', 1025),
      secure: false,
      auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
    });
  }

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
      year: 'numeric',
    });

    const subject =
      payload.hoursUntil >= 24
        ? `Recordatorio de cita mañana — ${payload.clinicName}`
        : `Su cita es hoy a las ${timeStr} — ${payload.clinicName}`;

    const html = `
      <h2>Recordatorio de Cita Dental</h2>
      <p>Estimado/a <strong>${payload.patientName}</strong>,</p>
      <p>Le recordamos su cita:</p>
      <ul>
        <li><strong>Servicio:</strong> ${payload.serviceName}</li>
        <li><strong>Dentista:</strong> ${payload.dentistName}</li>
        <li><strong>Fecha:</strong> ${dateStr}</li>
        <li><strong>Hora:</strong> ${timeStr} (zona horaria Bolivia)</li>
        <li><strong>Clínica:</strong> ${payload.clinicName}</li>
      </ul>
      <p>Si necesita cancelar o reagendar, contáctenos.</p>
    `;

    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('SMTP_FROM', 'noreply@odontosuite.com'),
        to: payload.patientEmail,
        subject,
        html,
      });

      this.logger.logNotificationSent('EMAIL', payload.patientEmail, 'REMINDER', {
        appointmentId: payload.appointmentId,
        hoursUntil: payload.hoursUntil,
      });
    } catch (error: any) {
      this.logger.logNotificationError('EMAIL', payload.patientEmail, error, {
        appointmentId: payload.appointmentId,
        subject,
      });
      throw error;
    }
  }
}
