import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>OneOps Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Hệ thống điều hành công việc, quân số và trao đổi nội bộ
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link href="/attendance" style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-blue)', borderRadius: '8px' }}>
          Điểm Danh (Dev 1)
        </Link>
        <Link href="/tasks" style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-green)', borderRadius: '8px' }}>
          Quản Lý Task (Dev 2)
        </Link>
        <Link href="/chat" style={{ padding: '0.75rem 1.5rem', background: 'var(--border-color)', borderRadius: '8px' }}>
          Chat & Thông Báo (Dev 3)
        </Link>
      </div>
    </main>
  );
}
