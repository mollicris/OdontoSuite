export interface IWhatsAppApiService {
  sendMessage(phoneNumber: string, message: string): Promise<string | null>;
  verifyWebhook(mode: string, token: string, challenge: string): string | null;
}

export const WHATSAPP_API_SERVICE = Symbol('IWhatsAppApiService');
