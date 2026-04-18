import { useState } from 'react';
import { useForm } from '@mantine/form';
import { z } from 'zod';
import { patientService } from '../../application/patient.service';
import { useClinicStore } from '../../../clinic/infrastructure/store/clinic.store';
import type { CreatePatientRequest } from '../../domain/Patient.request';

const createPatientSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  dateOfBirth: z.string().min(1, 'La fecha de nacimiento es requerida'),
  gender: z.enum(['M', 'F', 'O'], { message: 'Selecciona un género' }),
  cpf: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  medicalConditions: z.array(z.string()).optional(),
  insuranceProvider: z.string().optional(),
  notes: z.string().optional(),
});

type CreatePatientFormValues = z.infer<typeof createPatientSchema>;

export function useCreatePatient(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const selectedClinicId = useClinicStore((s) => s.selectedClinicId);

  const form = useForm<CreatePatientFormValues>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'M',
      cpf: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      emergencyContact: '',
      emergencyPhone: '',
      allergies: [],
      medicalConditions: [],
      insuranceProvider: '',
      notes: '',
    },
    validate: (values) => {
      try {
        createPatientSchema.parse(values);
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

  const handleSubmit = async (values: CreatePatientFormValues) => {
    if (!selectedClinicId) {
      setServerError('No hay clínica seleccionada');
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      const dateOfBirth =
        values.dateOfBirth && typeof values.dateOfBirth === 'object' && 'toISOString' in values.dateOfBirth
          ? (values.dateOfBirth as Date).toISOString().split('T')[0]
          : values.dateOfBirth;

      const req: CreatePatientRequest = {
        ...values,
        clinicId: selectedClinicId,
        dateOfBirth,
        allergies: values.allergies?.filter(Boolean),
        medicalConditions: values.medicalConditions?.filter(Boolean),
      };
      await patientService.create(req);
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error al crear el paciente';

      const errorMessage = Array.isArray(message) ? message.join(', ') : message;

      const errorLower = errorMessage.toLowerCase();
      if (errorLower.includes('email')) {
        form.setFieldError('email', 'Este email ya está registrado');
      } else if (errorLower.includes('cpf')) {
        form.setFieldError('cpf', 'Este CPF ya está registrado');
      } else {
        setServerError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { form, handleSubmit, isLoading, serverError };
}
