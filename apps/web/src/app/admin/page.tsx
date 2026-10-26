import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "OneOps | Quản trị",
  description: "Hệ thống quản trị nội bộ OneOps",
};

/** Trang chủ khu vực quản trị — điểm đến sau khi đăng nhập. */
export default function AdminHomePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] md:p-8">
        <h1 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
          OneOps
        </h1>
        <p className="text-theme-sm mt-2 text-gray-500 dark:text-gray-400">
          Hệ thống quản trị nội bộ. Hiện tại đã có module quản lý tài khoản; các module khác
          sẽ được bổ sung dần.
        </p>

        <Link
          href="/admin/users"
          className="text-theme-sm mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 font-medium text-white transition hover:bg-brand-600"
        >
          Quản lý tài khoản
        </Link>
      </div>
    </div>
  );
}
