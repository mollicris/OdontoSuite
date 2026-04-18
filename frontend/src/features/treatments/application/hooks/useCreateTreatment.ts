import { useCallback, useState } from 'react';
import { useForm } from '@mantine/form';
import { useTreatmentMutations } from './useTreatmentMutations';
import type { CreateTreatmentRequest } from '../../domain/Treatment.request';

interface MockService {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface UseCreateTreatmentProps {
  services: MockService[];
  onSuccess?: () => void;
  patientId?: string;
}

interface FormValues {
  patientId: string;
  serviceId: string;
  performedBy: string;
  diagnosis: string;
  treatment: string;
  cost: number;
  scheduledDate: Date | null;
  appointmentId: string;
  notes: string;
  observations: string;
  completedDate: Date | null;
}

export function useCreateTreatment({ services, onSuccess, patientId }: UseCreateTreatmentProps) {
  const { create, createLoading } = useTreatmentMutations(patientId);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    initialValues: {
      patientId: patientId || '',
      serviceId: '',
      performedBy: '',
      diagnosis: '',
      treatment: '',
      cost: 0,
      scheduledDate: null,
      appointmentId: '',
      notes: '',
      observations: '',
      completedDate: null,
    },
    validate: (values) => {
      const errors: Record<string, string> = {};

      if (!values.patientId) errors.patientId = 'Selecciona un paciente';
      if (!values.serviceId) errors.serviceId = 'Selecciona un servicio';
      if (!values.performedBy) errors.performedBy = 'Selecciona un dentista';
      if (!values.diagnosis || values.diagnosis.trim().length < 3) {
        errors.diagnosis = 'El diagnóstico debe tener al menos 3 caracteres';
      }
      if (!values.treatment || values.treatment.trim().length < 3) {
        errors.treatment = 'El tratamiento debe tener al menos 3 caracteres';
      }
      if (!values.scheduledDate) errors.scheduledDate = 'Selecciona una fecha programada';
      if (values.cost < 0) errors.cost = 'El costo no puede ser negativo';

      return errors;
    },
  });

  const handleServiceChange = useCallback(
    (serviceId: string | null) => {
      if (!serviceId) {
        form.setFieldValue('serviceId', '');
        form.setFieldValue('cost', 0);
        return;
      }
      form.setFieldValue('serviceId', serviceId);
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        form.setFieldValue('cost', service.price);
      }
    },
    [services],
  );

  const handleSubmit = async (values: FormValues) => {
    try {
      setServerError(null);

      if (!values.scheduledDate) {
        form.setFieldError('scheduledDate', 'Selecciona una fecha programada');
        return;
      }

      const scheduledDate = values.scheduledDate instanceof Date
        ? values.scheduledDate.toISOString()
        : new Date(values.scheduledDate).toISOString();

      const completedDate = values.completedDate
        ? (values.completedDate instanceof Date
          ? values.completedDate.toISOString()
          : new Date(values.completedDate).toISOString())
        : undefined;

      const payload: CreateTreatmentRequest = {
        patientId: values.patientId,
        serviceId: values.serviceId,
        performedBy: values.performedBy,
        diagnosis: values.diagnosis,
        treatment: values.treatment,
        cost: values.cost,
        scheduledDate,
        appointmentId: values.appointmentId || undefined,
        notes: values.notes || undefined,
        observations: values.observations || undefined,
        completedDate,
      };

      await create(payload);
      form.reset();
      onSuccess?.();
    } catch (error) {
      const message = (error as any)?.response?.data?.message || (error as any)?.message || 'Error al crear tratamiento';
      setServerError(message);
    }
  };

  return {
    form,
    handleSubmit,
    isLoading: createLoading,
    serverError,
    handleServiceChange,
  };
}
