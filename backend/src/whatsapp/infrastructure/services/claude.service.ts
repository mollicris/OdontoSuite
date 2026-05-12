import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { IClaudeService, ClaudeToolResult } from '../interfaces/claude-service.interface';
import { ICalendarService, CALENDAR_SERVICE } from '../interfaces/calendar-service.interface';
import { IAvailabilityService, AVAILABILITY_SERVICE } from '@appointment/infrastructure/interfaces/availability-service.interface';
import { AppointmentRepository } from '@appointment/infrastructure/repositories/appointment.repository';
import { PatientRepository } from '@patient/infrastructure/repositories/patient.repository';
import { PrismaService } from '@common/services/prisma.service';

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'get_dentists',
    description:
      'Use esta herramienta cuando el paciente quiera AGENDAR una cita y haya proporcionado: nombre, email, especialidad y fecha. Esta herramienta lista los dentistas disponibles en la clínica filtrados por especialidad. La respuesta incluye el ID (UUID) de cada dentista que DEBE usar en las siguientes herramientas.',
    input_schema: {
      type: 'object' as const,
      properties: {
        clinic_id: { type: 'string', description: 'UUID de la clínica' },
        specialty: { type: 'string', description: 'Especialidad mencionada por el paciente (ej: Limpieza, Ortodoncia)' },
      },
      required: ['clinic_id', 'specialty'],
    },
  },
  {
    name: 'get_available_slots',
    description:
      'Use esta herramienta DESPUÉS de get_dentists, cuando el paciente haya elegido un dentista. Obtiene los horarios disponibles para esa fecha y dentista. El parámetro dentist_id DEBE ser el UUID del dentista (de la respuesta de get_dentists), NO el nombre.',
    input_schema: {
      type: 'object' as const,
      properties: {
        date: { type: 'string', description: 'Fecha en formato YYYY-MM-DD' },
        dentist_id: { type: 'string', description: 'UUID del dentista obtenido de get_dentists' },
        specialty: { type: 'string', description: 'Especialidad' },
      },
      required: ['date', 'dentist_id', 'specialty'],
    },
  },
  {
    name: 'book_appointment',
    description:
      'OBLIGATORIO: Use esta herramienta INMEDIATAMENTE cuando el paciente confirme una HORA específica (ej: "14:00", "10:30", "a las 9"). Esta es la herramienta FINAL del flujo de agendación que guarda la cita en la base de datos. NO responda con texto sin antes ejecutar esta herramienta cuando tenga la hora confirmada.',
    input_schema: {
      type: 'object' as const,
      properties: {
        patient_name: { type: 'string', description: 'Nombre del paciente' },
        patient_phone: { type: 'string', description: 'Teléfono del paciente (ya tienes este dato)' },
        patient_email: { type: 'string', description: 'Email del paciente' },
        specialty: { type: 'string', description: 'Especialidad de la cita' },
        dentist_id: { type: 'string', description: 'UUID del dentista (de get_dentists)' },
        date: { type: 'string', description: 'Fecha YYYY-MM-DD' },
        time: { type: 'string', description: 'Hora HH:MM' },
        clinic_id: { type: 'string', description: 'UUID de la clínica' },
      },
      required: ['patient_name', 'patient_phone', 'patient_email', 'specialty', 'dentist_id', 'date', 'time', 'clinic_id'],
    },
  },
  {
    name: 'get_patient_appointments',
    description: 'Use cuando el paciente pregunte sobre sus citas existentes ("mis citas", "qué citas tengo").',
    input_schema: {
      type: 'object' as const,
      properties: {
        patient_phone: { type: 'string' },
        clinic_id: { type: 'string' },
      },
      required: ['patient_phone', 'clinic_id'],
    },
  },
  {
    name: 'cancel_appointment',
    description: 'Use cuando el paciente quiera cancelar una cita existente.',
    input_schema: {
      type: 'object' as const,
      properties: {
        patient_phone: { type: 'string' },
      },
      required: ['patient_phone'],
    },
  },
];

