export interface CreateInvoiceItemRequest {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceRequest {
  patientId: string;
  clinicId?: string;
  dueDate: string;
  notes?: string;
  items: CreateInvoiceItemRequest[];
}

export interface AddPaymentRequest {
  amount: number;
  paymentMethod: string;
  paymentDate?: string;
  transactionId?: string;
  notes?: string;
}

export interface ListInvoicesRequest {
  patientId?: string;
  status?: string;
  clinicId?: string;
  skip?: number;
  take?: number;
}

export interface UpdateInvoiceStatusRequest {
  status: string;
}
