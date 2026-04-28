import { Module } from '@nestjs/common';
import { CommonModule } from '@common/common.module';
import { BillingController } from './presentation/billing.controller';
import { CreateInvoiceUseCase } from './application/use-cases/create-invoice.use-case';
import { ListInvoicesUseCase } from './application/use-cases/list-invoices.use-case';
import { GetInvoiceUseCase } from './application/use-cases/get-invoice.use-case';
import { AddPaymentUseCase } from './application/use-cases/add-payment.use-case';
import { UpdateInvoiceStatusUseCase } from './application/use-cases/update-invoice-status.use-case';

@Module({
  imports: [CommonModule],
  controllers: [BillingController],
  providers: [
    CreateInvoiceUseCase,
    ListInvoicesUseCase,
    GetInvoiceUseCase,
    AddPaymentUseCase,
    UpdateInvoiceStatusUseCase,
  ],
  exports: [],
})
export class BillingModule {}
