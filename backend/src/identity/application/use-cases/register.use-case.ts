import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { RegisterDto } from '../dtos/register.dto';
import { UserEntity } from '../../domain/user.entity';
import { PrismaService } from '@common/services/prisma.service';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findByEmail(
      registerDto.email,
    );

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const patientRole = await this.prisma.role.findUnique({
      where: { name: 'patient' },
    });

    if (!patientRole) {
      throw new InternalServerErrorException(
        'Patient role not found. Please run: npm run seed',
      );
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = new UserEntity({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      phone: registerDto.phone || undefined,
      roleId: patientRole.id,
      isActive: true,
      emailVerified: false,
    } as Partial<UserEntity>);

    const user = await this.userRepository.create(newUser);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      message: 'User registered successfully. Please verify your email.',
    };
  }
}
