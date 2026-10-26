import { redirect } from "next/navigation";

/**
 * Trang gốc của site.
 * Toàn bộ giao diện quản trị đã chuyển xuống `/admin`, nên `/` chỉ làm nhiệm vụ
 * điều hướng — giữ cho link/bookmark cũ không bị 404.
 */
export default function RootPage() {
  redirect("/admin");
}
