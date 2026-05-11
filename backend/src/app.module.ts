import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CommonModule } from './common/common.module';
import { IdentityModule } from './identity/identity.module';
import { PatientModule } from './patient/patient.module';
import { AppointmentModule } from './appointment/appointment.module';
import { TreatmentModule } from './treatment/treatment.module';
import { BillingModule } from './billing/billing.module';
import { ClinicModule } from './clinic/clinic.module';
import { ServiceModule } from './service/service.module';
import { ReportingModule } from './reporting/reporting.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    CommonModule,
    IdentityModule,
    PatientModule,
    AppointmentModule,
    TreatmentModule,
    BillingModule,
    ClinicModule,
    ServiceModule,
    ReportingModule,
    WhatsAppModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
