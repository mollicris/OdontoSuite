import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class AddPaymentDto {
  @IsNumber()
  amount!: number;

  @IsString()
  paymentMethod!: string; // CASH, CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
