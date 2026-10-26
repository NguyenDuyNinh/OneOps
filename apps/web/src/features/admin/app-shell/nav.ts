import type { ReactNode } from "react";

/**
 * Kiểu dữ liệu navigation của khung quản trị.
 *
 * Tách khỏi `nav-base.tsx` (nội dung) và khỏi các module (`features/admin/<module>/nav.tsx`)
 * để 17 người có thể thêm màn hình mà **không sửa chung một file**: mỗi module tự khai
 * báo section của mình, `scripts/gen-nav.mjs` ráp lại thành `nav.generated.ts`.
 */

export type SubMenuItem = {
  name: string;
  path: string;
  icon?: ReactNode;
  pro?: boolean;
  new?: boolean;
};

export type NavSection = {
  /** Tên nhóm — hiển thị dưới icon ở rail + làm chú thích khi hover. */
  name: string;
  icon: ReactNode;
  /** Trang chính của nhóm — BẤM icon là vào thẳng trang này. */
  path: string;
  /** Các trang con — hiển thị trong panel khi bấm nút mở rộng đáy rail. */
  items?: SubMenuItem[];
};
