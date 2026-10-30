import Link from "next/link";
export default function NotFound() {
  return (
    <section className="empty-state">
      <h1>Không tìm thấy trang</h1>
      <p>Đường dẫn này không có trong hệ thống.</p>
      <Link className="button primary" href="/home">
        Về trang chủ
      </Link>
    </section>
  );
}
