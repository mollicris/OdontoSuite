import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from '../application/dtos/login.dto';
import { RegisterDto } from '../application/dtos/register.dto';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { JwtGuard } from '@common/guards/jwt.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'User login', description: 'Authenticate user and get JWT token' })
  @ApiResponse({ status: 200, description: 'Login successful. Returns JWT token.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration', description: 'Create a new user account' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Email already registered.' })
  async register(@Body() registerDto: RegisterDto) {
    return this.registerUseCase.execute(registerDto);
  }

  @Post('me')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user', description: 'Get authenticated user information' })
  @ApiResponse({ status: 200, description: 'User info retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getCurrentUser(@CurrentUser() user: any) {
    return {
      id: user.sub,
      email: user.email,
      roleId: user.roleId,
    };
  }
}
