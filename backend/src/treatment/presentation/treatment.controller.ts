import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateTreatmentUseCase } from '../application/use-cases/create-treatment.use-case';
import { GetTreatmentUseCase } from '../application/use-cases/get-treatment.use-case';
import { ListTreatmentsUseCase } from '../application/use-cases/list-treatments.use-case';
import { UpdateTreatmentUseCase } from '../application/use-cases/update-treatment.use-case';
import { DeleteTreatmentUseCase } from '../application/use-cases/delete-treatment.use-case';
import { CreateTreatmentDto } from '../application/dtos/create-treatment.dto';
import { UpdateTreatmentDto } from '../application/dtos/update-treatment.dto';
import { JwtGuard } from '@common/guards/jwt.guard';

@ApiTags('treatments')
@ApiBearerAuth('access-token')
@Controller('treatments')
@UseGuards(JwtGuard)
export class TreatmentController {
  constructor(
    private readonly createTreatmentUseCase: CreateTreatmentUseCase,
    private readonly getTreatmentUseCase: GetTreatmentUseCase,
    private readonly listTreatmentsUseCase: ListTreatmentsUseCase,
    private readonly updateTreatmentUseCase: UpdateTreatmentUseCase,
    private readonly deleteTreatmentUseCase: DeleteTreatmentUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create treatment', description: 'Create a new treatment record' })
  @ApiResponse({ status: 201, description: 'Treatment created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid treatment data.' })
  async createTreatment(@Body() createTreatmentDto: CreateTreatmentDto) {
    return this.createTreatmentUseCase.execute(createTreatmentDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List treatments by patient',
    description: 'Get paginated list of treatments for a patient with optional filters',
  })
  @ApiResponse({ status: 200, description: 'Treatments retrieved successfully.' })
  async listTreatments(
    @Query('patientId') patientId: string,
    @Query('status') status?: string,
    @Query('serviceId') serviceId?: string,
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ) {
    return this.listTreatmentsUseCase.execute({
      patientId,
      status: status || undefined,
      serviceId: serviceId || undefined,
      skip: Number(skip),
      take: Number(take),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get treatment by ID', description: 'Retrieve treatment details' })
  @ApiResponse({ status: 200, description: 'Treatment found.' })
  @ApiResponse({ status: 404, description: 'Treatment not found.' })
  async getTreatment(@Param('id') id: string) {
    return this.getTreatmentUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update treatment', description: 'Update treatment information' })
  @ApiResponse({ status: 200, description: 'Treatment updated successfully.' })
  @ApiResponse({ status: 404, description: 'Treatment not found.' })
  async updateTreatment(
    @Param('id') id: string,
    @Body() updateTreatmentDto: UpdateTreatmentDto,
  ) {
    return this.updateTreatmentUseCase.execute(id, updateTreatmentDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change treatment status', description: 'Update the status of a treatment' })
  @ApiResponse({ status: 200, description: 'Status updated successfully.' })
  async changeTreatmentStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.updateTreatmentUseCase.execute(id, { status: body.status });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete treatment', description: 'Soft-delete a treatment (mark as CANCELLED)' })
  @ApiResponse({ status: 200, description: 'Treatment deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Treatment not found.' })
  @ApiResponse({ status: 400, description: 'Cannot delete a completed treatment.' })
  async deleteTreatment(@Param('id') id: string) {
    return this.deleteTreatmentUseCase.execute(id);
  }
}
