import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = 'Internal server error';
    let errors = undefined;

    if (typeof exceptionResponse === 'object') {
      const objResponse = exceptionResponse as any;
      message = objResponse.message || message;
      errors = objResponse.error;
    }

    this.logger.error(
      `HTTP Exception: ${status} - ${message}`,
      exception.stack,
    );

    response.status(status).json({
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}
