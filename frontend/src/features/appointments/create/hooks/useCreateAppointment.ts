import { useState, useMemo, useEffect } from 'react';
import { useForm } from '@mantine/form';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { format, getDate, getMonth, getYear, addMinutes } from 'date-fns';
import { appointmentService } from '../../application/appointment.service';
import { checkAppointmentAvailability } from '../../infrastructure/api/appointment.api';
import { getTodayDate } from '../../infrastructure/utils/dateUtils';
import { useClinicStore } from '../../../clinic/infrastructure/store/clinic.store';
import type { CreateAppointmentRequest } from '../../domain/Appointment.request';

const createAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Selecciona un paciente'),
  dentistId: z.string().min(1, 'Selecciona un dentista'),
  serviceId: z.string().min(1, 'Selecciona un servicio'),
  date: z.date({ message: 'La fecha es requerida' }),
  startTime: z.string().min(1, 'La hora de inicio es requerida'),
  notes: z.string().optional(),
});

type CreateAppointmentFormValues = z.infer<typeof createAppointmentSchema>;

interface Service {
  id: string;
  name: string;
  duration: number;
}

interface AvailabilityStatus {
  available: boolean | null;
  loading: boolean;
  reason?: string;
}

export function useCreateAppointment(
  services: Service[] = [],
  clinicId: string,
  onSuccess?: () => void,
  initialDate?: Date,
  patientId?: string,
) {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>({
    available: null,
    loading: false,
  });
  const storedClinicId = useClinicStore((s) => s.selectedClinicId);
  const selectedClinicId = clinicId || storedClinicId;
  const queryClient = useQueryClient();

  const form = useForm<CreateAppointmentFormValues>({
    initialValues: {
      patientId: patientId || '',
      dentistId: '',
      serviceId: '',
      date: initialDate || getTodayDate(),
      startTime: '09:00',
      notes: '',
    },
    validate: (values) => {
      try {
        createAppointmentSchema.parse(values);
        return {};
      } catch (error: any) {
        const fieldErrors: Record<string, string> = {};
        if (error.errors && Array.isArray(error.errors)) {
          error.errors.forEach((err: any) => {
            if (err.path && err.path.length > 0) {
              fieldErrors[err.path[0]] = err.message;
            }
          });
        }
        return fieldErrors;
      }
    },
  });

  const selectedService = useMemo(
    () => services.find((s) => s.id === form.values.serviceId),
    [form.values.serviceId, services],
  );

  const endTime = useMemo(() => {
    if (!selectedService || !form.values.startTime) return '';

    const [hours, minutes] = form.values.startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    // Use date-fns to add minutes safely
    const endDate = addMinutes(startDate, selectedService.duration);

    return format(endDate, 'HH:mm');
  }, [selectedService, form.values.startTime]);

  useEffect(() => {
    if (initialDate) {
      form.setFieldValue('date', initialDate);
    }
  }, [initialDate]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (
        !selectedClinicId ||
        !form.values.dentistId ||
        !form.values.serviceId ||
        !form.values.startTime ||
        !endTime
      ) {
        setAvailabilityStatus({ available: null, loading: false });
        return;
      }

      setAvailabilityStatus({ available: null, loading: true });

      try {
        const [hours, minutes] = form.values.startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        // Ensure date is a Date object and has hours set to 0
        const dateObj = form.values.date instanceof Date ? form.values.date : new Date(form.values.date as any);
        dateObj.setHours(0, 0, 0, 0);

        // Use date-fns to format the date correctly without timezone issues
        const year = getYear(dateObj);
        const month = String(getMonth(dateObj) + 1).padStart(2, '0');
        const day = String(getDate(dateObj)).padStart(2, '0');

        // Enviar sin Z para que el backend las interprete como La Paz local time
        const startTimeStr = `${year}-${month}-${day}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
        const endTimeStr = `${year}-${month}-${day}T${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`;

        const result = await checkAppointmentAvailability(
          selectedClinicId,
          form.values.dentistId,
          form.values.serviceId,
          startTimeStr,
          endTimeStr,
        );

        setAvailabilityStatus({
          available: result.available,
          loading: false,
          reason: result.reason,
        });
      } catch (error: any) {
        console.error('Availability check error:', error);
        const errorMessage = error?.response?.data?.message || error?.message || 'Error al verificar disponibilidad';
        setAvailabilityStatus({
          available: false,
          loading: false,
          reason: errorMessage,
        });
      }
    };

    checkAvailability();
  }, [
    selectedClinicId,
    form.values.dentistId,
    form.values.serviceId,
    form.values.startTime,
    form.values.date,
    endTime,
  ]);

  const handleSubmit = async (values: CreateAppointmentFormValues) => {
    if (!selectedClinicId) {
      setServerError('No hay clínica seleccionada');
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      const [hours, minutes] = values.startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      // Ensure date is a Date object and has hours set to 0
      const dateObj = values.date instanceof Date ? values.date : new Date(values.date as any);
      dateObj.setHours(0, 0, 0, 0);

      // Use date-fns to format the date correctly without timezone issues
      const year = getYear(dateObj);
      const month = String(getMonth(dateObj) + 1).padStart(2, '0');
      const day = String(getDate(dateObj)).padStart(2, '0');

      const startTimeStr = `${year}-${month}-${day}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
      const endTimeStr = `${year}-${month}-${day}T${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`;

      const req: CreateAppointmentRequest = {
        clinicId: selectedClinicId,
        patientId: values.patientId,
        dentistId: values.dentistId,
        serviceId: values.serviceId,
        startTime: startTimeStr,
        endTime: endTimeStr,
        notes: values.notes || undefined,
      };

      await appointmentService.create(req);
      // Invalidate appointments list to refresh it
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error al crear la cita';

      const errorMessage = Array.isArray(message) ? message.join(', ') : message;
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { form, handleSubmit, isLoading, serverError, endTime, availabilityStatus };
}
