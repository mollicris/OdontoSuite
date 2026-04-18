export class TreatmentResponseDto {
  id!: string;
  patientId!: string;
  patientName!: string;
  appointmentId?: string;
  serviceId!: string;
  serviceName!: string;
  servicePrice!: number;
  diagnosis!: string;
  treatment!: string;
  notes?: string;
  observations?: string;
  procedure?: string;
  tooth?: string;
  prescriptions?: string;
  attachments?: string;
  cost!: number;
  performedBy!: string;
  dentistName!: string;
  scheduledDate!: string;
  completedDate?: string;
  status!: string;
  createdAt!: string;
  updatedAt!: string;
}
