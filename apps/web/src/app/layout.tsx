import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'OneOps — Nền Tảng Vận Hành Hợp Nhất',
  description: 'Quản lý điểm danh, phân công nhiệm vụ và kết nối trao đổi nội bộ.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
