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
        patient_email: { type: 'string', description: 'Email del paciente para recordatorios' },
        specialty: { type: 'string' },
        dentist_id: { type: 'string', description: 'ID del dentista elegido por el paciente' },
        service_id: { type: 'string', description: 'ID del servicio correspondiente a la especialidad' },
        date: { type: 'string', description: 'YYYY-MM-DD' },
        time: { type: 'string', description: 'HH:MM' },
        clinic_id: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['patient_name', 'patient_phone', 'patient_email', 'specialty', 'dentist_id', 'date', 'time', 'clinic_id'],
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

    const systemPrompt = `SISTEMA DE AGENDACIÓN. NO ERES CHATBOT. Teléfono: ${params.patientPhone}. Clínica: ${params.clinicId}. Hoy: ${today}.

REGLA ABSOLUTA: Si ves una HORA (formato XX:XX ej: 14:00, 10:30) → EJECUTA book_appointment YA.

FLUJO:
1. NOMBRE + EMAIL + ESPECIALIDAD + FECHA → Ejecuta get_dentists(clinic_id="${params.clinicId}", specialty)
2. Paciente elige número → Ejecuta get_available_slots(date, dentist_id=UUID_DE_RESPUESTA_ANTERIOR, specialty)
3. Paciente dice HORA → **EJECUTA INMEDIATAMENTE book_appointment(patient_name, patient_phone="${params.patientPhone}", patient_email, specialty, dentist_id=UUID, date, time, clinic_id="${params.clinicId}")**

PARÁMETROS get_dentists:
- clinic_id: "${params.clinicId}"
- specialty: (la que el paciente mencionó)

PARÁMETROS get_available_slots:
- date: (YYYY-MM-DD)
- dentist_id: (extrae UUID del formato "ID:uuid-aqui" de respuesta anterior)
- specialty: (la especialidad)

PARÁMETROS book_appointment (EJECUTA CUANDO VES HORA XX:XX):
- patient_name: (el nombre que dio)
- patient_phone: "${params.patientPhone}"
- patient_email: (el email que dio)
- specialty: (la especialidad)
- dentist_id: (UUID que extrajiste)
- date: (YYYY-MM-DD)
- time: (la hora que dijo, formato HH:MM)
- clinic_id: "${params.clinicId}"

OTROS:
- CONSULTAR: "mis citas" → get_patient_appointments(patient_phone="${params.patientPhone}", clinic_id="${params.clinicId}")
- CANCELAR: "cancelar" → cancel_appointment(patient_phone="${params.patientPhone}")

**NO CONVERSACIÓN. SOLO EJECUTA HERRAMIENTAS.**
"Hoy"=${today}, "Mañana"=${tomorrow}`;

    let messages = params.messages as Anthropic.MessageParam[];

    // Limitar historial a últimos 20 mensajes para mantener contexto sin exceder rate limit
    if (messages.length > 20) {
      messages = messages.slice(-20);
      console.log(`🔄 [Claude] Historial limitado a últimos 20 mensajes (tenía ${params.messages.length})`);
    }

    console.log(`🔄 [Claude] Llamando a API con ${messages.length} mensajes`);

    let response = await this.anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      tools: TOOLS,
      messages,
    });

    let loopCount = 0;
    while (response.stop_reason === 'tool_use' && loopCount < 5) {
      loopCount++;
      const toolUses = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');

      const toolResults = await Promise.all(
        toolUses.map(async tool => {
          try {
            const content = await this.executeTool(tool.name, tool.input as Record<string, any>, params.clinicId);
            return { type: 'tool_result' as const, tool_use_id: tool.id, content };
          } catch (err: any) {
            console.error(`❌ Error en ${tool.name}:`, err.message);
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
        max_tokens: 512,
        system: systemPrompt,
        tools: TOOLS,
        messages,
      });
    }

    let text = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')?.text ?? '';

    if (!text || text.trim() === '') {
      text = '¿En qué más puedo ayudarte?';
    }

    return { reply: text };
  }

  private async executeTool(name: string, input: Record<string, any>, clinicId: string): Promise<string> {
    switch (name) {
      case 'get_dentists': {
        try {
          const dentistClinics = await (this.prisma as any).dentistClinic.findMany({
            where: { clinicId: input.clinic_id, isActive: true },
            include: { dentist: { include: { dentistProfile: true } } },
          });

          if (!dentistClinics.length) return 'No hay dentistas disponibles en esta clínica.';

          let filtered = dentistClinics;
          if (input.specialty) {
            filtered = dentistClinics.filter((dc: any) =>
              dc.dentist.dentistProfile?.specialization?.toLowerCase().includes(input.specialty.toLowerCase())
            );
          }

          if (!filtered.length) return 'No hay dentistas disponibles para esa especialidad.';

          const list = filtered
            .map((dc: any, idx: number) => `${idx + 1}. ID:${dc.dentist.id} ${dc.dentist.firstName} ${dc.dentist.lastName} (${dc.dentist.dentistProfile?.specialization || 'N/A'})`)
            .join('\n');
          return `Dentistas:\n${list}`;
        } catch (err: any) {
          return `Error: ${err.message}`;
        }
      }

      case 'get_available_slots': {
        const slots = await this.availabilityService.getAvailableSlots(
          clinicId,
          input.date,
          input.dentist_id,
          30,
        );
        if (!slots.length) return 'No hay horarios disponibles para esa fecha.';
        return `Horarios disponibles: ${slots.slice(0, 6).join(', ')}`;
      }

      case 'book_appointment': {
        try {
          console.log(`📅 [WHATSAPP] Iniciando book_appointment`);
          console.log(`📅 [WHATSAPP] Paciente: ${input.patient_name} (${input.patient_phone})`);
          console.log(`📅 [WHATSAPP] Especialidad: ${input.specialty}, Fecha: ${input.date}, Hora: ${input.time}`);

          // Buscar service_id por especialidad si no se proporciona
          let serviceId = input.service_id;
          if (!serviceId) {
            const service = await (this.prisma as any).service.findFirst({
              where: {
                clinicId,
                name: { contains: input.specialty, mode: 'insensitive' },
              },
            });
            if (service) {
              serviceId = service.id;
              console.log(`✅ [WHATSAPP] Service encontrado: ${serviceId}`);
            } else {
              console.warn(`⚠️ [WHATSAPP] Service no encontrado para especialidad: ${input.specialty}`);
            }
          }

          let patient = await this.patientRepository.findByPhoneAndClinic(input.patient_phone, clinicId);
          console.log(`👤 [WHATSAPP] Paciente búsqueda: ${patient ? 'encontrado' : 'no encontrado'}`);

          if (!patient) {
            const [firstName, ...rest] = (input.patient_name as string).split(' ');
            patient = await this.patientRepository.create({
              clinicId,
              firstName,
              lastName: rest.join(' ') || 'N/A',
              phone: input.patient_phone,
              email: input.patient_email,
              dateOfBirth: new Date('1990-01-01'),
              gender: 'O',
            } as any);
            console.log(`✅ [WHATSAPP] Paciente creado: ${patient.id}`);
          }

          const googleEventId = await this.calendarService.createAppointmentEvent({
            patientName: input.patient_name,
            specialty: input.specialty,
            date: input.date,
            time: input.time,
          });
          console.log(`✅ [WHATSAPP] Google Calendar creado: ${googleEventId}`);

          const startTime = new Date(`${input.date}T${input.time}:00`);
          const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

          console.log(`💾 [WHATSAPP] Guardando cita en BD...`);
          const appointment = await this.appointmentRepository.create({
            clinicId,
            patientId: patient.id,
            dentistId: input.dentist_id,
            serviceId,
            startTime,
            endTime,
            status: 'SCHEDULED',
            channel: 'WHATSAPP',
            notes: `${input.notes ?? ''} [Google Event: ${googleEventId}]`.trim(),
          } as any);

          console.log(`✅ [WHATSAPP] ¡CITA AGENDADA EXITOSAMENTE!`);
          console.log(`✅ [WHATSAPP] Appointment ID: ${appointment.id}`);
          console.log(`✅ [WHATSAPP] Paciente: ${appointment.patient?.firstName} ${appointment.patient?.lastName}`);
          console.log(`✅ [WHATSAPP] Fecha/Hora: ${startTime.toISOString()}`);

          return `Cita agendada ✅\n${input.date} a las ${input.time}`;
        } catch (err: any) {
          console.error(`❌ [WHATSAPP] ERROR AL AGENDAR CITA`);
          console.error(`❌ [WHATSAPP] Error: ${err.message}`);
          console.error(`❌ [WHATSAPP] Stack: ${err.stack}`);
          console.error(`❌ [WHATSAPP] Datos: `, {
            patient_name: input.patient_name,
            patient_phone: input.patient_phone,
            specialty: input.specialty,
            date: input.date,
            time: input.time,
            dentist_id: input.dentist_id,
          });
          return `Error al agendar: ${err.message}`;
        }
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
