import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { AddPaymentDto } from '../dtos/add-payment.dto';
import { InvoiceResponseDto } from '../dtos/invoice-response.dto';

@Injectable()
export class AddPaymentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(invoiceId: string, addPaymentDto: AddPaymentDto): Promise<InvoiceResponseDto> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        patient: true,
        items: true,
        payments: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${invoiceId} not found`);
    }

    if (invoice.status === 'CANCELLED') {
      throw new BadRequestException('Cannot add payment to a cancelled invoice');
    }

    if (invoice.status === 'PAID') {
      throw new BadRequestException('Invoice is already paid');
    }

    // Create payment and update invoice in transaction
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          invoiceId,
          amount: addPaymentDto.amount,
          paymentMethod: addPaymentDto.paymentMethod,
          paymentDate: addPaymentDto.paymentDate ? new Date(addPaymentDto.paymentDate) : new Date(),
          transactionId: addPaymentDto.transactionId,
          notes: addPaymentDto.notes,
        },
      });

      // Recalculate total paid amount
      const payments = await tx.payment.findMany({
        where: { invoiceId },
      });

      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0) + addPaymentDto.amount;
      const newStatus = totalPaid >= invoice.totalAmount ? 'PAID' : 'PENDING';

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: totalPaid,
          status: newStatus,
        },
        include: {
          patient: true,
          items: true,
          payments: true,
        },
      });

      return updatedInvoice;
    });

    return this.mapToDto(updated);
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
