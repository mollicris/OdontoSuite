export class TreatmentEntity {
  id!: string;
  patientId!: string;
  appointmentId?: string;
  serviceId!: string;
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
  scheduledDate!: Date;
  completedDate?: Date;
  status!: string;
  createdAt!: Date;
  updatedAt!: Date;

  // Optional relations for UI
  patient?: any;
  service?: any;
  dentist?: any;

  constructor(data: any) {
    Object.assign(this, data);
  }
}
