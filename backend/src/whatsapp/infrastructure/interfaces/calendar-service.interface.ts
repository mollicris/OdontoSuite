export interface AvailableSlot {
  time: string; // 'HH:MM'
}

export interface ICalendarService {
  getAvailableSlots(date: string, calendarId?: string): Promise<string[]>;
  createAppointmentEvent(params: {
    patientName: string;
    specialty: string;
    date: string;
    time: string;
    calendarId?: string;
  }): Promise<string>; // returns Google event ID
  cancelAppointmentEvent(eventId: string, calendarId?: string): Promise<void>;
}

export const CALENDAR_SERVICE = Symbol('ICalendarService');
