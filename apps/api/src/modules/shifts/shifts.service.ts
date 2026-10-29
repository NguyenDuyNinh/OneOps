import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database';
import { QueryShiftsDto } from './dto/query-shifts.dto';
import type { PaginatedShifts, ShiftListItem } from './shifts.types';

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
}
