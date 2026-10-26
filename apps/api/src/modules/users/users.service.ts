import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { UserRole } from '../platform/types/identity.types';
import type {
  AdminUserListItem,
  PaginatedUsers,
  UpdateUserStatusResponse,
  UserStats,
} from './users.types';
import { PrismaService } from '../database';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, PASSWORD_SALT_ROUNDS } from './users.constants';

/**
 * Các cột được phép trả về cho màn hình quản trị.
 * TUYỆT ĐỐI không select `passwordHash` (AGENTS.md — điều 8).
 */
const ADMIN_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  avatarUrl: true,
  departmentId: true,
  managerId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  manager: { select: { name: true } },
} satisfies Prisma.UserSelect;

type AdminUserRow = Prisma.UserGetPayload<{ select: typeof ADMIN_USER_SELECT }>;

function toAdminUserListItem(row: AdminUserRow): AdminUserListItem {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as UserRole,
    avatarUrl: row.avatarUrl,
    departmentId: row.departmentId,
    managerId: row.managerId,
    managerName: row.manager?.name ?? null,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Rỗng hoặc null → null (bỏ gán), ngược lại giữ nguyên giá trị đã trim. */
function toNullable(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ---------------------------------------------------------------------------
  // Truy vấn cơ bản (dùng bởi module Auth)
  // ---------------------------------------------------------------------------

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Chỉ dùng cho luồng đăng nhập: cần passwordHash để so khớp.
   * Không được trả method này ra ngoài module Auth (không expose qua controller).
   */
  async findAuthUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        passwordHash: true,
        isActive: true,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Quản trị tài khoản (ADMIN)
  // ---------------------------------------------------------------------------

  async list(query: QueryUsersDto): Promise<PaginatedUsers> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
    const where = this.buildWhere(query);

    const [total, rows] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: ADMIN_USER_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: rows.map(toAdminUserListItem),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async getStats(): Promise<UserStats> {
    const [total, active, byRole] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
    ]);

    const roleCount = (role: UserRole): number =>
      byRole.find((entry) => entry.role === role)?._count._all ?? 0;

    return {
      total,
      active,
      inactive: total - active,
      admins: roleCount(UserRole.ADMIN),
      managers: roleCount(UserRole.MANAGER),
      employees: roleCount(UserRole.EMPLOYEE),
    };
  }

  async getById(id: string): Promise<AdminUserListItem> {
    const row = await this.prisma.user.findUnique({
      where: { id },
      select: ADMIN_USER_SELECT,
    });

    if (!row) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    return toAdminUserListItem(row);
  }

  async create(dto: CreateUserDto, actorId: string): Promise<AdminUserListItem> {
    const email = dto.email.trim().toLowerCase();
    await this.assertEmailAvailable(email);
    if (dto.managerId) await this.assertManagerExists(dto.managerId, null);

    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);

    try {
      const created = await this.prisma.user.create({
        data: {
          email,
          name: dto.name.trim(),
          role: dto.role,
          passwordHash,
          avatarUrl: toNullable(dto.avatarUrl),
          departmentId: toNullable(dto.departmentId),
          managerId: toNullable(dto.managerId),
          isActive: dto.isActive ?? true,
        },
        select: ADMIN_USER_SELECT,
      });

      this.logger.log(`Admin ${actorId} đã tạo tài khoản ${created.email} (${created.role})`);
      this.eventEmitter.emit('user.created', {
        userId: created.id,
        email: created.email,
        role: created.role,
        actorId,
      });

      return toAdminUserListItem(created);
    } catch (error) {
      throw this.mapWriteError(error, email);
    }
  }

  async update(id: string, dto: UpdateUserDto, actorId: string): Promise<AdminUserListItem> {
    const current = await this.findCurrentState(id);

    const changesProfile =
      dto.name !== undefined ||
      dto.avatarUrl !== undefined ||
      dto.departmentId !== undefined ||
      dto.managerId !== undefined;
    const changesRole = dto.role !== undefined && dto.role !== current.role;

    if (!changesProfile && !changesRole) {
      throw new BadRequestException('Không có thay đổi nào để cập nhật.');
    }

    if (dto.managerId !== undefined) {
      if (dto.managerId === id) {
        throw new BadRequestException('Không thể chọn chính mình làm quản lý trực tiếp.');
      }
      if (dto.managerId) await this.assertManagerExists(dto.managerId, id);
    }

    if (changesRole) {
      if (id === actorId) {
        throw new BadRequestException('Không thể tự thay đổi vai trò của chính mình.');
      }
      if (current.role === UserRole.ADMIN && current.isActive) {
        await this.assertNotLastActiveAdmin(id, 'đổi vai trò của');
      }
    }

    const data: Prisma.UserUncheckedUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.avatarUrl !== undefined) data.avatarUrl = toNullable(dto.avatarUrl);
    if (dto.departmentId !== undefined) data.departmentId = toNullable(dto.departmentId);
    if (dto.managerId !== undefined) data.managerId = toNullable(dto.managerId);
    if (changesRole && dto.role !== undefined) data.role = dto.role;

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: ADMIN_USER_SELECT,
    });

    this.logger.log(`Admin ${actorId} đã cập nhật tài khoản ${updated.email}`);
    this.eventEmitter.emit('user.updated', {
      userId: updated.id,
      role: updated.role,
      actorId,
    });

    return toAdminUserListItem(updated);
  }

  async updateStatus(
    id: string,
    isActive: boolean,
    actorId: string,
  ): Promise<UpdateUserStatusResponse> {
    const current = await this.findCurrentState(id);

    if (current.isActive === isActive) {
      return { id, isActive };
    }

    if (!isActive) {
      if (id === actorId) {
        throw new BadRequestException(
          'Không thể vô hiệu hoá tài khoản đang đăng nhập của chính mình.',
        );
      }
      if (current.role === UserRole.ADMIN) {
        await this.assertNotLastActiveAdmin(id, 'vô hiệu hoá');
      }
    }

    await this.prisma.user.update({ where: { id }, data: { isActive }, select: { id: true } });

    this.logger.log(
      `Admin ${actorId} đã ${isActive ? 'kích hoạt' : 'vô hiệu hoá'} tài khoản ${current.email}`,
    );
    this.eventEmitter.emit('user.status_changed', { userId: id, isActive, actorId });

    return { id, isActive };
  }

  async resetPassword(id: string, password: string, actorId: string): Promise<void> {
    const current = await this.findCurrentState(id);
    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

    await this.prisma.user.update({ where: { id }, data: { passwordHash }, select: { id: true } });

    this.logger.log(`Admin ${actorId} đã đặt lại mật khẩu cho tài khoản ${current.email}`);
    this.eventEmitter.emit('user.password_reset', { userId: id, actorId });
  }

  // ---------------------------------------------------------------------------
  // Nội bộ
  // ---------------------------------------------------------------------------

  private buildWhere(query: QueryUsersDto): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};
    const search = query.q?.trim();

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (query.role) where.role = query.role;
    if (query.status === 'active') where.isActive = true;
    if (query.status === 'inactive') where.isActive = false;

    return where;
  }

  private async findCurrentState(id: string) {
    const current = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!current) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    return current;
  }

  private async assertEmailAvailable(email: string): Promise<void> {
    const existing = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Email đã được sử dụng bởi tài khoản khác.');
    }
  }

  private async assertManagerExists(managerId: string, selfId: string | null): Promise<void> {
    if (selfId && managerId === selfId) {
      throw new BadRequestException('Không thể chọn chính mình làm quản lý trực tiếp.');
    }

    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      select: { id: true },
    });

    if (!manager) {
      throw new BadRequestException('Quản lý trực tiếp không tồn tại.');
    }
  }

  /** Chặn thao tác khiến hệ thống không còn quản trị viên nào đang hoạt động. */
  private async assertNotLastActiveAdmin(excludeId: string, action: string): Promise<void> {
    const remaining = await this.prisma.user.count({
      where: { role: UserRole.ADMIN, isActive: true, id: { not: excludeId } },
    });

    if (remaining === 0) {
      throw new BadRequestException(
        `Không thể ${action} quản trị viên đang hoạt động cuối cùng của hệ thống.`,
      );
    }
  }

  /** Dịch lỗi ràng buộc của Prisma sang HTTP exception có thông báo tiếng Việt. */
  private mapWriteError(error: unknown, email: string): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ConflictException('Email đã được sử dụng bởi tài khoản khác.');
    }

    this.logger.error(
      `Ghi dữ liệu tài khoản thất bại (email=${email}): ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return error;
  }
}
