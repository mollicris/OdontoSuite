import { Injectable, Logger } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService {
  private logger: Logger;
  private winstonLogger: winston.Logger;

  constructor() {
    this.logger = new Logger();

    this.winstonLogger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
      defaultMeta: { service: 'odontosuite-backend' },
      transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      this.winstonLogger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
              return `${timestamp} [${level}]: ${message} ${metaStr}`;
            }),
          ),
        }),
      );
    }
  }

  log(message: string, meta?: any) {
    this.winstonLogger.info(message, meta);
    this.logger.log(message);
  }

  error(message: string, error?: any, meta?: any) {
    this.winstonLogger.error(message, { error: error?.message, stack: error?.stack, ...meta });
    this.logger.error(message, error?.stack);
  }

  warn(message: string, meta?: any) {
    this.winstonLogger.warn(message, meta);
    this.logger.warn(message);
  }

  debug(message: string, meta?: any) {
    this.winstonLogger.debug(message, meta);
    this.logger.debug(message);
  }

  // Logs específicos de BD
  logDatabaseOperation(operation: string, entity: string, data: any, duration?: number) {
    this.log(`[DB] ${operation} ${entity}`, {
      operation,
      entity,
      duration: `${duration}ms`,
      ...data,
    });
  }

  logDatabaseError(operation: string, entity: string, error: any, data?: any) {
    this.error(`[DB ERROR] ${operation} ${entity} failed`, error, {
      operation,
      entity,
      ...data,
    });
  }

  // Logs específicos de notificaciones
  logNotificationSent(channel: string, recipient: string, type: string, meta?: any) {
    this.log(`[NOTIFICATION] ${channel.toUpperCase()} sent to ${recipient}`, {
      channel,
      recipient,
      type,
      ...meta,
    });
  }

  logNotificationError(channel: string, recipient: string, error: any, meta?: any) {
    this.error(`[NOTIFICATION ERROR] Failed to send ${channel} to ${recipient}`, error, {
      channel,
      recipient,
      ...meta,
    });
  }

  // Logs específicos de citas
  logAppointmentCreated(appointmentId: string, channel: string, patientId: string, meta?: any) {
    this.log(`[APPOINTMENT] Created from ${channel}`, {
      appointmentId,
      channel,
      patientId,
      ...meta,
    });
  }

  logAppointmentError(operation: string, error: any, appointmentId?: string, meta?: any) {
    this.error(`[APPOINTMENT] ${operation} failed`, error, {
      appointmentId,
      ...meta,
    });
  }
}
