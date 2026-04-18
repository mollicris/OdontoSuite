import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { ListClinicsUseCase } from '../application/use-cases/list-clinics.use-case';

@ApiTags('clinics')
@ApiBearerAuth('access-token')
@Controller('clinics')
@UseGuards(JwtGuard)
export class ClinicController {
  constructor(private readonly listClinicsUseCase: ListClinicsUseCase) {}

  @Get()
  @ApiOperation({ summary: 'List clinics', description: 'Get all active clinics' })
  @ApiResponse({ status: 200, description: 'Clinics retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async listClinics() {
    return this.listClinicsUseCase.execute();
  }
}
