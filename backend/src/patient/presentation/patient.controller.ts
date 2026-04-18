import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreatePatientDto } from '../application/dtos/create-patient.dto';
import { UpdatePatientDto } from '../application/dtos/update-patient.dto';
import { CreatePatientUseCase } from '../application/use-cases/create-patient.use-case';
import { UpdatePatientUseCase } from '../application/use-cases/update-patient.use-case';
import { PatientRepository } from '../infrastructure/repositories/patient.repository';
import { JwtGuard } from '@common/guards/jwt.guard';

@ApiTags('patients')
@ApiBearerAuth('access-token')
@Controller('patients')
@UseGuards(JwtGuard)
export class PatientController {
  constructor(
    private readonly createPatientUseCase: CreatePatientUseCase,
    private readonly updatePatientUseCase: UpdatePatientUseCase,
    private readonly patientRepository: PatientRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create patient', description: 'Create a new patient record' })
  @ApiResponse({ status: 201, description: 'Patient created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid patient data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createPatient(@Body() createPatientDto: CreatePatientDto) {
    return this.createPatientUseCase.execute(createPatientDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID', description: 'Retrieve patient information by ID' })
  @ApiParam({ name: 'id', description: 'Patient ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Patient found.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getPatient(@Param('id') id: string) {
    const patient = await this.patientRepository.findById(id);
    return patient;
  }

  @Get()
  @ApiOperation({ summary: 'List patients', description: 'Get paginated list of patients in a clinic' })
  @ApiQuery({ name: 'clinicId', required: true, description: 'Clinic ID', example: 'clinic-1' })
  @ApiQuery({ name: 'skip', required: false, description: 'Number of records to skip', example: 0 })
  @ApiQuery({ name: 'take', required: false, description: 'Number of records to retrieve', example: 10 })
  @ApiResponse({ status: 200, description: 'Patients retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async listPatients(
    @Query('clinicId') clinicId: string,
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ) {
    const patients = await this.patientRepository.findByClinic(
      clinicId,
      Number(skip),
      Number(take),
    );
    return patients;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update patient', description: 'Update patient information' })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Patient updated successfully.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updatePatient(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.updatePatientUseCase.execute({
      patientId: id,
      ...updatePatientDto,
    });
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate patient', description: 'Mark patient as inactive (soft delete)' })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Patient deactivated successfully.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async deactivatePatient(@Param('id') id: string) {
    return this.updatePatientUseCase.execute({
      patientId: id,
      isActive: false,
    });
  }
}
