import Link from 'next/link';

export default function TasksPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Bảng Kanban & Quản Lý Công Việc (Dev 2)</h1>
          <p style={{ color: 'var(--text-muted)' }}>Máy trạng thái 7 bước và theo dõi deadline</p>
        </div>
        <Link href="/" style={{ color: 'var(--text-muted)' }}>← Quay lại</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        {['Cần làm', 'Đang làm', 'Chờ kiểm tra', 'Làm lại', 'Hoàn thành'].map((col) => (
          <div key={col} style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', minHeight: '400px' }}>
            <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>{col}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '1rem' }}>Chưa có task</p>
          </div>
        ))}
      </div>
    </div>
  );
}
