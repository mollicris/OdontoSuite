import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  clinicId?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: {
    clinicId?: string;
    role?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }): Promise<UserResponse[]> {
    const { role, isActive, skip = 0, take = 100 } = filters;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;

    // Filter by role through the role relation (case-insensitive)
    if (role) {
      where.role = {
        name: {
          equals: role.toLowerCase(),
          mode: 'insensitive',
        },
      };
    }

    const users = await this.prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        role: true,
      },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: (user.role as any).name || 'UNKNOWN',
      isActive: user.isActive,
      clinicId: undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));
  }
}
