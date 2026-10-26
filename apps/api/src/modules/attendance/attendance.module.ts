import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceGateway } from './attendance.gateway';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceGateway],
  exports: [AttendanceService],
})
export class AttendanceModule {}
