import * as invoiceApi from '../infrastructure/api/invoice.api';
import type {
  CreateInvoiceRequest,
  AddPaymentRequest,
  ListInvoicesRequest,
} from '../domain/Invoice.request';

export const invoiceService = {
  async create(req: CreateInvoiceRequest) {
    return invoiceApi.createInvoice(req);
  },

  async list(req: ListInvoicesRequest) {
    return invoiceApi.listInvoices(req);
  },

  async getById(id: string) {
    return invoiceApi.getInvoice(id);
  },

  async addPayment(invoiceId: string, req: AddPaymentRequest) {
    return invoiceApi.addPayment(invoiceId, req);
  },

  async updateStatus(invoiceId: string, status: string) {
    return invoiceApi.updateInvoiceStatus(invoiceId, status);
  },
};
