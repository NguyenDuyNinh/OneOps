import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../database';
import { CheckInDto } from './dto/check-in.dto';
import { WorkStatus, CheckInLabel } from './attendance.types';
import type { AttendanceCheckedInEvent } from './attendance.types';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async checkIn(userId: string, dto: CheckInDto, clientIp: string) {
    if (dto.type === WorkStatus.AT_OFFICE) {
      this.validateOfficeIp(clientIp);
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existing = await this.prisma.attendance.findFirst({
      where: {
        userId,
        checkedInAt: { gte: todayStart },
      },
    });

    if (existing) {
      throw new BadRequestException('Bạn đã thực hiện điểm danh hôm nay.');
    }

    const now = new Date();
    const isLate = now.getHours() > 7 || (now.getHours() === 7 && now.getMinutes() > 55);

    const record = await this.prisma.attendance.create({
      data: {
        userId,
        status: dto.type,
        checkedInAt: now,
        clientIp,
        checkInLabel: isLate ? CheckInLabel.LATE : CheckInLabel.ON_TIME,
        note: dto.note,
        workLocation: dto.workLocation,
      },
    });

    // Cross-module notification thông qua Event — KHÔNG import NotificationService
    const event: AttendanceCheckedInEvent = {
      userId,
      attendanceId: record.id,
      status: record.status,
      checkedInAt: record.checkedInAt,
    };
    this.eventEmitter.emit('attendance.checked_in', event);

    this.logger.log(`User ${userId} checked in with status ${record.status}`);
    return record;
  }

  async getHeadcount() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const records = await this.prisma.attendance.findMany({
      where: { checkedInAt: { gte: todayStart } },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return {
      totalToday: records.length,
      records,
    };
  }

  private validateOfficeIp(clientIp: string) {
    const allowedIps = (process.env.OFFICE_ALLOWED_IPS || '127.0.0.1,::1').split(',');
    const isAllowed = allowedIps.some((ip) => clientIp.includes(ip.trim()));
    if (!isAllowed && process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Bạn không kết nối wifi/IP văn phòng.');
    }
  }
}
