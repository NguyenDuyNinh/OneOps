import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database';
import { CreateShiftDto } from './dto/create-shift.dto';
import { QueryShiftsDto } from './dto/query-shifts.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { calculateShiftDurationMinutes } from './shifts-time.util';
import type { DeleteShiftResponse, PaginatedShifts, ShiftListItem } from './shifts.types';

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
