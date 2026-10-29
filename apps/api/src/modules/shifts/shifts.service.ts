import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database';
import { CreateShiftDto } from './dto/create-shift.dto';
import { QueryShiftScheduleDto } from './dto/query-shift-schedule.dto';
import { QueryShiftsDto } from './dto/query-shifts.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { CreateShiftAssignmentDto } from './dto/create-shift-assignment.dto';
import {
  addUtcCalendarDays,
  calculateShiftDurationMinutes,
  getShiftInterval,
  shiftIntervalsOverlap,
  toUtcDateOnly,
} from './shifts-time.util';
import type { JwtPayload } from '../platform/types/identity.types';
import { UserRole } from '../platform/types/identity.types';
import type {
  DeleteShiftResponse,
  PaginatedShifts,
  ShiftAssignmentResponse,
  ShiftScheduleItem,
  ShiftScheduleResponse,
  ShiftListItem,
} from './shifts.types';

const SHIFT_LIST_SELECT = {
  id: true,
  name: true,
  startTime: true,
  endTime: true,
  breakMinutes: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ShiftSelect;

type ShiftRow = Prisma.ShiftGetPayload<{ select: typeof SHIFT_LIST_SELECT }>;

const SHIFT_ASSIGNMENT_SELECT = {
  id: true,
  shiftId: true,
  employeeId: true,
  workDate: true,
  assignedById: true,
  createdAt: true,
  shift: {
    select: {
      id: true,
      name: true,
      startTime: true,
      endTime: true,
      breakMinutes: true,
      isActive: true,
    },
  },
} satisfies Prisma.ShiftAssignmentSelect;

type ShiftAssignmentRow = Prisma.ShiftAssignmentGetPayload<{
  select: typeof SHIFT_ASSIGNMENT_SELECT;
}>;

const SHIFT_SCHEDULE_SELECT = {
  id: true,
  employeeId: true,
  workDate: true,
  assignedById: true,
  createdAt: true,
  shift: {
    select: {
      id: true,
      name: true,
      startTime: true,
      endTime: true,
      breakMinutes: true,
      isActive: true,
    },
  },
} satisfies Prisma.ShiftAssignmentSelect;

type ShiftScheduleRow = Prisma.ShiftAssignmentGetPayload<{
  select: typeof SHIFT_SCHEDULE_SELECT;
}>;

function toShiftListItem(row: ShiftRow): ShiftListItem {
  return {
    id: row.id,
    name: row.name,
    startTime: row.startTime,
    endTime: row.endTime,
    breakMinutes: row.breakMinutes,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toShiftAssignmentResponse(row: ShiftAssignmentRow): ShiftAssignmentResponse {
  return {
    id: row.id,
    shiftId: row.shiftId,
    employeeId: row.employeeId,
    workDate: row.workDate.toISOString().slice(0, 10),
    assignedById: row.assignedById,
    createdAt: row.createdAt.toISOString(),
    shift: row.shift,
  };
}

function toShiftScheduleItem(row: ShiftScheduleRow, employeeName: string): ShiftScheduleItem {
  return {
    assignmentId: row.id,
    workDate: row.workDate.toISOString().slice(0, 10),
    employee: { id: row.employeeId, name: employeeName },
    shift: row.shift,
    assignedById: row.assignedById,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class ShiftsService {
  private readonly logger = new Logger(ShiftsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(query: QueryShiftsDto): Promise<PaginatedShifts> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where: Prisma.ShiftWhereInput = {};
    const search = query.q?.trim();

    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (query.status === 'active') where.isActive = true;
    if (query.status === 'inactive') where.isActive = false;

    const [total, rows] = await Promise.all([
      this.prisma.shift.count({ where }),
      this.prisma.shift.findMany({
        where,
        select: SHIFT_LIST_SELECT,
        orderBy: [{ createdAt: 'desc' }, { name: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: rows.map(toShiftListItem),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async getSchedule(
    query: QueryShiftScheduleDto,
    actor: JwtPayload,
  ): Promise<ShiftScheduleResponse> {
    if (query.from > query.to) {
      throw new BadRequestException('Ngày bắt đầu không được sau ngày kết thúc.');
    }

    try {
      const authenticatedActor = await this.prisma.user.findUnique({
        where: { id: actor.sub },
        select: { id: true, role: true, isActive: true },
      });

      if (
        !authenticatedActor ||
        !authenticatedActor.isActive ||
        authenticatedActor.role !== actor.role
      ) {
        throw new ForbiddenException('Tài khoản không có quyền xem lịch làm việc.');
      }

      let employeeIds: string[] | undefined;

      if (authenticatedActor.role === UserRole.ADMIN) {
        if (query.employeeId) employeeIds = [query.employeeId];
      } else if (authenticatedActor.role === UserRole.MANAGER) {
        if (query.employeeId === authenticatedActor.id) {
          employeeIds = [authenticatedActor.id];
        } else if (query.employeeId) {
          const employee = await this.prisma.user.findUnique({
            where: { id: query.employeeId },
            select: { id: true, managerId: true },
          });

          if (!employee) {
            throw new NotFoundException('Không tìm thấy nhân viên.');
          }

          if (employee.managerId !== authenticatedActor.id) {
            throw new ForbiddenException('Quản lý chỉ được xem lịch của chính mình và nhân viên trực tiếp.');
          }

          employeeIds = [employee.id];
        } else {
          const directReports = await this.prisma.user.findMany({
            where: { managerId: authenticatedActor.id },
            select: { id: true },
          });
          employeeIds = [authenticatedActor.id, ...directReports.map((employee) => employee.id)];
        }
      } else if (authenticatedActor.role === UserRole.EMPLOYEE) {
        if (query.employeeId && query.employeeId !== authenticatedActor.id) {
          throw new ForbiddenException('Nhân viên chỉ được xem lịch của chính mình.');
        }

        employeeIds = [authenticatedActor.id];
      } else {
        throw new ForbiddenException('Tài khoản không có quyền xem lịch làm việc.');
      }

      const where: Prisma.ShiftAssignmentWhereInput = {
        workDate: {
          gte: toUtcDateOnly(query.from),
          lte: toUtcDateOnly(query.to),
        },
      };
      if (employeeIds) where.employeeId = { in: employeeIds };

      const assignments = await this.prisma.shiftAssignment.findMany({
        where,
        select: SHIFT_SCHEDULE_SELECT,
        orderBy: [
          { workDate: 'asc' },
          { shift: { startTime: 'asc' } },
          { employeeId: 'asc' },
          { id: 'asc' },
        ],
      });

      const employeeIdsInResults = Array.from(new Set(assignments.map((row) => row.employeeId)));
      const employees = employeeIdsInResults.length > 0
        ? await this.prisma.user.findMany({
            where: { id: { in: employeeIdsInResults } },
            select: { id: true, name: true },
          })
        : [];
      const employeeNames = new Map(employees.map((employee) => [employee.id, employee.name]));
      const items = assignments.map((row) =>
        toShiftScheduleItem(row, employeeNames.get(row.employeeId) ?? ''),
      );

      items.sort(
        (left, right) =>
          left.workDate.localeCompare(right.workDate) ||
          left.shift.startTime.localeCompare(right.shift.startTime) ||
          left.employee.name.localeCompare(right.employee.name) ||
          left.assignmentId.localeCompare(right.assignmentId),
      );

      return { from: query.from, to: query.to, items, total: items.length };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logWriteError('truy vấn lịch làm việc', error);
      throw error;
    }
  }

  async create(dto: CreateShiftDto): Promise<ShiftListItem> {
    const name = dto.name.trim();
    this.assertValidShift(name, dto.startTime, dto.endTime, dto.breakMinutes);

    try {
      const created = await this.prisma.shift.create({
        data: {
          name,
          startTime: dto.startTime,
          endTime: dto.endTime,
          breakMinutes: dto.breakMinutes,
          isActive: dto.isActive ?? true,
        },
        select: SHIFT_LIST_SELECT,
      });

      return toShiftListItem(created);
    } catch (error) {
      this.logWriteError('tạo ca làm việc', error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateShiftDto): Promise<ShiftListItem> {
    const hasChanges =
      dto.name !== undefined ||
      dto.startTime !== undefined ||
      dto.endTime !== undefined ||
      dto.breakMinutes !== undefined ||
      dto.isActive !== undefined;

    if (!hasChanges) {
      throw new BadRequestException('Cần gửi ít nhất một trường để cập nhật.');
    }

    const current = await this.prisma.shift.findUnique({
      where: { id },
      select: SHIFT_LIST_SELECT,
    });

    if (!current) {
      throw new NotFoundException('Không tìm thấy ca làm việc.');
    }

    const name = dto.name === undefined ? current.name : dto.name.trim();
    const startTime = dto.startTime ?? current.startTime;
    const endTime = dto.endTime ?? current.endTime;
    const breakMinutes = dto.breakMinutes ?? current.breakMinutes;
    this.assertValidShift(name, startTime, endTime, breakMinutes);

    const data: Prisma.ShiftUpdateInput = {};
    if (dto.name !== undefined) data.name = name;
    if (dto.startTime !== undefined) data.startTime = startTime;
    if (dto.endTime !== undefined) data.endTime = endTime;
    if (dto.breakMinutes !== undefined) data.breakMinutes = breakMinutes;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    try {
      const updated = await this.prisma.shift.update({
        where: { id },
        data,
        select: SHIFT_LIST_SELECT,
      });

      return toShiftListItem(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Không tìm thấy ca làm việc.');
      }

      this.logWriteError('cập nhật ca làm việc', error);
      throw error;
    }
  }

  async delete(id: string): Promise<DeleteShiftResponse> {
    try {
      return await this.prisma.$transaction(
        async (transaction: Prisma.TransactionClient): Promise<DeleteShiftResponse> => {
          const shift = await transaction.shift.findUnique({
            where: { id },
            select: { id: true, isActive: true },
          });

          if (!shift) {
            throw new NotFoundException('Không tìm thấy ca làm việc.');
          }

          const assignmentCount = await transaction.shiftAssignment.count({
            where: { shiftId: id },
          });

          if (assignmentCount > 0) {
            if (shift.isActive) {
              await transaction.shift.update({
                where: { id },
                data: { isActive: false },
                select: { id: true },
              });
            }

            return { id, isActive: false, deleted: false };
          }

          await transaction.shift.delete({ where: { id }, select: { id: true } });
          return { id, isActive: null, deleted: true };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Không tìm thấy ca làm việc.');
        }

        if (error.code === 'P2003' || error.code === 'P2014') {
          throw new ConflictException(
            'Không thể xóa ca vì đang có lịch phân ca liên quan. Hãy thử lại để vô hiệu hóa ca.',
          );
        }

        if (error.code === 'P2034') {
          throw new ConflictException(
            'Dữ liệu phân ca vừa thay đổi. Hãy thử lại thao tác xóa ca.',
          );
        }
      }

      this.logWriteError('xóa hoặc vô hiệu hóa ca', error);
      throw error;
    }
  }

  async createAssignment(
    dto: CreateShiftAssignmentDto,
    actor: JwtPayload,
  ): Promise<ShiftAssignmentResponse> {
    const workDate = toUtcDateOnly(dto.workDate);

    try {
      return await this.prisma.$transaction(
        async (transaction: Prisma.TransactionClient): Promise<ShiftAssignmentResponse> => {
          const authenticatedActor = await transaction.user.findUnique({
            where: { id: actor.sub },
            select: { id: true, role: true, isActive: true },
          });

          if (
            !authenticatedActor ||
            !authenticatedActor.isActive ||
            authenticatedActor.role !== actor.role ||
            (authenticatedActor.role !== UserRole.ADMIN &&
              authenticatedActor.role !== UserRole.MANAGER)
          ) {
            throw new ForbiddenException('Tài khoản không có quyền phân ca.');
          }

          const shift = await transaction.shift.findUnique({
            where: { id: dto.shiftId },
            select: {
              id: true,
              name: true,
              startTime: true,
              endTime: true,
              breakMinutes: true,
              isActive: true,
            },
          });

          if (!shift) {
            throw new NotFoundException('Không tìm thấy ca làm việc.');
          }

          if (!shift.isActive) {
            throw new BadRequestException('Không thể phân nhân viên vào ca đã vô hiệu hóa.');
          }

          const employee = await transaction.user.findUnique({
            where: { id: dto.employeeId },
            select: { id: true, role: true, isActive: true, managerId: true },
          });

          if (!employee) {
            throw new NotFoundException('Không tìm thấy nhân viên.');
          }

          if (!employee.isActive) {
            throw new BadRequestException('Không thể phân ca cho tài khoản đã vô hiệu hóa.');
          }

          if (employee.role !== UserRole.EMPLOYEE) {
            throw new BadRequestException('Chỉ tài khoản EMPLOYEE được nhận ca làm việc.');
          }

          if (
            authenticatedActor.role === UserRole.MANAGER &&
            employee.managerId !== authenticatedActor.id
          ) {
            throw new ForbiddenException('Quản lý chỉ được phân ca cho nhân viên trực tiếp.');
          }

          const duplicate = await transaction.shiftAssignment.findUnique({
            where: {
              employeeId_shiftId_workDate: {
                employeeId: employee.id,
                shiftId: shift.id,
                workDate,
              },
            },
            select: { id: true },
          });

          if (duplicate) {
            throw new ConflictException('Nhân viên đã được phân ca này vào ngày đã chọn.');
          }

          const assignments = await transaction.shiftAssignment.findMany({
            where: {
              employeeId: employee.id,
              workDate: {
                gte: addUtcCalendarDays(workDate, -1),
                lte: addUtcCalendarDays(workDate, 1),
              },
            },
            select: {
              workDate: true,
              shift: { select: { startTime: true, endTime: true } },
            },
          });

          const candidateInterval = getShiftInterval(
            workDate,
            shift.startTime,
            shift.endTime,
          );
          const hasOverlap = assignments.some((assignment) =>
            shiftIntervalsOverlap(
              candidateInterval,
              getShiftInterval(
                assignment.workDate,
                assignment.shift.startTime,
                assignment.shift.endTime,
              ),
            ),
          );

          if (hasOverlap) {
            throw new ConflictException('Nhân viên đã có ca làm việc bị chồng lấn thời gian.');
          }

          const created = await transaction.shiftAssignment.create({
            data: {
              shiftId: shift.id,
              employeeId: employee.id,
              workDate,
              assignedById: authenticatedActor.id,
            },
            select: SHIFT_ASSIGNMENT_SELECT,
          });

          return toShiftAssignmentResponse(created);
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Nhân viên đã được phân ca này vào ngày đã chọn.');
        }

        if (error.code === 'P2003' || error.code === 'P2014') {
          throw new ConflictException('Ca hoặc nhân viên vừa thay đổi. Hãy tải lại và thử lại.');
        }

        if (error.code === 'P2034') {
          throw new ConflictException(
            'Lịch phân ca vừa thay đổi. Hãy tải lại lịch và thử lại thao tác.',
          );
        }
      }

      this.logWriteError('phân ca cho nhân viên', error);
      throw error;
    }
  }

  private assertValidShift(
    name: string,
    startTime: string,
    endTime: string,
    breakMinutes: number,
  ): void {
    if (name.length === 0) {
      throw new BadRequestException('Tên ca không được để trống.');
    }

    if (name.length > 100) {
      throw new BadRequestException('Tên ca tối đa 100 ký tự.');
    }

    const timeFormat = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    if (!timeFormat.test(startTime) || !timeFormat.test(endTime)) {
      throw new BadRequestException('Giờ ca phải đúng định dạng 24 giờ HH:mm.');
    }

    if (startTime === endTime) {
      throw new BadRequestException('Giờ bắt đầu và kết thúc không được trùng nhau.');
    }

    if (!Number.isInteger(breakMinutes) || breakMinutes < 0) {
      throw new BadRequestException('Thời gian nghỉ phải là số nguyên không âm.');
    }

    const duration = calculateShiftDurationMinutes(startTime, endTime);
    if (breakMinutes >= duration) {
      throw new BadRequestException('Thời gian nghỉ phải ngắn hơn tổng thời lượng ca.');
    }
  }

  private logWriteError(action: string, error: unknown): void {
    this.logger.error(
      `Không thể ${action}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
