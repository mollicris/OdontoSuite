import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@common/guards/jwt.guard';
import { CreateInvoiceUseCase } from '../application/use-cases/create-invoice.use-case';
import { ListInvoicesUseCase } from '../application/use-cases/list-invoices.use-case';
import { GetInvoiceUseCase } from '../application/use-cases/get-invoice.use-case';
import { AddPaymentUseCase } from '../application/use-cases/add-payment.use-case';
import { UpdateInvoiceStatusUseCase } from '../application/use-cases/update-invoice-status.use-case';
import { CreateInvoiceDto } from '../application/dtos/create-invoice.dto';
import { AddPaymentDto } from '../application/dtos/add-payment.dto';

@ApiTags('billing')
@ApiBearerAuth('access-token')
@Controller('billing/invoices')
@UseGuards(JwtGuard)
export class BillingController {
  constructor(
    private readonly createInvoiceUseCase: CreateInvoiceUseCase,
    private readonly listInvoicesUseCase: ListInvoicesUseCase,
    private readonly getInvoiceUseCase: GetInvoiceUseCase,
    private readonly addPaymentUseCase: AddPaymentUseCase,
    private readonly updateInvoiceStatusUseCase: UpdateInvoiceStatusUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.createInvoiceUseCase.execute(createInvoiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'List invoices with filters' })
  @ApiResponse({ status: 200, description: 'List of invoices' })
  async listInvoices(
    @Query('patientId') patientId?: string,
    @Query('status') status?: string,
    @Query('clinicId') clinicId?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.listInvoicesUseCase.execute({
      patientId,
      status,
      clinicId,
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 10,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice details' })
  @ApiResponse({ status: 200, description: 'Invoice details' })
  async getInvoice(@Param('id') id: string) {
    return this.getInvoiceUseCase.execute(id);
  }

  @Post(':id/payments')
  @ApiOperation({ summary: 'Add payment to invoice' })
  @ApiResponse({ status: 201, description: 'Payment added successfully' })
  async addPayment(@Param('id') id: string, @Body() addPaymentDto: AddPaymentDto) {
    return this.addPaymentUseCase.execute(id, addPaymentDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update invoice status' })
  @ApiResponse({ status: 200, description: 'Invoice status updated' })
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.updateInvoiceStatusUseCase.execute(id, status);
  }
}
