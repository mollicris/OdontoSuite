import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { CommonModule } from '@common/common.module';
import { AuthController } from './presentation/auth.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

@Module({
  imports: [
    CommonModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION', '24h'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    UserRepository,
    JwtStrategy,
  ],
  exports: [UserRepository, JwtModule],
})
export class IdentityModule {}
