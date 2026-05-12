import { Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { LoggerService } from './services/logger.service';

@Module({
  providers: [PrismaService, LoggerService],
  exports: [PrismaService, LoggerService],
})
export class CommonModule {}
