# Plan: Módulo WhatsApp para OdontoSuite

## Contexto

MediAssist es un backend Node.js/Express con Claude AI que automatiza agendamiento de citas vía WhatsApp. Actualmente guarda datos en Supabase (base de datos aislada), sin integración con OdontoSuite. El objetivo es mover esa funcionalidad como un módulo nativo de OdontoSuite, usando la misma base de datos PostgreSQL, misma arquitectura DDD, y mismos patrones de código. Esto elimina la duplicación de datos y permite que las citas de WhatsApp aparezcan automáticamente en el sistema web.

## Tecnología

- **Framework**: NestJS (igual que OdontoSuite)
- **BD**: PostgreSQL vía Prisma (compartida con OdontoSuite)
- **IA**: Anthropic SDK (`@anthropic-ai/sdk`) con Claude Haiku 4.5 (tool use)
- **WhatsApp**: Meta Graph API v25.0 (webhooks + envío)
- **Calendar**: Google Calendar API v3 (OAuth2)
- **Patrones**: DDD + Clean Architecture + SOLID

---

## Archivos Críticos Existentes (NO modificar, solo leer/reutilizar)

| Archivo | Rol |
|--------|-----|
| `backend/src/app.module.ts` | Agregar `WhatsAppModule` al array `imports` |
| `backend/prisma/schema.prisma` | Agregar modelos `WhatsAppConversation` y `WhatsAppMessage` |
| `backend/src/common/common.module.ts` | Importar en WhatsAppModule para obtener PrismaService |
| `backend/src/common/guards/jwt.guard.ts` | Usar en rutas admin del módulo |
| `backend/src/appointment/infrastructure/repositories/appointment.repository.ts` | Importar para crear/consultar citas |
| `backend/src/patient/infrastructure/repositories/patient.repository.ts` | Importar para upsert de pacientes |
| `backend/src/appointment/application/use-cases/create-appointment.use-case.ts` | Reutilizar para crear cita desde WhatsApp |
| `backend/src/appointment/application/use-cases/check-availability.use-case.ts` | Reutilizar para obtener slots disponibles |

---

## Paso 1: Prisma Schema — Nuevos Modelos

**Archivo**: `backend/prisma/schema.prisma`

Agregar al final del archivo:

```prisma
model WhatsAppConversation {
  id            String             @id @default(cuid())
  patientPhone  String
  patientId     String?
  clinicId      String
  messages      WhatsAppMessage[]
  lastActivity  DateTime           @default(now()) @updatedAt
  createdAt     DateTime           @default(now())

  patient       Patient?           @relation(fields: [patientId], references: [id])
  clinic        Clinic             @relation(fields: [clinicId], references: [id])

  @@index([patientPhone])
  @@index([clinicId])
}

model WhatsAppMessage {
  id              String                  @id @default(cuid())
  conversationId  String
  role            String                  // 'user' | 'assistant'
  content         String
  whatsappMsgId   String?                 // ID del mensaje en Meta API
  createdAt       DateTime                @default(now())

  conversation    WhatsAppConversation    @relation(fields: [conversationId], references: [id])

  @@index([conversationId])
}
```

También agregar en el modelo `Patient` la relación inversa:
```prisma
whatsAppConversations  WhatsAppConversation[]
```
Y en el modelo `Clinic`:
```prisma
whatsAppConversations  WhatsAppConversation[]
```

Luego correr:
```bash
npx prisma migrate dev --name add_whatsapp_module
npx prisma generate
```

---

## Paso 2: Estructura de Archivos

```
backend/src/whatsapp/
├── whatsapp.module.ts
├── domain/
│   ├── whatsapp-message.entity.ts
│   └── whatsapp-conversation.entity.ts
├── application/
│   ├── dtos/
│   │   ├── whatsapp-webhook.dto.ts
│   │   └── whatsapp-response.dto.ts
│   └── use-cases/
│       ├── process-whatsapp-message.use-case.ts
│       ├── send-whatsapp-message.use-case.ts
│       └── get-conversation-history.use-case.ts
├── infrastructure/
│   ├── interfaces/
│   │   ├── claude-service.interface.ts
│   │   ├── whatsapp-api.interface.ts
│   │   └── calendar-service.interface.ts
│   ├── repositories/
│   │   └── whatsapp-conversation.repository.ts
│   └── services/
│       ├── claude.service.ts
│       ├── meta-whatsapp.service.ts
│       └── google-calendar.service.ts
└── presentation/
    └── whatsapp.controller.ts
```

