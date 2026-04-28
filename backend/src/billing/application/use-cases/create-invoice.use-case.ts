import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { CreateInvoiceDto } from '../dtos/create-invoice.dto';
import { InvoiceResponseDto } from '../dtos/invoice-response.dto';

@Injectable()
export class CreateInvoiceUseCase {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async execute(createInvoiceDto: CreateInvoiceDto): Promise<InvoiceResponseDto> {
    const { patientId, clinicId, dueDate, notes, items } = createInvoiceDto;

    // Generate invoice number: INV-YYYY-0001
    const year = new Date().getFullYear();
    const count = await this.prisma.invoice.count({
      where: {
        date: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
    });
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    // Create invoice with items in a transaction
    const invoice = await this.prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          invoiceNumber,
          patientId,
          clinicId,
          dueDate: new Date(dueDate),
          notes,
          totalAmount,
          paidAmount: 0,
          status: 'PENDING',
          date: new Date(),
          items: {
            create: items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            })),
          },
        },
        include: {
          patient: true,
          items: true,
          payments: true,
        },
      });

      return created;
    });

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
