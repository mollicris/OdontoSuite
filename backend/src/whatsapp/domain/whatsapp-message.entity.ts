export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export class WhatsAppMessageEntity {
  id!: string;
  conversationId!: string;
  role!: MessageRole;
  content!: string;
  whatsappMsgId?: string;
  createdAt!: Date;

  constructor(partial: Partial<WhatsAppMessageEntity>) {
    Object.assign(this, partial);
  }

  isFromUser(): boolean {
    return this.role === MessageRole.USER;
  }
}