---

## Paso 3: Domain Entities

### `domain/whatsapp-message.entity.ts`
```typescript
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
```

### `domain/whatsapp-conversation.entity.ts`
```typescript
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
```

---

## Paso 4: Interfaces SOLID (Dependency Inversion)

### `infrastructure/interfaces/claude-service.interface.ts`
```typescript
export interface ClaudeToolResult {
  reply: string;
}

export interface IClaudeService {
  chat(params: {
    messages: { role: string; content: string }[];
    patientPhone: string;
    clinicId: string;
  }): Promise<ClaudeToolResult>;
}

export const CLAUDE_SERVICE = Symbol('IClaudeService');
```

### `infrastructure/interfaces/whatsapp-api.interface.ts`
```typescript
export interface IWhatsAppApiService {
  sendMessage(phoneNumber: string, message: string): Promise<string | null>;
  verifyWebhook(mode: string, token: string, challenge: string): string | null;
}

export const WHATSAPP_API_SERVICE = Symbol('IWhatsAppApiService');
```

### `infrastructure/interfaces/calendar-service.interface.ts`
```typescript
export interface AvailableSlot {
  time: string; // 'HH:MM'
}

export interface ICalendarService {
  getAvailableSlots(date: string, calendarId?: string): Promise<string[]>;
  createAppointmentEvent(params: {
    patientName: string;
    specialty: string;
    date: string;
    time: string;
    calendarId?: string;
  }): Promise<string>; // returns Google event ID
  cancelAppointmentEvent(eventId: string, calendarId?: string): Promise<void>;
}

export const CALENDAR_SERVICE = Symbol('ICalendarService');
```

---

## Paso 5: Repository

### `infrastructure/repositories/whatsapp-conversation.repository.ts`
```typescript
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
    return new WhatsAppMessageEntity({ ...msg, role: msg.role as MessageRole });
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
```

---

## Paso 6: Servicios de Infraestructura

### `infrastructure/services/meta-whatsapp.service.ts`
```typescript
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

      const data = await response.json();
      return data.messages?.[0]?.id ?? null;
    } catch (err) {
      console.error('❌ [MetaWhatsApp] sendMessage exception:', err);
      return null;
    }
  }
}
```

### `infrastructure/services/google-calendar.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { ICalendarService } from '../interfaces/calendar-service.interface';

@Injectable()
export class GoogleCalendarService implements ICalendarService {
  private readonly calendar;
  private readonly oauth2Client;

  constructor(private readonly config: ConfigService) {
    this.oauth2Client = new google.auth.OAuth2(
      this.config.get('GOOGLE_CLIENT_ID'),
      this.config.get('GOOGLE_CLIENT_SECRET'),
      this.config.get('GOOGLE_REDIRECT_URI'),
    );

    const accessToken = this.config.get('GOOGLE_ACCESS_TOKEN');
    const refreshToken = this.config.get('GOOGLE_REFRESH_TOKEN');
    if (accessToken && refreshToken) {
      this.oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
    }

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  async getAvailableSlots(date: string, calendarId = 'primary'): Promise<string[]> {
    const start = new Date(`${date}T08:00:00`);
    const end = new Date(`${date}T18:00:00`);

    const { data } = await this.calendar.events.list({
      calendarId,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const busy = (data.items || []).map((e: any) => ({
      start: new Date(e.start.dateTime || e.start.date),
      end: new Date(e.end.dateTime || e.end.date),
    }));

    const slots: string[] = [];
    for (let h = 8; h < 18; h++) {
      for (const m of [0, 30]) {
        const slotStart = new Date(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
        const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
        const isBusy = busy.some(b => slotStart < b.end && slotEnd > b.start);
        if (!isBusy) slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return slots;
  }

  async createAppointmentEvent(params: {
    patientName: string;
    specialty: string;
    date: string;
    time: string;
    calendarId?: string;
  }): Promise<string> {
    const calendarId = params.calendarId ?? 'primary';
    const startTime = new Date(`${params.date}T${params.time}:00`);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    const { data } = await this.calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `Cita: ${params.specialty} — ${params.patientName}`,
        description: `Paciente: ${params.patientName}\nEspecialidad: ${params.specialty}`,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 1440 },
            { method: 'popup', minutes: 30 },
          ],
        },
      },
    });

    return data.id!;
  }

