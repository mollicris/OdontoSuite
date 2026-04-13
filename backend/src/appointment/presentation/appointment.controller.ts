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
import { CreateAppointmentDto } from '../application/dtos/create-appointment.dto';
import { CreateAppointmentUseCase } from '../application/use-cases/create-appointment.use-case';
import { AppointmentRepository } from '../infrastructure/repositories/appointment.repository';
import { JwtGuard } from '@common/guards/jwt.guard';
import { AppointmentStatus } from '../domain/appointment.entity';

@Controller('appointments')
@UseGuards(JwtGuard)
export class AppointmentController {
  constructor(
    private readonly createAppointmentUseCase: CreateAppointmentUseCase,
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  @Post()
  async createAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.createAppointmentUseCase.execute(createAppointmentDto);
  }

  @Get(':id')
  async getAppointment(@Param('id') id: string) {
    const appointment = await this.appointmentRepository.findById(id);
    return appointment;
  }

  @Get('patient/:patientId')
  async getPatientAppointments(
    @Param('patientId') patientId: string,
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ) {
    const appointments =
      await this.appointmentRepository.findByPatient(
        patientId,
        Number(skip),
        Number(take),
      );
    return appointments;
  }

  @Patch(':id/status')
  async updateAppointmentStatus(
    @Param('id') id: string,
    @Body() body: { status: AppointmentStatus; cancelReason?: string },
  ) {
    const appointment = await this.appointmentRepository.updateStatus(
      id,
      body.status,
      body.cancelReason,
    );
    return appointment;
  }
}
