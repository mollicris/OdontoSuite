import {
  createAppointment,
  getAppointmentById,
  listAppointments,
  updateAppointment,
  cancelAppointment,
} from '../infrastructure/api/appointment.api';
import type {
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  ListAppointmentsRequest,
} from '../domain/Appointment.request';
import type { Appointment } from '../domain/Appointment.types';

export const appointmentService = {
  async create(req: CreateAppointmentRequest): Promise<Appointment> {
    return createAppointment(req);
  },

  async getById(id: string): Promise<Appointment> {
    return getAppointmentById(id);
  },

  async list(req: ListAppointmentsRequest): Promise<Appointment[]> {
    return listAppointments(req);
  },

  async update(id: string, req: UpdateAppointmentRequest): Promise<Appointment> {
    return updateAppointment(id, req);
  },

  async cancel(id: string, cancelReason?: string): Promise<Appointment> {
    return cancelAppointment(id, cancelReason);
  },
};