  async cancelAppointmentEvent(eventId: string, calendarId = 'primary'): Promise<void> {
    await this.calendar.events.delete({ calendarId, eventId });
  }
}
```

### `infrastructure/services/claude.service.ts`
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { IClaudeService, ClaudeToolResult } from '../interfaces/claude-service.interface';
import { ICalendarService, CALENDAR_SERVICE } from '../interfaces/calendar-service.interface';
import { AppointmentRepository } from '@appointment/infrastructure/repositories/appointment.repository';
import { PatientRepository } from '@patient/infrastructure/repositories/patient.repository';

// Tools para Claude (mismos que MediAssist, adaptados)
const TOOLS: Anthropic.Tool[] = [
  {
    name: 'get_dentists',
    description: 'Lista los dentistas disponibles en la clínica, filtrados por especialidad si se especifica.',
    input_schema: {
      type: 'object' as const,
      properties: {
        clinic_id: { type: 'string' },
        specialty: { type: 'string', description: 'Especialidad para filtrar (opcional)' },
      },
      required: ['clinic_id'],
    },
  },
  {
    name: 'get_available_slots',
    description: 'Obtiene horarios disponibles para una fecha y dentista específico.',
    input_schema: {
      type: 'object' as const,
      properties: {
        date: { type: 'string', description: 'YYYY-MM-DD' },
        dentist_id: { type: 'string', description: 'ID del dentista seleccionado' },
        specialty: { type: 'string' },
      },
      required: ['date', 'dentist_id', 'specialty'],
    },
  },
  {
    name: 'book_appointment',
    description: 'Agenda una cita médica con el dentista elegido.',
    input_schema: {
      type: 'object' as const,
      properties: {
        patient_name: { type: 'string' },
        patient_phone: { type: 'string' },
        specialty: { type: 'string' },
        dentist_id: { type: 'string', description: 'ID del dentista elegido por el paciente' },
        service_id: { type: 'string', description: 'ID del servicio correspondiente a la especialidad' },
        date: { type: 'string', description: 'YYYY-MM-DD' },
        time: { type: 'string', description: 'HH:MM' },
        clinic_id: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['patient_name', 'patient_phone', 'specialty', 'dentist_id', 'service_id', 'date', 'time', 'clinic_id'],
    },
  },
  {
    name: 'cancel_appointment',
    description: 'Cancela una cita existente.',
    input_schema: {
      type: 'object' as const,
      properties: {
        patient_phone: { type: 'string' },
        appointment_id: { type: 'string' },
      },
      required: ['patient_phone'],
    },
  },
  {
    name: 'get_patient_appointments',
    description: 'Consulta las citas próximas de un paciente.',
    input_schema: {
      type: 'object' as const,
      properties: {
        patient_phone: { type: 'string' },
        clinic_id: { type: 'string' },
      },
      required: ['patient_phone', 'clinic_id'],
    },
  },
];

@Injectable()
export class ClaudeService implements IClaudeService {
  private readonly anthropic: Anthropic;

  constructor(
    private readonly config: ConfigService,
    @Inject(CALENDAR_SERVICE) private readonly calendarService: ICalendarService,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly patientRepository: PatientRepository,
    private readonly prisma: PrismaService,  // para get_dentists
  ) {
    this.anthropic = new Anthropic({ apiKey: this.config.get('ANTHROPIC_API_KEY')! });
  }

  async chat(params: {
    messages: { role: string; content: string }[];
    patientPhone: string;
    clinicId: string;
  }): Promise<ClaudeToolResult> {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const systemPrompt = `Eres asistente amigable de citas médicas de la clínica.
Teléfono del paciente: ${params.patientPhone}. Clínica ID: ${params.clinicId}.
Hoy es ${today}. Mañana es ${tomorrow}.

