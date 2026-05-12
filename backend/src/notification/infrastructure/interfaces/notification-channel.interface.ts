export interface ReminderNotificationPayload {
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  dentistName: string;
  serviceName: string;
  startTimeLocal: Date;
  clinicName: string;
  hoursUntil: number;
}

export interface INotificationChannel {
  readonly channelName: string;
  send(payload: ReminderNotificationPayload): Promise<void>;
}

export const NOTIFICATION_CHANNELS = Symbol('INotificationChannel[]');
