export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class AppointmentEntity {
  id!: string;
  clinicId!: string;
  patientId!: string;
  dentistId!: string;
  serviceId!: string;
  startTime!: Date;
  endTime!: Date;
  status!: AppointmentStatus;
  notes?: string;
  cancelReason?: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<AppointmentEntity>) {
    Object.assign(this, data);
  }

  isUpcoming(): boolean {
    return this.startTime > new Date();
  }

  isPassed(): boolean {
    return this.endTime < new Date();
  }

  canBeCancelled(): boolean {
    return (
      this.status === AppointmentStatus.SCHEDULED &&
      this.isUpcoming()
    );
  }

  getDuration(): number {
    return (
      (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60)
    );
  }
}