Entiende lenguaje natural: "hoy"→${today}, "mañana"→${tomorrow}.
Flujos:
1. AGENDAR:
   a. Pedir nombre, especialidad y fecha al paciente
   b. Llamar get_dentists para mostrar dentistas disponibles → paciente elige
   c. Llamar get_available_slots con el dentist_id elegido → mostrar horarios
   d. Paciente confirma hora → llamar book_appointment con dentist_id y service_id
2. CONSULTAR: get_patient_appointments
3. CANCELAR: cancel_appointment
Responde en español, máximo 3 líneas.`;

    let messages = params.messages as Anthropic.MessageParam[];
    let response = await this.anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      tools: TOOLS,
      messages,
    });

    let loopCount = 0;
    while (response.stop_reason === 'tool_use' && loopCount < 10) {
      loopCount++;
      const toolUses = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');

      const toolResults = await Promise.all(
        toolUses.map(async tool => {
          try {
            const content = await this.executeTool(tool.name, tool.input as Record<string, any>, params.clinicId);
            return { type: 'tool_result' as const, tool_use_id: tool.id, content };
          } catch (err: any) {
            return { type: 'tool_result' as const, tool_use_id: tool.id, content: `Error: ${err.message}`, is_error: true };
          }
        }),
      );

      messages = [
        ...messages,
        { role: 'assistant' as const, content: response.content },
        { role: 'user' as const, content: toolResults },
      ];

      response = await this.anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        tools: TOOLS,
        messages,
      });
    }

    const text = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')?.text ?? '';
    return { reply: text };
  }

  private async executeTool(name: string, input: Record<string, any>, clinicId: string): Promise<string> {
    switch (name) {
      case 'get_dentists': {
        // Buscar dentistas de la clínica con DentistProfile, filtrar por especialidad si se pasa
        const dentists = await this.prisma.user.findMany({
          where: {
            dentistProfile: {
              clinicId: input.clinic_id,
              ...(input.specialty ? { specialization: { contains: input.specialty, mode: 'insensitive' } } : {}),
            },
          },
          include: { dentistProfile: true },
        });
        if (!dentists.length) return 'No hay dentistas disponibles para esa especialidad.';
        const list = dentists.map((d: any) => `• ${d.firstName} ${d.lastName} (${d.dentistProfile.specialization}) — ID: ${d.id}`).join('\n');
        return `Dentistas disponibles:\n${list}\n\nEscribe el nombre del dentista de tu preferencia.`;
      }

      case 'get_available_slots': {
        const slots = await this.calendarService.getAvailableSlots(input.date);
        if (!slots.length) return 'No hay horarios disponibles para esa fecha.';
        return `Horarios disponibles el ${input.date} con ese dentista:\n${slots.slice(0, 6).join(', ')}`;
      }

      case 'book_appointment': {
        // 1. Upsert paciente en OdontoSuite
        let patient = await this.patientRepository.findByPhone(input.patient_phone);
        if (!patient) {
          const [firstName, ...rest] = (input.patient_name as string).split(' ');
          patient = await this.patientRepository.create({
            clinicId,
            firstName,
            lastName: rest.join(' ') || 'N/A',
            phone: input.patient_phone,
          } as any);
        }

        // 2. Crear evento en Google Calendar
        const googleEventId = await this.calendarService.createAppointmentEvent({
          patientName: input.patient_name,
          specialty: input.specialty,
          date: input.date,
          time: input.time,
        });

        // 3. Crear cita en OdontoSuite con el dentista elegido por el paciente
        const startTime = new Date(`${input.date}T${input.time}:00`);
        const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

        await this.appointmentRepository.create({
          clinicId,
          patientId: patient.id,
          dentistId: input.dentist_id,
          serviceId: input.service_id,
          startTime,
          endTime,
          status: 'SCHEDULED',
          notes: `${input.notes ?? ''} [Google Event: ${googleEventId}]`.trim(),
        } as any);

        return `Cita agendada ✅\n- ${input.specialty}\n- ${input.date} a las ${input.time}`;
      }

      case 'cancel_appointment': {
        const appts = await this.appointmentRepository.findByPhone(input.patient_phone, clinicId);
        if (!appts?.length) return 'No encontré citas activas para cancelar.';
        const appt = appts[0];
        await this.appointmentRepository.updateStatus(appt.id, 'CANCELLED' as any, 'Cancelado por WhatsApp');
        return `Cita cancelada ✅\n- ${appt.startTime?.toISOString()?.split('T')[0]}`;
      }

      case 'get_patient_appointments': {
        const appts = await this.appointmentRepository.findByPhone(input.patient_phone, clinicId);
        if (!appts?.length) return 'No tienes citas próximas agendadas.';
        const list = appts.map((a: any) => `• ${a.startTime?.toISOString()}`).join('\n');
        return `Tus próximas citas:\n${list}`;
      }

      default:
        return 'Herramienta no reconocida.';
    }
  }
}
```

