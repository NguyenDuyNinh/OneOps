import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { JwtAuthGuard } from '../platform/guards/jwt-auth.guard';
import { CurrentUser } from '../platform/decorators/current-user.decorator';
import type { JwtPayload } from '../platform/types/identity.types';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  async checkIn(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CheckInDto,
    @Req() req: any,
  ) {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    return this.attendanceService.checkIn(user.sub, dto, String(clientIp));
  }

  @Get('headcount')
  async getHeadcount() {
    return this.attendanceService.getHeadcount();
  }
}
