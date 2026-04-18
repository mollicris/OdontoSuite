import { z } from 'zod';

export const createTreatmentSchema = z.object({
  patientId: z.string().min(1, 'Selecciona un paciente'),
  serviceId: z.string().min(1, 'Selecciona un servicio'),
  performedBy: z.string().min(1, 'Selecciona un dentista'),
  diagnosis: z.string().min(3, 'El diagnóstico debe tener al menos 3 caracteres'),
  treatment: z.string().min(3, 'El tratamiento debe tener al menos 3 caracteres'),
  cost: z.number().min(0, 'El costo no puede ser negativo'),
  scheduledDate: z.string().min(1, 'Selecciona una fecha programada'),
  appointmentId: z.string().optional(),
  notes: z.string().optional(),
  observations: z.string().optional(),
  completedDate: z.string().optional(),
});

export const updateTreatmentSchema = z.object({
  diagnosis: z.string().min(3, 'El diagnóstico debe tener al menos 3 caracteres').optional(),
  treatment: z.string().min(3, 'El tratamiento debe tener al menos 3 caracteres').optional(),
  cost: z.number().min(0, 'El costo no puede ser negativo').optional(),
  scheduledDate: z.string().optional(),
  notes: z.string().optional(),
  observations: z.string().optional(),
  completedDate: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

export type CreateTreatmentFormData = z.infer<typeof createTreatmentSchema>;
export type UpdateTreatmentFormData = z.infer<typeof updateTreatmentSchema>;
