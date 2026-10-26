# Module Template — Mẫu Vertical Slice (Frontend)

Copy thư mục này thành `apps/web/src/features/<tên-domain-số-ít-kebab-case>/`, rồi:

1. Đặt tên domain module (VD: `orders`, `products`, `customers`).
2. Tùy biến UI trong `components/`, logic trong `hooks/`, gọi API trong `api/`, server actions trong `actions/`.
3. Đăng ký route: tạo `apps/web/src/app/admin/<tên-domain>/page.tsx` import từ `@/features/<tên-domain>` (mọi trang quản trị nằm dưới tiền tố `/admin` và được bảo vệ bởi `apps/web/src/app/admin/layout.tsx`).
4. Đăng ký menu: thêm 1 entry vào `apps/web/src/core/layout/nav-items.tsx`.

## Cấu trúc chuẩn 1 vertical slice

```text
features/<domain>/
├── components/    # UI components riêng domain (PascalCase.tsx)
├── hooks/         # hooks riêng domain (useXxx.ts)
├── api/           # API client calls (dùng api-client từ @/core/lib/api-client)
├── actions/       # Server actions ("use server" + zod safeParse)
├── types.ts       # Type chỉ dùng trong module
├── constants.ts   # Hằng số riêng module
└── index.ts       # ★ Public API — bên ngoài chỉ import từ đây
```

## Nguyên tắc phụ thuộc

- Feature **KHÔNG** import feature khác. Cần dùng chung → nâng lên `core/` (`ui`, `shared`, `lib`, `hooks`, `types`).
- Mọi truy cập vào module từ route `app/` phải thông qua `index.ts`.
