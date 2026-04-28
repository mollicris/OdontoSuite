export class InvoiceItemEntity {
  id!: string;
  invoiceId!: string;
  description!: string;
  quantity!: number;
  unitPrice!: number;
  total!: number;

  constructor(data: Partial<InvoiceItemEntity>) {
    Object.assign(this, data);
  }
}
