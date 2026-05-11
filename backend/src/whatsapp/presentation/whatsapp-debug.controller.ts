import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '@common/services/prisma.service';

@ApiTags('whatsapp-debug')
@Controller('whatsapp-debug')
export class WhatsAppDebugController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('appointments/:phone')
  async getAppointmentsByPhone(@Param('phone') phone: string) {
    try {
      const appointments = await this.prisma.appointment.findMany({
        where: {
          patient: {
            phone,
          },
        },
        include: {
          patient: true,
          dentist: { include: { dentistProfile: true } },
          service: true,
          clinic: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const conversations = await this.prisma.whatsAppConversation.findMany({
        where: {
          patientPhone: phone,
        },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
          patient: true,
        },
        orderBy: {
          lastActivity: 'desc',
        },
      });

      return {
        phone,
        appointmentsCount: appointments.length,
        appointments: appointments.map(a => ({
          id: a.id,
          patient: `${a.patient.firstName} ${a.patient.lastName}`,
          dentist: a.dentist ? `${a.dentist.firstName} ${a.dentist.lastName}` : 'N/A',
          service: a.service?.name || 'N/A',
          startTime: a.startTime,
          status: a.status,
          createdAt: a.createdAt,
        })),
        conversationsCount: conversations.length,
        conversations: conversations.map(c => ({
          id: c.id,
          clinic: c.clinicId,
          messagesCount: c.messages.length,
          lastActivity: c.lastActivity,
          patientLinked: !!c.patientId,
          messages: c.messages.map(m => ({
            role: m.role,
            content: m.content.substring(0, 100),
            createdAt: m.createdAt,
          })),
        })),
      };
    } catch (err: any) {
      return {
        error: err.message,
        stack: err.stack,
      };
    }
  }
}
