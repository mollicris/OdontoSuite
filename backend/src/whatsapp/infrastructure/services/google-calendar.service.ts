import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { ICalendarService } from '../interfaces/calendar-service.interface';

@Injectable()
export class GoogleCalendarService implements ICalendarService {
  private readonly calendar;
  private readonly oauth2Client;

  constructor(private readonly config: ConfigService) {
    this.oauth2Client = new google.auth.OAuth2(
      this.config.get('GOOGLE_CLIENT_ID'),
      this.config.get('GOOGLE_CLIENT_SECRET'),
      this.config.get('GOOGLE_REDIRECT_URI'),
    );

    const accessToken = this.config.get('GOOGLE_ACCESS_TOKEN');
    const refreshToken = this.config.get('GOOGLE_REFRESH_TOKEN');
    if (accessToken && refreshToken) {
      this.oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
    }

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  async getAvailableSlots(date: string, calendarId = 'primary'): Promise<string[]> {
    console.log(`📅 [GoogleCalendar] Buscando horarios disponibles para ${date}`);
    try {
      const start = new Date(`${date}T08:00:00`);
      const end = new Date(`${date}T18:00:00`);

      console.log(`🔍 [GoogleCalendar] Consultando eventos de ${start.toISOString()} a ${end.toISOString()}`);
      const { data } = await this.calendar.events.list({
        calendarId,
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const busy = (data.items || []).map((e: any) => ({
        start: new Date(e.start.dateTime || e.start.date),
        end: new Date(e.end.dateTime || e.end.date),
      }));

      console.log(`📊 [GoogleCalendar] Eventos ocupados encontrados: ${busy.length}`);

      const slots: string[] = [];
      for (let h = 8; h < 18; h++) {
        for (const m of [0, 30]) {
          const slotStart = new Date(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
          const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
          const isBusy = busy.some(b => slotStart < b.end && slotEnd > b.start);
          if (!isBusy) slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        }
      }
      console.log(`✅ [GoogleCalendar] Horarios disponibles: ${slots.length} encontrados`);
      return slots;
    } catch (err: any) {
      console.error(`❌ [GoogleCalendar] Error obteniendo horarios:`, err.message);
      throw err;
    }
  }

  async createAppointmentEvent(params: {
    patientName: string;
    specialty: string;
    date: string;
    time: string;
    calendarId?: string;
  }): Promise<string> {
    console.log(`📅 [GoogleCalendar] Creando evento para ${params.patientName} - ${params.specialty}`);
    try {
      const calendarId = params.calendarId ?? 'primary';
      const startTime = new Date(`${params.date}T${params.time}:00`);
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

      console.log(`📝 [GoogleCalendar] Evento: ${startTime.toISOString()} a ${endTime.toISOString()}`);
      const { data } = await this.calendar.events.insert({
        calendarId,
        requestBody: {
          summary: `Cita: ${params.specialty} — ${params.patientName}`,
          description: `Paciente: ${params.patientName}\nEspecialidad: ${params.specialty}`,
          start: { dateTime: startTime.toISOString() },
          end: { dateTime: endTime.toISOString() },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 1440 },
              { method: 'popup', minutes: 30 },
            ],
          },
        },
      });

      console.log(`✅ [GoogleCalendar] Evento creado con ID: ${data.id}`);
      return data.id!;
    } catch (err: any) {
      console.error(`❌ [GoogleCalendar] Error creando evento:`, err.message);
      throw err;
    }
  }

  async cancelAppointmentEvent(eventId: string, calendarId = 'primary'): Promise<void> {
    await this.calendar.events.delete({ calendarId, eventId });
  }
}
