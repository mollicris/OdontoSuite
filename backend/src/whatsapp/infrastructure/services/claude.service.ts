import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { IClaudeService, ClaudeToolResult } from '../interfaces/claude-service.interface';
import { ICalendarService, CALENDAR_SERVICE } from '../interfaces/calendar-service.interface';
import { AppointmentRepository } from '@appointment/infrastructure/repositories/appointment.repository';
import { PatientRepository } from '@patient/infrastructure/repositories/patient.repository';
import { PrismaService } from '@common/services/prisma.service';

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
    private readonly prisma: PrismaService,
  ) {
    this.anthropic = new Anthropic({ apiKey: this.config.get('ANTHROPIC_API_KEY')! });
  }

  async chat(params: {
    messages: { role: string; content: string }[];
    patientPhone: string;
    clinicId: string;
  }): Promise<ClaudeToolResult> {
    console.log(`🤖 [Claude] Iniciando chat para ${params.patientPhone} en clínica ${params.clinicId}`);
    console.log(`📝 [Claude] Mensajes en historial: ${params.messages.length}`);

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
    console.log(`🔄 [Claude] Llamando a API con ${messages.length} mensajes`);

    let response = await this.anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      tools: TOOLS,
      messages,
    });

    console.log(`💬 [Claude] Respuesta recibida. Stop reason: ${response.stop_reason}`);

    let loopCount = 0;
    while (response.stop_reason === 'tool_use' && loopCount < 10) {
      loopCount++;
      console.log(`🔧 [Claude] Iteración ${loopCount}: Procesando herramientas`);
      const toolUses = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
      console.log(`🔨 [Claude] Herramientas a ejecutar: ${toolUses.map(t => t.name).join(', ')}`);

      const toolResults = await Promise.all(
        toolUses.map(async tool => {
          try {
            console.log(`⚙️ [Claude] Ejecutando herramienta: ${tool.name}`);
            const content = await this.executeTool(tool.name, tool.input as Record<string, any>, params.clinicId);
            console.log(`✅ [Claude] Herramienta ${tool.name} ejecutada exitosamente`);
            return { type: 'tool_result' as const, tool_use_id: tool.id, content };
          } catch (err: any) {
            console.error(`❌ [Claude] Error en herramienta ${tool.name}:`, err.message);
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
    console.log(`📤 [Claude] Respuesta final: "${text.substring(0, 100)}..."`);
    return { reply: text };
  }

  private async executeTool(name: string, input: Record<string, any>, clinicId: string): Promise<string> {
    switch (name) {
      case 'get_dentists': {
        console.log(`🔍 [Claude] Buscando dentistas para clínica ${input.clinic_id}${input.specialty ? ` especialidad: ${input.specialty}` : ''}`);
        try {
          // Obtener IDs de dentistas a través de citas de la clínica
          const appointments = await this.prisma.appointment.findMany({
            where: { clinicId: input.clinic_id },
            select: { dentistId: true },
            distinct: ['dentistId'],
          });

          const dentistIds = appointments.map(a => a.dentistId);
          if (!dentistIds.length) {
            console.log(`✅ [Claude] Sin dentistas registrados en la clínica`);
            return 'No hay dentistas disponibles en esta clínica.';
          }

          const dentists = await this.prisma.user.findMany({
            where: { id: { in: dentistIds } },
            include: { dentistProfile: true },
          });

          // Filtrar por especialidad en la aplicación si es necesario
          let filtered = dentists;
          if (input.specialty) {
            filtered = dentists.filter((d: any) =>
              d.dentistProfile?.specialization?.toLowerCase().includes(input.specialty.toLowerCase())
            );
          }

          console.log(`✅ [Claude] Dentistas encontrados: ${filtered.length}`);
          if (!filtered.length) return 'No hay dentistas disponibles para esa especialidad.';

          const list = filtered
            .map((d: any) => `• ${d.firstName} ${d.lastName} (${d.dentistProfile?.specialization || 'Sin especialidad'}) — ID: ${d.id}`)
            .join('\n');
          return `Dentistas disponibles:\n${list}\n\nEscribe el nombre del dentista de tu preferencia.`;
        } catch (err: any) {
          console.error(`❌ [Claude] Error en get_dentists:`, err.message);
          return `Error buscando dentistas: ${err.message}`;
        }
      }

      case 'get_available_slots': {
        const slots = await this.calendarService.getAvailableSlots(input.date);
        if (!slots.length) return 'No hay horarios disponibles para esa fecha.';
        return `Horarios disponibles el ${input.date} con ese dentista:\n${slots.slice(0, 6).join(', ')}`;
      }

      case 'book_appointment': {
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

        const googleEventId = await this.calendarService.createAppointmentEvent({
          patientName: input.patient_name,
          specialty: input.specialty,
          date: input.date,
          time: input.time,
        });

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
