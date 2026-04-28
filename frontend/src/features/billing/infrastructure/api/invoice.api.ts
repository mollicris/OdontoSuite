import { httpClient } from '../../../../core/api/httpClient';
import type {
  CreateInvoiceRequest,
  AddPaymentRequest,
  ListInvoicesRequest,
} from '../../domain/Invoice.request';
import type { Invoice } from '../../domain/Invoice.types';
import type { InvoiceListApiResponse, InvoiceApiResponse } from '../../domain/Invoice.response';

export async function createInvoice(req: CreateInvoiceRequest): Promise<Invoice> {
  const res = await httpClient.post<InvoiceApiResponse>('/billing/invoices', req);
  return res.data.data;
}

export async function listInvoices(req: ListInvoicesRequest): Promise<Invoice[]> {
  const res = await httpClient.get<InvoiceListApiResponse>('/billing/invoices', {
    params: {
      patientId: req.patientId,
      status: req.status,
      clinicId: req.clinicId,
      skip: req.skip ?? 0,
      take: req.take ?? 10,
    },
  });
  return res.data.data;
}

export async function getInvoice(id: string): Promise<Invoice> {
  const res = await httpClient.get<InvoiceApiResponse>(`/billing/invoices/${id}`);
  return res.data.data;
}

export async function addPayment(invoiceId: string, req: AddPaymentRequest): Promise<Invoice> {
  const res = await httpClient.post<InvoiceApiResponse>(`/billing/invoices/${invoiceId}/payments`, req);
  return res.data.data;
}

export async function updateInvoiceStatus(invoiceId: string, status: string): Promise<Invoice> {
  const res = await httpClient.patch<InvoiceApiResponse>(`/billing/invoices/${invoiceId}/status`, {
    status,
  });
  return res.data.data;
}
