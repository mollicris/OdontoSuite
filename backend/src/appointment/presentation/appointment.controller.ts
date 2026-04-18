import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateAppointmentDto } from '../application/dtos/create-appointment.dto';
import { UpdateAppointmentDto } from '../application/dtos/update-appointment.dto';
import { CreateAppointmentUseCase } from '../application/use-cases/create-appointment.use-case';
import { ListAppointmentsUseCase } from '../application/use-cases/list-appointments.use-case';
import { UpdateAppointmentUseCase } from '../application/use-cases/update-appointment.use-case';
import { CheckAppointmentAvailabilityUseCase } from '../application/use-cases/check-availability.use-case';
import { AppointmentRepository } from '../infrastructure/repositories/appointment.repository';
import { JwtGuard } from '@common/guards/jwt.guard';

@ApiTags('appointments')
@ApiBearerAuth('access-token')
@Controller('appointments')
@UseGuards(JwtGuard)
export class AppointmentController {
  constructor(
    private readonly createAppointmentUseCase: CreateAppointmentUseCase,
    private readonly listAppointmentsUseCase: ListAppointmentsUseCase,
    private readonly updateAppointmentUseCase: UpdateAppointmentUseCase,
    private readonly checkAvailabilityUseCase: CheckAppointmentAvailabilityUseCase,
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  @Post()
  async createAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.createAppointmentUseCase.execute(createAppointmentDto);
  }

  @Get()
  async listAppointments(
    @Query('clinicId') clinicId: string,
    @Query('date') date?: string,
    @Query('status') status?: string,
    @Query('dentistId') dentistId?: string,
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ) {
    return this.listAppointmentsUseCase.execute({
      clinicId,
      date,
      status: status as any,
      dentistId,
      skip: Number(skip),
      take: Number(take),
    });
  }

  @Get('check-availability')
  async checkAvailability(
    @Query('clinicId') clinicId: string,
    @Query('dentistId') dentistId: string,
    @Query('serviceId') serviceId: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    const result = await this.checkAvailabilityUseCase.execute({
      clinicId,
      dentistId,
      serviceId,
      startTime,
      endTime,
    });
    return { data: result };
  }

  @Get(':id')
  async getAppointment(@Param('id') id: string) {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    return this.mapToResponseDto(appointment);
  }

  @Patch(':id')
  async updateAppointment(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.updateAppointmentUseCase.execute(id, updateAppointmentDto);
  }

  @Patch(':id/cancel')
  async cancelAppointment(
    @Param('id') id: string,
    @Body() body: { cancelReason?: string },
  ) {
    return this.updateAppointmentUseCase.execute(id, {
      status: 'CANCELLED' as any,
      cancelReason: body.cancelReason,
    });
  }

  private mapToResponseDto(appointment: any) {
    return {
      id: appointment.id,
      clinicId: appointment.clinicId,
      patientId: appointment.patientId,
      patientName: appointment.patient
        ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
        : '',
      dentistId: appointment.dentistId,
      dentistName: appointment.dentist
        ? `${appointment.dentist.firstName} ${appointment.dentist.lastName}`
        : '',
      serviceId: appointment.serviceId,
      serviceName: appointment.service ? appointment.service.name : '',
      serviceDuration: appointment.service ? appointment.service.duration : 0,
      startTime: appointment.startTime.toISOString(),
      endTime: appointment.endTime.toISOString(),
      status: appointment.status,
      notes: appointment.notes,
      cancelReason: appointment.cancelReason,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    };
  }
}