const MAX_HISTORY_MESSAGES = 30;
const MAX_TOOL_ITERATIONS = 6;
const MODEL = 'claude-haiku-4-5-20251001';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class ClaudeService implements IClaudeService {
  private readonly anthropic: Anthropic;

  constructor(
    private readonly config: ConfigService,
    @Inject(CALENDAR_SERVICE) private readonly calendarService: ICalendarService,
    @Inject(AVAILABILITY_SERVICE) private readonly availabilityService: IAvailabilityService,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly patientRepository: PatientRepository,
    private readonly prisma: PrismaService,
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

    const systemPrompt = this.buildSystemPrompt(params.patientPhone, params.clinicId, today, tomorrow);
    const messages = this.trimHistory(params.messages);

    console.log(`🤖 [Claude] Procesando: ${messages.length} mensajes en historial`);

    let response = await this.callClaude(systemPrompt, messages);
    this.logResponse(response);

    let iteration = 0;
    let currentMessages = messages as Anthropic.MessageParam[];

    while (response.stop_reason === 'tool_use' && iteration < MAX_TOOL_ITERATIONS) {
      iteration++;
      const toolResults = await this.executeToolCalls(response, params.clinicId);

      currentMessages = [
        ...currentMessages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults },
      ];

      response = await this.callClaude(systemPrompt, currentMessages);
      this.logResponse(response, iteration);
    }

    return { reply: this.extractReply(response) };
  }

  private buildSystemPrompt(phone: string, clinicId: string, today: string, tomorrow: string): string {
    return `Eres un asistente de agendación de citas dentales.

CONTEXTO:
- Teléfono del paciente: ${phone}
- Clínica: ${clinicId}
- Fecha de hoy: ${today}
- Mañana: ${tomorrow}

FLUJO DE AGENDACIÓN (3 PASOS):
1. Recolectar datos del paciente: nombre, email, especialidad, fecha
2. Mostrar dentistas (get_dentists) → paciente elige uno
3. Mostrar horarios (get_available_slots) → paciente elige hora → AGENDAR (book_appointment)

REGLAS CRÍTICAS:
- Cuando el paciente diga una HORA (ej: "14:00", "a las 10"), DEBES llamar book_appointment INMEDIATAMENTE.
- Para get_available_slots y book_appointment, dentist_id DEBE ser el UUID que viene en la respuesta de get_dentists (formato: "ID:uuid-aqui").
- Si "hoy" → ${today}. Si "mañana" → ${tomorrow}.
- Responde en español, máximo 2 líneas.
- NO respondas con texto cuando deberías ejecutar una herramienta.`;
  }

  private trimHistory(messages: { role: string; content: string }[]): { role: string; content: string }[] {
    if (messages.length <= MAX_HISTORY_MESSAGES) return messages;
    console.log(`✂️ [Claude] Recortando historial: ${messages.length} → ${MAX_HISTORY_MESSAGES}`);
    return messages.slice(-MAX_HISTORY_MESSAGES);
  }

  private async callClaude(systemPrompt: string, messages: any): Promise<Anthropic.Message> {
    return this.anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      tools: TOOLS,
      messages,
    });
  }

  private logResponse(response: Anthropic.Message, iteration = 0): void {
    const prefix = iteration > 0 ? `🔁 [Claude iter ${iteration}]` : `📥 [Claude]`;
    console.log(`${prefix} stop_reason: ${response.stop_reason}`);
    response.content.forEach(block => {
      if (block.type === 'tool_use') {
        console.log(`${prefix} 🔧 Tool: ${block.name}, input:`, JSON.stringify(block.input));
      } else if (block.type === 'text' && block.text) {
        console.log(`${prefix} 💬 Text: ${block.text.substring(0, 150)}`);
      }
    });
  }

  private async executeToolCalls(response: Anthropic.Message, clinicId: string) {
    const toolUses = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');

    return Promise.all(
      toolUses.map(async tool => {
        try {
          const content = await this.executeTool(tool.name, tool.input as Record<string, any>, clinicId);
          return { type: 'tool_result' as const, tool_use_id: tool.id, content };
        } catch (err: any) {
          console.error(`❌ [Tool ${tool.name}] Error:`, err.message);
          return {
            type: 'tool_result' as const,
            tool_use_id: tool.id,
            content: `Error: ${err.message}`,
            is_error: true,
          };
        }
      }),
    );
  }

  private extractReply(response: Anthropic.Message): string {
    const text = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')?.text;
    return text && text.trim() ? text : '¿En qué más puedo ayudarte?';
  }

  private async executeTool(name: string, input: Record<string, any>, clinicId: string): Promise<string> {
    switch (name) {
      case 'get_dentists':
        return this.handleGetDentists(input);
      case 'get_available_slots':
        return this.handleGetAvailableSlots(input, clinicId);
      case 'book_appointment':
        return this.handleBookAppointment(input, clinicId);
      case 'get_patient_appointments':
        return this.handleGetPatientAppointments(input, clinicId);
      case 'cancel_appointment':
        return this.handleCancelAppointment(input, clinicId);
      default:
        return 'Herramienta no reconocida.';
    }
  }

  private async handleGetDentists(input: Record<string, any>): Promise<string> {
    const dentistClinics = await (this.prisma as any).dentistClinic.findMany({
      where: { clinicId: input.clinic_id, isActive: true },
      include: { dentist: { include: { dentistProfile: true } } },
    });

    if (!dentistClinics.length) return 'No hay dentistas disponibles en esta clínica.';

    const filtered = input.specialty
      ? dentistClinics.filter((dc: any) =>
          dc.dentist.dentistProfile?.specialization?.toLowerCase().includes(input.specialty.toLowerCase()),
        )
      : dentistClinics;

    if (!filtered.length) return `No hay dentistas para la especialidad "${input.specialty}".`;

    const list = filtered
      .map(
        (dc: any, idx: number) =>
          `Opción ${idx + 1}: ${dc.dentist.firstName} ${dc.dentist.lastName} - ${dc.dentist.dentistProfile?.specialization || 'N/A'}\n   dentist_id=${dc.dentist.id}`,
      )
      .join('\n\n');

    return `Dentistas disponibles:\n\n${list}\n\nIMPORTANTE: Cuando el paciente elija un dentista, usa el valor exacto de "dentist_id=" en las próximas herramientas.`;
  }

  private async handleGetAvailableSlots(input: Record<string, any>, clinicId: string): Promise<string> {
    if (!UUID_REGEX.test(input.dentist_id)) {
      return `Error: dentist_id "${input.dentist_id}" no es un UUID válido. Debes usar el valor exacto de "dentist_id=" de la respuesta anterior de get_dentists. Ejecuta get_dentists nuevamente si lo necesitas.`;
    }

    const slots = await this.availabilityService.getAvailableSlots(clinicId, input.date, input.dentist_id, 30);
    if (!slots.length) return 'No hay horarios disponibles para esa fecha.';
    return `Horarios disponibles el ${input.date}: ${slots.slice(0, 8).join(', ')}`;
  }

  private async handleBookAppointment(input: Record<string, any>, clinicId: string): Promise<string> {
    console.log(`📅 [BookAppointment] Iniciando para ${input.patient_name} - ${input.date} ${input.time}`);

    if (!UUID_REGEX.test(input.dentist_id)) {
      console.error(`❌ [BookAppointment] dentist_id inválido: "${input.dentist_id}"`);
      return `Error: dentist_id "${input.dentist_id}" no es un UUID válido. Debes usar el valor exacto de "dentist_id=" de la respuesta de get_dentists, no el nombre del dentista. Ejecuta get_dentists nuevamente para obtener los UUIDs correctos.`;
    }

    try {
      const serviceId = await this.resolveServiceId(clinicId, input.specialty);
      const patient = await this.resolvePatient(input, clinicId);

      const googleEventId = await this.calendarService.createAppointmentEvent({
        patientName: input.patient_name,
        specialty: input.specialty,
        date: input.date,
        time: input.time,
      });

      const startTime = new Date(`${input.date}T${input.time}:00`);
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

      const appointment = await this.appointmentRepository.create({
        clinicId,
        patientId: patient.id,
        dentistId: input.dentist_id,
        serviceId,
        startTime,
        endTime,
        status: 'SCHEDULED',
        channel: 'WHATSAPP',
        notes: `[Google Event: ${googleEventId}]`,
      } as any);

      console.log(`✅ [BookAppointment] Cita creada: ${appointment.id} (${input.date} ${input.time})`);

      return `✅ Cita agendada para ${input.date} a las ${input.time}`;
    } catch (err: any) {
      console.error(`❌ [BookAppointment] Error:`, err.message);
      console.error(`❌ [BookAppointment] Datos:`, {
        patient_name: input.patient_name,
        specialty: input.specialty,
        date: input.date,
        time: input.time,
        dentist_id: input.dentist_id,
      });
      throw err;
    }
  }

  private async resolveServiceId(clinicId: string, specialty: string): Promise<string | undefined> {
    const service = await (this.prisma as any).service.findFirst({
      where: { clinicId, name: { contains: specialty, mode: 'insensitive' } },
    });
    if (!service) {
      console.warn(`⚠️ [Service] No encontrado para "${specialty}"`);
      return undefined;
    }
    return service.id;
  }

  private async resolvePatient(input: Record<string, any>, clinicId: string): Promise<{ id: string }> {
    const existing = await this.patientRepository.findByPhoneAndClinic(input.patient_phone, clinicId);
    if (existing) return existing;

    const [firstName, ...rest] = (input.patient_name as string).split(' ');
    const created = await this.patientRepository.create({
      clinicId,
      firstName,
      lastName: rest.join(' ') || 'N/A',
      phone: input.patient_phone,
      email: input.patient_email,
      dateOfBirth: new Date('1990-01-01'),
      gender: 'O',
    } as any);
    console.log(`👤 [Patient] Creado: ${created.id}`);
    return created;
  }

  private async handleGetPatientAppointments(input: Record<string, any>, clinicId: string): Promise<string> {
    const appts = await this.appointmentRepository.findByPhone(input.patient_phone, clinicId);
    if (!appts?.length) return 'No tienes citas próximas agendadas.';
    const list = appts.map((a: any) => `• ${a.startTime?.toISOString()}`).join('\n');
    return `Tus próximas citas:\n${list}`;
  }

  private async handleCancelAppointment(input: Record<string, any>, clinicId: string): Promise<string> {
    const appts = await this.appointmentRepository.findByPhone(input.patient_phone, clinicId);
    if (!appts?.length) return 'No encontré citas activas para cancelar.';
    const appt = appts[0];
    await this.appointmentRepository.updateStatus(appt.id, 'CANCELLED' as any, 'Cancelado por WhatsApp');
    return `✅ Cita cancelada del ${appt.startTime?.toISOString()?.split('T')[0]}`;
  }
}
