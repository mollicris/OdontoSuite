import { Injectable, Inject } from '@nestjs/common';
import { WhatsAppConversationRepository } from '../../infrastructure/repositories/whatsapp-conversation.repository';
import { IClaudeService, CLAUDE_SERVICE } from '../../infrastructure/interfaces/claude-service.interface';
import { IWhatsAppApiService, WHATSAPP_API_SERVICE } from '../../infrastructure/interfaces/whatsapp-api.interface';
import { MessageRole } from '../../domain/whatsapp-message.entity';

export interface ProcessMessageParams {
  senderPhone: string;
  messageText: string;
  whatsappMsgId?: string;
  clinicId: string;
}

@Injectable()
export class ProcessWhatsAppMessageUseCase {
  constructor(
    private readonly conversationRepository: WhatsAppConversationRepository,
    @Inject(CLAUDE_SERVICE) private readonly claudeService: IClaudeService,
    @Inject(WHATSAPP_API_SERVICE) private readonly whatsappApiService: IWhatsAppApiService,
  ) {}

  async execute(params: ProcessMessageParams): Promise<void> {
    let conversation = await this.conversationRepository.findActiveByPhone(
      params.senderPhone,
      params.clinicId,
    );

    if (!conversation) {
      conversation = await this.conversationRepository.createConversation({
        patientPhone: params.senderPhone,
        clinicId: params.clinicId,
      });
    }

    await this.conversationRepository.addMessage({
      conversationId: conversation.id,
      role: MessageRole.USER,
      content: params.messageText,
      whatsappMsgId: params.whatsappMsgId,
    });

    const history = conversation.getMessageHistory();
    history.push({ role: 'user', content: params.messageText });

    const { reply } = await this.claudeService.chat({
      messages: history,
      patientPhone: params.senderPhone,
      clinicId: params.clinicId,
    });

    await this.conversationRepository.addMessage({
      conversationId: conversation.id,
      role: MessageRole.ASSISTANT,
      content: reply,
    });

    await this.conversationRepository.touchConversation(conversation.id);

    await this.whatsappApiService.sendMessage(params.senderPhone, reply);
  }
}
