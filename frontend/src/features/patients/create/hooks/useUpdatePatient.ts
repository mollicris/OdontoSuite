import { useState } from 'react';
import { useForm } from '@mantine/form';
import { z } from 'zod';
import { patientService } from '../../application/patient.service';
import type { CreatePatientRequest } from '../../domain/Patient.request';
import type { Patient } from '../../domain/Patient.types';

const updatePatientSchema = z.object({
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

type UpdatePatientFormValues = z.infer<typeof updatePatientSchema>;

export function useUpdatePatient(patient: Patient, onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<UpdatePatientFormValues>({
    initialValues: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      cpf: patient.cpf || '',
      address: patient.address || '',
      city: patient.city || '',
      state: patient.state || '',
      zipCode: patient.zipCode || '',
      emergencyContact: patient.emergencyContact || '',
      emergencyPhone: patient.emergencyPhone || '',
      allergies: patient.allergies || [],
      medicalConditions: patient.medicalConditions || [],
      insuranceProvider: patient.insuranceProvider || '',
      notes: patient.notes || '',
    },
    validate: (values) => {
      try {
        updatePatientSchema.parse(values);
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

  const handleSubmit = async (values: UpdatePatientFormValues) => {
    setIsLoading(true);
    setServerError(null);

    try {
      // Convertir Date a YYYY-MM-DD si es necesario
      const dateOfBirth =
        values.dateOfBirth && typeof values.dateOfBirth === 'object' && 'toISOString' in values.dateOfBirth
          ? (values.dateOfBirth as Date).toISOString().split('T')[0]
          : values.dateOfBirth;

      const req: Partial<CreatePatientRequest> = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        dateOfBirth,
        gender: values.gender,
        cpf: values.cpf || undefined,
        address: values.address || undefined,
        city: values.city || undefined,
        state: values.state || undefined,
        zipCode: values.zipCode || undefined,
        emergencyContact: values.emergencyContact || undefined,
        emergencyPhone: values.emergencyPhone || undefined,
        allergies: values.allergies?.filter(Boolean),
        medicalConditions: values.medicalConditions?.filter(Boolean),
        insuranceProvider: values.insuranceProvider || undefined,
        notes: values.notes || undefined,
      };

      await patientService.update(patient.id, req);
      onSuccess?.();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error al actualizar el paciente';

      const errorMessage = Array.isArray(message) ? message.join(', ') : message;
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { form, handleSubmit, isLoading, serverError };
}
