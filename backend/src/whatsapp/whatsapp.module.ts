import { Module } from '@nestjs/common';
import { CommonModule } from '@common/common.module';
import { AppointmentModule } from '@appointment/appointment.module';
import { PatientModule } from '@patient/patient.module';
import { WhatsAppController } from './presentation/whatsapp.controller';
import { ProcessWhatsAppMessageUseCase } from './application/use-cases/process-whatsapp-message.use-case';
import { WhatsAppConversationRepository } from './infrastructure/repositories/whatsapp-conversation.repository';
import { ClaudeService } from './infrastructure/services/claude.service';
import { MetaWhatsAppService } from './infrastructure/services/meta-whatsapp.service';
import { GoogleCalendarService } from './infrastructure/services/google-calendar.service';
import { CLAUDE_SERVICE } from './infrastructure/interfaces/claude-service.interface';
import { WHATSAPP_API_SERVICE } from './infrastructure/interfaces/whatsapp-api.interface';
import { CALENDAR_SERVICE } from './infrastructure/interfaces/calendar-service.interface';

@Module({
  imports: [
    CommonModule,
    AppointmentModule,
    PatientModule,
  ],
  controllers: [WhatsAppController],
  providers: [
    ProcessWhatsAppMessageUseCase,
    WhatsAppConversationRepository,
    { provide: CLAUDE_SERVICE, useClass: ClaudeService },
    { provide: WHATSAPP_API_SERVICE, useClass: MetaWhatsAppService },
    { provide: CALENDAR_SERVICE, useClass: GoogleCalendarService },
    ClaudeService,
    GoogleCalendarService,
  ],
})
export class WhatsAppModule {}
