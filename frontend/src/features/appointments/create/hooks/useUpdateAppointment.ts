import { useState } from 'react';
import { appointmentService } from '../../application/appointment.service';
import type { Appointment, AppointmentStatus } from '../../domain/Appointment.types';
import type { UpdateAppointmentRequest } from '../../domain/Appointment.request';

export function useUpdateAppointment(appointment: Appointment | null, onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    if (!appointment) return;

    setIsLoading(true);
    setServerError(null);

    try {
      const req: UpdateAppointmentRequest = { status: newStatus };
      await appointmentService.update(appointment.id, req);
      onSuccess?.();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error al actualizar la cita';

      const errorMessage = Array.isArray(message) ? message.join(', ') : message;
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (cancelReason?: string) => {
    if (!appointment) return;

    setIsLoading(true);
    setServerError(null);

    try {
      await appointmentService.cancel(appointment.id, cancelReason);
      onSuccess?.();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error al cancelar la cita';

      const errorMessage = Array.isArray(message) ? message.join(', ') : message;
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNotes = async (notes: string) => {
    if (!appointment) return;

    setIsLoading(true);
    setServerError(null);

    try {
      const req: UpdateAppointmentRequest = { notes };
      await appointmentService.update(appointment.id, req);
      onSuccess?.();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error al actualizar la cita';

      const errorMessage = Array.isArray(message) ? message.join(', ') : message;
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    serverError,
    handleStatusChange,
    handleCancel,
    handleUpdateNotes,
  };
}
