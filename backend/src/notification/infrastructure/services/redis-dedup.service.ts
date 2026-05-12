import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisDedupService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(RedisDedupService.name);

  constructor(private readonly config: ConfigService) {
    this.redis = new Redis({
      host: this.config.get<string>('REDIS_HOST', 'localhost'),
      port: this.config.get<number>('REDIS_PORT', 6379),
      keyPrefix: 'odontosuite:reminders:',
      lazyConnect: true,
    });

    this.redis.on('error', (err) =>
      this.logger.error('[Redis] Connection error:', err.message),
    );
  }

  async isAlreadySent(key: string): Promise<boolean> {
    try {
      const val = await this.redis.get(key);
      return val !== null;
    } catch (err) {
      this.logger.warn(`[Redis] isAlreadySent falló para ${key}, permitiendo envío`);
      return false;
    }
  }

  async markAsSent(key: string, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.set(key, '1', 'EX', ttlSeconds);
    } catch (err) {
      this.logger.warn(`[Redis] markAsSent falló para ${key}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
