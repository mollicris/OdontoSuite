import { IsNotEmpty, IsString } from 'class-validator';

export class SendTestMessageDto {
  @IsNotEmpty() @IsString() phone!: string;
  @IsNotEmpty() @IsString() message!: string;
  @IsNotEmpty() @IsString() clinicId!: string;
}
