import { Controller, Get, Post, Body, Query, Res, HttpCode, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtGuard } from '@common/guards/jwt.guard';
import { ProcessWhatsAppMessageUseCase } from '../application/use-cases/process-whatsapp-message.use-case';
import { IWhatsAppApiService, WHATSAPP_API_SERVICE } from '../infrastructure/interfaces/whatsapp-api.interface';
import { Inject } from '@nestjs/common';
import { SendTestMessageDto } from '../application/dtos/whatsapp-webhook.dto';
import { ConfigService } from '@nestjs/config';

@ApiTags('whatsapp')
@Controller('whatsapp')
export class WhatsAppController {
  private readonly defaultClinicId: string;

  constructor(
    private readonly processMessageUseCase: ProcessWhatsAppMessageUseCase,
    @Inject(WHATSAPP_API_SERVICE) private readonly whatsappApiService: IWhatsAppApiService,
    private readonly config: ConfigService,
  ) {
    this.defaultClinicId = this.config.get<string>('DEFAULT_CLINIC_ID', '');
  }

  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') token: string,
    @Res() res: Response,
  ) {
    const result = this.whatsappApiService.verifyWebhook(mode, token, challenge);
    if (result) return res.status(200).send(result);
    return res.status(403).send('Forbidden');
  }

  @Post('webhook')
  @HttpCode(200)
  async receiveMessage(@Body() body: any): Promise<string> {
    // console.log('📨 [WhatsApp] Webhook recibido:', JSON.stringify(body).substring(0, 500));

    setImmediate(async () => {
      try {
        if (!body?.object || body.object !== 'whatsapp_business_account') {
          console.log('⚠️ [WhatsApp] Webhook recibido pero no es de WhatsApp');
          return;
        }

        const entry = body?.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if (!value) {
          console.log('⚠️ [WhatsApp] Estructura de webhook vacía');
          return;
        }

        // Intentar obtener mensajes de la estructura
        const messages = value?.messages;

        if (!messages || messages.length === 0) {
          console.log('ℹ️ [WhatsApp] Webhook recibido pero no contiene mensajes (puede ser estatus)');
          console.log('📋 [WhatsApp] Contenido del webhook:', JSON.stringify(value).substring(0, 300));
          return;
        }

        const message = messages[0];
        const senderPhone: string = message.from;
        const messageText: string = message.text?.body ?? '';
        const whatsappMsgId: string = message.id;

        console.log(`📱 [WhatsApp] Mensaje de ${senderPhone}: "${messageText}"`);

        if (!messageText) {
          console.log('⚠️ [WhatsApp] Mensaje vacío, ignorando');
          return;
        }

        console.log('⏳ [WhatsApp] Procesando mensaje...');
        await this.processMessageUseCase.execute({
          senderPhone,
          messageText,
          whatsappMsgId,
          clinicId: this.defaultClinicId,
        });
        console.log('✅ [WhatsApp] Mensaje procesado exitosamente');
      } catch (err) {
        console.error('❌ [WhatsApp] Error procesando mensaje:', err);
      }
    });

    return 'OK';
  }

  @Post('send-test')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('access-token')
  async sendTestMessage(@Body() dto: SendTestMessageDto) {
    const msgId = await this.whatsappApiService.sendMessage(dto.phone, dto.message);
    return { success: !!msgId, messageId: msgId };
  }
}
