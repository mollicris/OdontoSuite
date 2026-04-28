export class PaymentEntity {
  id!: string;
  invoiceId!: string;
  amount!: number;
  paymentMethod!: string; // CASH, CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER
  paymentDate!: Date;
  transactionId?: string;
  notes?: string;
  createdAt!: Date;

  constructor(data: Partial<PaymentEntity>) {
    Object.assign(this, data);
  }
}
