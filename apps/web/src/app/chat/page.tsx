import Link from 'next/link';

export default function ChatPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Chat & Trung Tâm Thông Báo (Dev 3)</h1>
        <Link href="/" style={{ color: 'var(--text-muted)' }}>← Quay lại</Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', background: 'var(--bg-card)', borderRadius: '8px', minHeight: '500px', border: '1px solid var(--border-color)' }}>
        <div style={{ borderRight: '1px solid var(--border-color)', padding: '1rem' }}>
          <h3>Hội thoại</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '1rem' }}>Chưa có tin nhắn</p>
        </div>
        <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Chọn một cuộc trò chuyện để bắt đầu
        </div>
      </div>
    </div>
  );
}