---

## Paso 7: DTOs

### `application/dtos/whatsapp-webhook.dto.ts`
```typescript
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

// Solo para la ruta admin de prueba
export class SendTestMessageDto {
  @IsNotEmpty() @IsString() phone!: string;
  @IsNotEmpty() @IsString() message!: string;
  @IsNotEmpty() @IsString() clinicId!: string;
}
```

---

## Paso 8: Use Cases

### `application/use-cases/process-whatsapp-message.use-case.ts`
```typescript
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
    // 1. Obtener o crear conversación activa
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

    // 2. Guardar mensaje del usuario
    await this.conversationRepository.addMessage({
      conversationId: conversation.id,
      role: MessageRole.USER,
      content: params.messageText,
      whatsappMsgId: params.whatsappMsgId,
    });

    // 3. Preparar historial para Claude
    const history = conversation.getMessageHistory();
    history.push({ role: 'user', content: params.messageText });

    // 4. Llamar a Claude
    const { reply } = await this.claudeService.chat({
      messages: history,
      patientPhone: params.senderPhone,
      clinicId: params.clinicId,
    });

    // 5. Guardar respuesta del asistente
    await this.conversationRepository.addMessage({
      conversationId: conversation.id,
      role: MessageRole.ASSISTANT,
      content: reply,
    });

    await this.conversationRepository.touchConversation(conversation.id);

    // 6. Enviar respuesta por WhatsApp
    await this.whatsappApiService.sendMessage(params.senderPhone, reply);
  }
}
```

---

## Paso 9: Controller

### `presentation/whatsapp.controller.ts`
```typescript
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

  // Verificación de webhook Meta (sin auth)
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

  // Recibir mensajes de WhatsApp (sin auth — Meta llama este endpoint)
  @Post('webhook')
  @HttpCode(200)
  async receiveMessage(@Body() body: any): Promise<string> {
    // Responder OK inmediatamente (Meta requiere < 20s)
    setImmediate(async () => {
      try {
        if (body?.object === 'whatsapp_business_account' && body?.entry?.[0]?.changes?.[0]?.value?.messages) {
          const message = body.entry[0].changes[0].value.messages[0];
          const senderPhone: string = message.from;
          const messageText: string = message.text?.body ?? '';
          const whatsappMsgId: string = message.id;

          if (!messageText) return;

          await this.processMessageUseCase.execute({
            senderPhone,
            messageText,
            whatsappMsgId,
            clinicId: this.defaultClinicId,
          });
        }
      } catch (err) {
        console.error('❌ [WhatsApp] Error procesando mensaje:', err);
      }
    });

    return 'OK';
  }

  // Ruta admin: enviar mensaje de prueba
  @Post('send-test')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('access-token')
  async sendTestMessage(@Body() dto: SendTestMessageDto) {
    const msgId = await this.whatsappApiService.sendMessage(dto.phone, dto.message);
    return { success: !!msgId, messageId: msgId };
  }
}
```

---

## Paso 10: Module Registration

### `whatsapp.module.ts`
```typescript
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
    AppointmentModule,  // exporta AppointmentRepository
    PatientModule,      // exporta PatientRepository
  ],
  controllers: [WhatsAppController],
  providers: [
    ProcessWhatsAppMessageUseCase,
    WhatsAppConversationRepository,
    { provide: CLAUDE_SERVICE, useClass: ClaudeService },
    { provide: WHATSAPP_API_SERVICE, useClass: MetaWhatsAppService },
    { provide: CALENDAR_SERVICE, useClass: GoogleCalendarService },
    // Needed by ClaudeService since it injects via Symbol
    ClaudeService,
    GoogleCalendarService,
  ],
})
export class WhatsAppModule {}
```

