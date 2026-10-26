import { apiClient } from '@/shared/lib/api-client';
import { CheckInDto, AttendanceRecord } from '@oneops/shared-types';

export const attendanceApi = {
  checkIn: (dto: CheckInDto): Promise<AttendanceRecord> =>
    apiClient.post('/attendance/check-in', dto),

  getHeadcount: (): Promise<{ totalToday: number; records: any[] }> =>
    apiClient.get('/attendance/headcount'),
};
