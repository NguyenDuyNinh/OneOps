import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceGateway } from './attendance.gateway';
import { PrismaService } from '../../core/prisma.service';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceGateway, PrismaService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
