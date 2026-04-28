import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { InvoiceResponseDto } from '../dtos/invoice-response.dto';

@Injectable()
export class GetInvoiceUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: true,
        items: true,
        payments: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }

    return this.mapToDto(invoice);
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
