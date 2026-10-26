import type { ReactNode } from "react";

/**
 * Kiểu dữ liệu navigation của một bề mặt (`features/<surface>/navigation/`).
 *
 * Là file LÁ (chỉ import `react`) để mọi module có thể `import type { NavSection }`
 * mà không kéo runtime code — nhờ vậy không tạo vòng phụ thuộc:
 *
 *   navigation/generated.ts  →  <module>/nav.tsx  →  (type) navigation/types.ts
 *
 * Nội dung (`navFirst`/`navLast`) nằm ở `./base`, registry ráp tự động ở `./generated`.
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
