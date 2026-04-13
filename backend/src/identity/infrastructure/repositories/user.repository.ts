import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { UserEntity } from '../../domain/user.entity';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapPrismaToEntity(
    data: any,
  ): Partial<UserEntity> {
    return {
      ...data,
      phone: data.phone || undefined,
      avatar: data.avatar || undefined,
    };
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const created = await this.prisma.user.create({
      data: {
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        roleId: user.roleId,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
      },
    });

    return new UserEntity(this.mapPrismaToEntity(created));
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? new UserEntity(this.mapPrismaToEntity(user)) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? new UserEntity(this.mapPrismaToEntity(user)) : null;
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const updateData = { ...data };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData as any,
    });

    return new UserEntity(this.mapPrismaToEntity(updated));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findAll(skip = 0, take = 10): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      skip,
      take,
    });

    return users.map((u) => new UserEntity(this.mapPrismaToEntity(u)));
  }
}
