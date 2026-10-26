'use client';

import { useState, useCallback } from 'react';
import { attendanceApi } from '../api/attendance.api';
import { CheckInDto, AttendanceRecord } from '@oneops/shared-types';

export function useAttendance() {
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkIn = useCallback(async (dto: CheckInDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await attendanceApi.checkIn(dto);
      setRecord(res);
      return res;
    } catch (err: any) {
      setError(err.message || 'Điểm danh thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { record, isLoading, error, checkIn };
}
