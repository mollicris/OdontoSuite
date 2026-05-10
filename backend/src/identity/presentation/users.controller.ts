import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { ListUsersUseCase, type UserResponse } from '../application/use-cases/list-users.use-case';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private readonly listUsersUseCase: ListUsersUseCase) {}

  @Get()
  async list(
    @Query('clinicId') clinicId?: string,
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<UserResponse[]> {
    return this.listUsersUseCase.execute({
      clinicId,
      role,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      skip: skip ? parseInt(skip, 10) : 0,
      take: take ? parseInt(take, 10) : 100,
    });
  }
}
