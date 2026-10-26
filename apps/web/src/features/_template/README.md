# Module Template — Mẫu Vertical Slice (Frontend)

Copy thư mục này thành `apps/web/src/features/{admin|employee}/<tên-domain-số-ít-kebab-case>/`, rồi:

1. Chọn **bề mặt**: `admin` nếu là màn hình quản trị (route `/admin/*`), `employee` nếu là màn hình nhân viên.
2. Đặt tên domain module (VD: `orders`, `products`, `customers`).
3. Tùy biến UI trong `components/`, logic trong `hooks/`, gọi API trong `api/`, server actions trong `actions/`.
   - Component UI dùng lại (Button, Modal, Table...) → **copy** từ `features/_template/ui/` vào `<module>/ui/` của bạn
     (xem `features/_template/ui/README.md`). Không import UI của module khác.
4. Đăng ký route: tạo `apps/web/src/app/admin/<tên-domain>/page.tsx` (bề mặt admin) hoặc `apps/web/src/app/(employee)/<tên-domain>/page.tsx`, import từ `@/features/<surface>/<tên-domain>`. Mọi trang dưới `/admin` đã được bảo vệ bởi `apps/web/src/app/admin/layout.tsx`.
5. Đăng ký menu: tạo `nav.tsx` **trong thư mục module** và export `<tênModule>Nav` (xem `features/admin/users/nav.tsx`), rồi chạy `pnpm nav:gen`. Không sửa file menu chung nào — registry được sinh tự động.

## Cấu trúc chuẩn 1 vertical slice

```text
features/<surface>/<domain>/
├── ui/            # UI riêng module — COPY từ features/_template/ui (Button, Modal, Table...)
├── components/    # UI nghiệp vụ riêng domain (UsersTable, UserFormModal...)
├── hooks/         # hooks riêng domain (useXxx.ts)
├── api/           # API client calls (dùng `api` từ @/features/auth)
├── actions/       # Server actions ("use server" + zod safeParse)
├── types.ts       # Type chỉ dùng trong module (bản riêng của bề mặt này)
├── constants.ts   # Hằng số riêng module
└── index.ts       # ★ Public API — bên ngoài chỉ import từ đây
```

## Nguyên tắc phụ thuộc

- `features/admin/*` **KHÔNG** import `features/employee/*` và ngược lại.
- Dùng chung giữa 2 bề mặt: **copy** sang bề mặt kia (chấp nhận lặp).
- Hạ tầng kỹ thuật thuần (HTTP client, session, hằng số API, `UserRole`) lấy từ `features/auth/`.
- **UI: mỗi module một bản riêng** trong `<module>/ui/`, copy từ `features/_template/ui/`. Không import
  `@/features/<module-khác>/ui/...` — CI (`pnpm lint:structure`) sẽ chặn.
- Kiểm tra "style trôi": `pnpm ui:drift` — so mọi bản copy với bộ mẫu, báo bản nào đã lệch.
- Khung quản trị: `features/admin/app-shell/*` (hạ tầng bề mặt, dùng được, không sửa nếu không phải owner).
- Không có `features/shared`.
