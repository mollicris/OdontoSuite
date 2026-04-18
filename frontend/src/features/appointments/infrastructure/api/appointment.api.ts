import { httpClient } from '../../../../core/api/httpClient';
import type {
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  ListAppointmentsRequest,
} from '../../domain/Appointment.request';
import type {
  AppointmentApiResponse,
  AppointmentListApiResponse,
} from '../../domain/Appointment.response';
import type { Appointment } from '../../domain/Appointment.types';

export async function createAppointment(req: CreateAppointmentRequest): Promise<Appointment> {
  const res = await httpClient.post<AppointmentApiResponse>('/appointments', req);
  return res.data.data;
}

export async function getAppointmentById(id: string): Promise<Appointment> {
  const res = await httpClient.get<AppointmentApiResponse>(`/appointments/${id}`);
  return res.data.data;
}

export async function listAppointments(req: ListAppointmentsRequest): Promise<Appointment[]> {
  const { clinicId, date, status, dentistId, skip = 0, take = 10 } = req;
  const res = await httpClient.get<AppointmentListApiResponse>('/appointments', {
    params: { clinicId, ...(date && { date }), ...(status && { status }), ...(dentistId && { dentistId }), skip, take },
  });
  return res.data.data;
}

export async function updateAppointment(
  id: string,
  req: UpdateAppointmentRequest,
): Promise<Appointment> {
  const res = await httpClient.patch<AppointmentApiResponse>(`/appointments/${id}`, req);
  return res.data.data;
}

export async function cancelAppointment(id: string, cancelReason?: string): Promise<Appointment> {
  const res = await httpClient.patch<AppointmentApiResponse>(`/appointments/${id}/cancel`, {
    ...(cancelReason && { cancelReason }),
  });
  return res.data.data;
}

export async function checkAppointmentAvailability(
  clinicId: string,
  dentistId: string,
  serviceId: string,
  startTime: string,
  endTime: string,
): Promise<{ available: boolean; reason?: string }> {
  const res = await httpClient.get<{ data: { available: boolean; reason?: string } }>(
    '/appointments/check-availability',
    {
      params: { clinicId, dentistId, serviceId, startTime, endTime },
    },
  );
  return res.data.data;
}
