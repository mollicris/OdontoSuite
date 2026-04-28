import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { InvoiceResponseDto } from '../dtos/invoice-response.dto';

interface ListInvoicesFilters {
  patientId?: string;
  status?: string;
  clinicId?: string;
  skip?: number;
  take?: number;
}

@Injectable()
export class ListInvoicesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: ListInvoicesFilters): Promise<InvoiceResponseDto[]> {
    const { patientId, status, clinicId, skip = 0, take = 10 } = filters;

    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;
    if (clinicId) where.clinicId = clinicId;

    const invoices = await this.prisma.invoice.findMany({
      where,
      include: {
        patient: true,
        items: true,
        payments: true,
      },
      skip,
      take,
      orderBy: { date: 'desc' },
    });

    return invoices.map((invoice) => this.mapToDto(invoice));
  }

  private mapToDto(invoice: any): InvoiceResponseDto {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      patientId: invoice.patientId,
      patientName: invoice.patient ? invoice.patient.firstName + ' ' + invoice.patient.lastName : '',
      date: invoice.date.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      status: invoice.status,
      totalAmount: invoice.totalAmount,
      paidAmount: invoice.paidAmount,
      remainingAmount: invoice.totalAmount - invoice.paidAmount,
      notes: invoice.notes,
      items: invoice.items.map((item: any) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      payments: invoice.payments.map((payment: any) => ({
        id: payment.id,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate.toISOString(),
        transactionId: payment.transactionId,
        notes: payment.notes,
        createdAt: payment.createdAt.toISOString(),
      })),
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
    };
  }
}
