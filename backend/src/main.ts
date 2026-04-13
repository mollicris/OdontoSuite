import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3000;

  app.use(helmet());

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('OdontoSuite API')
    .setDescription('Dental clinic management system API')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('patients', 'Patient management')
    .addTag('appointments', 'Appointment scheduling')
    .addTag('treatments', 'Treatment records')
    .addTag('billing', 'Billing & invoicing')
    .addTag('clinic', 'Clinic management')
    .addTag('reporting', 'Reports & analytics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port, () => {
    console.log(`🚀 OdontoSuite API running on port ${port}`);
    console.log(`📚 Swagger UI: http://localhost:${port}/docs`);
  });
}

bootstrap();
