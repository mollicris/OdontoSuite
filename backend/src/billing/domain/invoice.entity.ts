export class InvoiceEntity {
  id!: string;
  clinicId?: string;
  patientId!: string;
  invoiceNumber!: string;
  date!: Date;
  dueDate!: Date;
  status!: string; // PENDING, PAID, OVERDUE, CANCELLED
  totalAmount!: number;
  paidAmount!: number;
  notes?: string;
  createdAt!: Date;
  updatedAt!: Date;

  // Relations
  items?: any[];
  payments?: any[];
  patient?: any;

  constructor(data: Partial<InvoiceEntity>) {
    Object.assign(this, data);
  }

  getRemainingAmount(): number {
    return this.totalAmount - this.paidAmount;
  }

  isFullyPaid(): boolean {
    return this.paidAmount >= this.totalAmount;
  }
}
