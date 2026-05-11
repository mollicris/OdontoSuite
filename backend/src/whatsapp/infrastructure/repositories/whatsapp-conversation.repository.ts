import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { WhatsAppConversationEntity } from '../../domain/whatsapp-conversation.entity';
import { WhatsAppMessageEntity, MessageRole } from '../../domain/whatsapp-message.entity';

@Injectable()
export class WhatsAppConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(data: any): WhatsAppConversationEntity {
    return new WhatsAppConversationEntity({
      ...data,
      messages: (data.messages || []).map(
        (m: any) => new WhatsAppMessageEntity({ ...m, role: m.role as MessageRole }),
      ),
    });
  }

  async findActiveByPhone(
    patientPhone: string,
    clinicId: string,
    withinHours = 24,
  ): Promise<WhatsAppConversationEntity | null> {
    const since = new Date(Date.now() - withinHours * 60 * 60 * 1000);
    const found = await this.prisma.whatsAppConversation.findFirst({
      where: { patientPhone, clinicId, lastActivity: { gte: since } },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
      orderBy: { lastActivity: 'desc' },
    });
    return found ? this.mapToEntity(found) : null;
  }

  async createConversation(params: {
    patientPhone: string;
    clinicId: string;
    patientId?: string;
  }): Promise<WhatsAppConversationEntity> {
    const created = await this.prisma.whatsAppConversation.create({
      data: { ...params },
      include: { messages: true },
    });
    return this.mapToEntity(created);
  }

  async addMessage(params: {
    conversationId: string;
    role: MessageRole;
    content: string;
    whatsappMsgId?: string;
  }): Promise<WhatsAppMessageEntity> {
    const msg = await this.prisma.whatsAppMessage.create({
      data: {
        conversationId: params.conversationId,
        role: params.role,
        content: params.content,
        whatsappMsgId: params.whatsappMsgId,
      },
    });
    return new WhatsAppMessageEntity({
      ...msg,
      role: msg.role as MessageRole,
      whatsappMsgId: msg.whatsappMsgId ?? undefined,
    });
  }

  async touchConversation(conversationId: string): Promise<void> {
    await this.prisma.whatsAppConversation.update({
      where: { id: conversationId },
      data: { lastActivity: new Date() },
    });
  }

  async linkPatient(conversationId: string, patientId: string): Promise<void> {
    await this.prisma.whatsAppConversation.update({
      where: { id: conversationId },
      data: { patientId },
    });
  }
}