### Agregar a `app.module.ts`
```typescript
import { WhatsAppModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    // ...módulos existentes...
    WhatsAppModule,  // agregar aquí
  ],
})
export class AppModule {}
```

---

## Paso 11: Variables de Entorno

Agregar al `.env.example` del backend:

```env
# WhatsApp (Meta)
META_PHONE_NUMBER_ID=your_phone_number_id
META_WHATSAPP_TOKEN=your_whatsapp_token
META_VERIFY_TOKEN=your_verify_token

# Google Calendar
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://tu-dominio.com/auth/google/callback
GOOGLE_ACCESS_TOKEN=your_access_token
GOOGLE_REFRESH_TOKEN=your_refresh_token

# Anthropic (Claude)
ANTHROPIC_API_KEY=your_anthropic_key

# Clínica por defecto para WhatsApp
DEFAULT_CLINIC_ID=id_de_tu_clinica_en_postgresql
```

---

## Paso 12: Dependencias NPM a Instalar

```bash
cd backend
npm install @anthropic-ai/sdk googleapis
```

---

## Paso 13: Métodos Faltantes en Repositorios Existentes

El módulo requiere métodos que pueden no existir aún en los repositorios de OdontoSuite:

### En `patient.repository.ts` agregar:
```typescript
async findByPhone(phone: string): Promise<PatientEntity | null> {
  const patient = await this.prisma.patient.findFirst({ where: { phone } });
  return patient ? new PatientEntity(this.serializeForPrisma(patient)) : null;
}
```

### En `appointment.repository.ts` agregar:
```typescript
async findByPhone(patientPhone: string, clinicId: string): Promise<AppointmentEntity[]> {
  const patient = await this.prisma.patient.findFirst({ where: { phone: patientPhone, clinicId } });
  if (!patient) return [];
  return this.findByClinic(clinicId, undefined, undefined, 'SCHEDULED' as any);
}
```

---

## Verificación (Cómo Probar)

1. **Migración BD**:
   ```bash
   npx prisma migrate dev --name add_whatsapp_module
   ```

2. **Compilar**:
   ```bash
   npm run build
   ```

3. **Verificar webhook Meta** (GET):
   ```
   GET /whatsapp/webhook?hub.mode=subscribe&hub.verify_token=TU_TOKEN&hub.challenge=12345
   → debe responder: 12345
   ```

4. **Probar mensaje**:
   ```bash
   curl -X POST http://localhost:3000/whatsapp/webhook \
     -H "Content-Type: application/json" \
     -d '{
       "object": "whatsapp_business_account",
       "entry": [{
         "changes": [{
           "value": {
             "messages": [{
               "from": "59170000000",
               "id": "test-123",
               "text": {"body": "Quiero una cita de odontología para mañana"}
             }]
           }
         }]
       }]
     }'
   ```

5. **Verificar en BD**:
   ```sql
   SELECT * FROM "WhatsAppConversation" ORDER BY "createdAt" DESC LIMIT 5;
   SELECT * FROM "Appointment" ORDER BY "createdAt" DESC LIMIT 5;
   ```

6. **Swagger**: Ver `http://localhost:3000/api-docs` → sección `whatsapp`

---

## Principios SOLID Aplicados

| Principio | Aplicación |
|-----------|-----------|
| **S** (Single Responsibility) | `ClaudeService` solo orquesta IA, `MetaWhatsAppService` solo envía/recibe, `GoogleCalendarService` solo maneja calendario |
| **O** (Open/Closed) | Agregar nuevo canal de mensajería (Telegram, SMS) implementando `IWhatsAppApiService` sin tocar código existente |
| **L** (Liskov) | `MetaWhatsAppService` puede ser reemplazado por cualquier implementación de `IWhatsAppApiService` |
| **I** (Interface Segregation) | Tres interfaces separadas: `IClaudeService`, `IWhatsAppApiService`, `ICalendarService` — ninguna tiene métodos que no usa |
| **D** (Dependency Inversion) | `ProcessWhatsAppMessageUseCase` depende de `IClaudeService` y `IWhatsAppApiService` (abstracciones), no de las implementaciones concretas |
