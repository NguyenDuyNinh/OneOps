import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '../platform/types/identity.types';
import type {
  AdminUserListItem,
  PaginatedUsers,
  UpdateUserStatusResponse,
  UserStats,
} from './users.types';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { JwtAuthGuard } from '../platform/guards/jwt-auth.guard';
import { RolesGuard } from '../platform/guards/roles.guard';
import { Roles } from '../platform/decorators/roles.decorator';
import { CurrentUser } from '../platform/decorators/current-user.decorator';
import type { JwtPayload } from '../platform/types/identity.types';

/**
 * Quản lý tài khoản — toàn bộ endpoint chỉ dành cho ADMIN.
 * Controller chỉ nhận DTO, gọi service và trả response (AGENTS.md — điều 6).
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async list(@Query() query: QueryUsersDto): Promise<PaginatedUsers> {
    return this.usersService.list(query);
  }

  // Khai báo trước `:id` để "stats" không bị bắt nhầm thành id.
  @Get('stats')
  async stats(): Promise<UserStats> {
    return this.usersService.getStats();
  }

  @Get(':id')
  async detail(@Param('id') id: string): Promise<AdminUserListItem> {
    return this.usersService.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser() actor: JwtPayload,
  ): Promise<AdminUserListItem> {
    return this.usersService.create(dto, actor.sub);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: JwtPayload,
  ): Promise<AdminUserListItem> {
    return this.usersService.update(id, dto, actor.sub);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() actor: JwtPayload,
  ): Promise<UpdateUserStatusResponse> {
    return this.usersService.updateStatus(id, dto.isActive, actor.sub);
  }

  @Patch(':id/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetUserPasswordDto,
    @CurrentUser() actor: JwtPayload,
  ): Promise<void> {
    return this.usersService.resetPassword(id, dto.password, actor.sub);
  }
}
