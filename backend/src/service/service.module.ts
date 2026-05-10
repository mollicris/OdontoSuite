import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { ServiceController } from './presentation/service.controller';
import { ServiceRepository } from './infrastructure/repositories/service.repository';
import { ListServicesUseCase } from './application/use-cases/list-services.use-case';

@Module({
  imports: [CommonModule],
  controllers: [ServiceController],
  providers: [ServiceRepository, ListServicesUseCase],
  exports: [ServiceRepository],
})
export class ServiceModule {}
