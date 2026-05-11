import { WhatsAppMessageEntity } from './whatsapp-message.entity';

export class WhatsAppConversationEntity {
  id!: string;
  patientPhone!: string;
  patientId?: string;
  clinicId!: string;
  messages!: WhatsAppMessageEntity[];
  lastActivity!: Date;
  createdAt!: Date;

  constructor(partial: Partial<WhatsAppConversationEntity>) {
    Object.assign(this, partial);
  }

  isActive(withinHours = 24): boolean {
    const cutoff = new Date(Date.now() - withinHours * 60 * 60 * 1000);
    return this.lastActivity > cutoff;
  }

  getMessageHistory(): { role: string; content: string }[] {
    return this.messages.map(m => ({ role: m.role, content: m.content }));
  }
}
