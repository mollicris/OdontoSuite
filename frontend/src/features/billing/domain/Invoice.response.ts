import type { Invoice } from './Invoice.types';

export type { Invoice };

export interface InvoiceApiResponse {
  statusCode: number;
  message: string;
  data: Invoice;
  timestamp: string;
}

export interface InvoiceListApiResponse {
  statusCode: number;
  message: string;
  data: Invoice[];
  timestamp: string;
}

export interface CreateInvoiceApiResponse {
  statusCode: number;
  message: string;
  data: Invoice;
  timestamp: string;
}
