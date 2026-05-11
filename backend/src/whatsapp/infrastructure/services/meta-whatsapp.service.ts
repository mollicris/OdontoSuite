import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IWhatsAppApiService } from '../interfaces/whatsapp-api.interface';

@Injectable()
export class MetaWhatsAppService implements IWhatsAppApiService {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly verifyToken: string;

  constructor(private readonly config: ConfigService) {
    const phoneNumberId = this.config.get<string>('META_PHONE_NUMBER_ID');
    this.baseUrl = `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`;
    this.token = this.config.get<string>('META_WHATSAPP_TOKEN')!;
    this.verifyToken = this.config.get<string>('META_VERIFY_TOKEN')!;
  }

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.verifyToken) return challenge;
    return null;
  }

  async sendMessage(phoneNumber: string, message: string): Promise<string | null> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: message },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ [MetaWhatsApp] sendMessage error:', error);
        return null;
      }

      const data = (await response.json()) as any;
      return data.messages?.[0]?.id ?? null;
    } catch (err) {
      console.error('❌ [MetaWhatsApp] sendMessage exception:', err);
      return null;
    }
  }
}
