import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { ListServicesUseCase } from '../application/use-cases/list-services.use-case';
import type { ListServicesDto, ServiceResponseDto } from '../application/dtos/list-services.dto';

@Controller('services')
@UseGuards(JwtGuard)
export class ServiceController {
  constructor(private readonly listServicesUseCase: ListServicesUseCase) {}

  @Get()
  async list(
    @Query('clinicId') clinicId?: string,
    @Query('isActive') isActive?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<ServiceResponseDto[]> {
    const filters: ListServicesDto = {
      clinicId,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      skip: skip ? parseInt(skip, 10) : 0,
      take: take ? parseInt(take, 10) : 100,
    };

    return this.listServicesUseCase.execute(filters);
  }
}
