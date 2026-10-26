'use client';

import { useAttendance } from '@/features/attendance/hooks/useAttendance';
import { WorkStatus } from '@oneops/shared-types';

export default function AttendancePage() {
  const { checkIn, isLoading, record, error } = useAttendance();

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Điểm Danh & Ca Làm Việc (Dev 1)</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Check-in xác thực mạng nội bộ và ghi nhận trạng thái
      </p>

      {error && <div style={{ color: 'var(--accent-red)', marginBottom: '1rem' }}>{error}</div>}
      {record && <div style={{ color: 'var(--accent-green)', marginBottom: '1rem' }}>Đã check-in thành công: {record.status}</div>}

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => checkIn({ type: WorkStatus.AT_OFFICE })}
          disabled={isLoading}
          style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-blue)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {isLoading ? 'Đang gửi...' : 'Tại văn phòng'}
        </button>
        <button
          onClick={() => checkIn({ type: WorkStatus.REMOTE })}
          disabled={isLoading}
          style={{ padding: '0.75rem 1.5rem', background: 'var(--border-color)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Làm Remote
        </button>
      </div>
    </div>
  );
}
