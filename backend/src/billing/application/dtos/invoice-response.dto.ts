export class InvoiceItemResponseDto {
  id!: string;
  description!: string;
  quantity!: number;
  unitPrice!: number;
  total!: number;
}

export class PaymentResponseDto {
  id!: string;
  amount!: number;
  paymentMethod!: string;
  paymentDate!: string;
  transactionId?: string;
  notes?: string;
  createdAt!: string;
}

export class InvoiceResponseDto {
  id!: string;
  invoiceNumber!: string;
  patientId!: string;
  patientName!: string;
  date!: string;
  dueDate!: string;
  status!: string;
  totalAmount!: number;
  paidAmount!: number;
  remainingAmount!: number;
  notes?: string;
  items!: InvoiceItemResponseDto[];
  payments!: PaymentResponseDto[];
  createdAt!: string;
  updatedAt!: string;
}
