import { useState, useMemo, useEffect } from 'react';
import { useForm } from '@mantine/form';
import { z } from 'zod';
import { appointmentService } from '../../application/appointment.service';
import { checkAppointmentAvailability } from '../../infrastructure/api/appointment.api';
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
) {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>({
    available: null,
    loading: false,
  });
  const selectedClinicId = clinicId || useClinicStore((s) => s.selectedClinicId);

  const form = useForm<CreateAppointmentFormValues>({
    initialValues: {
      patientId: '',
      dentistId: '',
      serviceId: '',
      date: new Date(),
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
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + selectedService.duration);

    return String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
  }, [selectedService, form.values.startTime]);

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
        const startDateTime = new Date(form.values.date);
        startDateTime.setHours(hours, minutes, 0, 0);

        const [endHours, endMinutes] = endTime.split(':').map(Number);
        const endDateTime = new Date(form.values.date);
        endDateTime.setHours(endHours, endMinutes, 0, 0);

        const result = await checkAppointmentAvailability(
          selectedClinicId,
          form.values.dentistId,
          form.values.serviceId,
          startDateTime.toISOString(),
          endDateTime.toISOString(),
        );

        setAvailabilityStatus({
          available: result.available,
          loading: false,
          reason: result.reason,
        });
      } catch (error) {
        setAvailabilityStatus({
          available: false,
          loading: false,
          reason: 'Error al verificar disponibilidad',
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
      const startDateTime = new Date(values.date);
      startDateTime.setHours(hours, minutes, 0, 0);

      const [endHours, endMinutes] = endTime.split(':').map(Number);
      const endDateTime = new Date(values.date);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      const req: CreateAppointmentRequest = {
        clinicId: selectedClinicId,
        patientId: values.patientId,
        dentistId: values.dentistId,
        serviceId: values.serviceId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        notes: values.notes || undefined,
      };

      await appointmentService.create(req);
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
