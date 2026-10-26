# CONTRIBUTING — Quy tắc làm việc nhóm (17 người)

Mục tiêu: **mỗi PR chỉ chạm đúng vùng của mình**, để gần như không phải resolve conflict.

## 1. Trước khi code

| Bạn làm gì | Đặt ở đâu |
|---|---|
| Màn hình quản trị (route `/admin/...`) | `features/admin/<module>/` |
| Màn hình nhân viên (route ngoài `/admin`) | `features/employee/<module>/` |
| API | `apps/api/src/modules/<module>/` |
| Bảng dữ liệu mới | `apps/api/prisma/schema/<module>.prisma` (đúng file của module) |

Copy `features/_template/` → `features/<surface>/<module>/` rồi đổi tên. Chi tiết: `features/_template/README.md`.

## 2. Đăng ký menu (không sửa file chung)

1. Tạo `features/admin/<module>/nav.tsx`:
   ```tsx
   import type { NavSection } from "@/features/admin/navigation";
   export const ordersNav: NavSection = { name: "Orders", icon: <BagIcon />, path: "/admin/orders", items: [...] };
   ```
   Tên export = `<camelCaseTênThưMục>Nav` (script sẽ báo lỗi nếu sai).
2. Chạy `pnpm nav:gen` (hoặc `pnpm dev` / `pnpm typecheck` — tự chạy).
3. `features/admin/navigation/generated.ts` được sinh tự động và **đã gitignore** → không ai conflict.

## 3. File dùng chung — phải xin review theo `CODEOWNERS`

| File | Ai sửa |
|---|---|
| `features/auth/**`, `features/admin/app-shell/**`, `features/admin/navigation/**` | owner platform/shell |
| `<module>/ui/**` (UI riêng của module) | **chính dev của module** — không cần xin phép ai |
| `apps/api/src/app.module.ts` (thêm module mới) | owner platform |
| `package.json`, `pnpm-lock.yaml` | ai thêm dependency thì tự sửa |
| `AGENTS.md`, `CLEANCODE.md`, `scripts/**` | owner platform |

Nếu PR của bạn phải sửa một trong các file trên, tách thành PR riêng — đừng trộn với PR tính năng.

## 4. UI: mỗi module một bản

Không có UI kit dùng chung. Module của bạn cần `Button`, `Modal`, `Table`... thì:

```bash
cp -R apps/web/src/features/_template/ui/button/Button.tsx \
      apps/web/src/features/admin/orders/ui/Button.tsx
```

rồi sửa thoải mái — **không ai bị ảnh hưởng**, không cần review chéo. Đổi style toàn hệ thống thì sửa
CSS variables / Tailwind tokens trong `apps/web/src/app/globals.css`.

### Cái giá phải trả: "style trôi"

17 người sửa `Button` ở 17 nơi thì các bản `Button` sẽ lệch nhau dần. Cách kiểm soát **không phải**
gộp lại thành kit chung, mà là:

1. **Nguồn sự thật về style = `@theme` trong `apps/web/src/app/globals.css`**
   (màu brand, `shadow-theme-*`, `text-theme-*`, font, radius). Component chỉ được *ghép* class từ token,
   **không hardcode mã màu** (`#5b5bd6`), không hardcode `px-[13px]`.
2. **`pnpm ui:drift`** — so mọi bản copy với `features/_template/ui`, in ra bản nào đã lệch và bao nhiêu dòng.
   Không chặn merge (lệch là *được phép*), nhưng **lệch phải nhìn thấy được**.
3. **Ngưỡng leo thang**: khi cùng một component bị lệch ở **≥3 module vì cùng một lý do**, script sẽ cảnh báo.
   Lúc đó đưa khác biệt đó lên **token** trong `globals.css`, sửa `_template/ui`, rồi copy lại xuống các module.
   Không có chuyện "để mỗi nơi một kiểu".

## 5. Trước khi mở PR

```bash
pnpm verify        # nav:gen + kiểm tra ranh giới + typecheck API/web
```

`pnpm verify` sẽ báo nếu bạn:
- import chéo `admin` ↔ `employee`, hoặc module A → module B;
- import xuyên module không qua barrel `@/features/<surface>/<module>`;
- dùng `console.log`;
- type lệch giữa API và web.

## 6. Về ESLint / Prettier

- ESLint **chưa được cấu hình** trong repo này, nên `pnpm lint` hiện chỉ chạy kiểm tra ranh giới kiến trúc (`lint:structure`). Muốn bật ESLint/Prettier thì làm PR riêng (tránh trộn với PR tính năng, vì sẽ format lại nhiều file).
- Định dạng cơ bản đã được chốt bằng `.editorconfig` + `.gitattributes` (UTF-8, LF, 2 space, newline cuối file) → không còn diff chỉ vì editor khác cấu hình.

## 7. Quy tắc PR

- **Một PR = một màn hình / một module.** PR nhỏ thì conflict gần như bằng 0.
- **Rebase, không merge `main` vào branch**: `git pull --rebase origin main`.
- Không sửa file generated (`features/*/navigation/generated.ts`, `apps/api/dist`, `.next`).
- Không format lại file không liên quan (làm diff phình ra và tranh chấp với người khác).
- Không đổi `pnpm-lock.yaml` bằng tay.

## 8. Khi conflict `pnpm-lock.yaml`

```bash
git checkout --theirs pnpm-lock.yaml 2>/dev/null || git checkout origin/main -- pnpm-lock.yaml
pnpm install          # sinh lại lockfile theo package.json đã merge
git add pnpm-lock.yaml
```
Sau đó chạy lại `pnpm verify`.

## 9. Khi conflict `apps/api/prisma/schema/`

Mỗi module một file nên gần như không xảy ra. Nếu có (2 người cùng thêm quan hệ tới `User`), người merge sau giữ **cả hai** thay đổi và chạy:

```bash
pnpm db:generate && pnpm --filter @oneops/api exec prisma validate
```

## 10. Kiểu lỗi hay gặp (CI sẽ chặn)

| Lỗi | Sửa |
|---|---|
| `module "users" không được import module "attendance"` | Copy phần cần dùng sang module mình, hoặc nâng lên `features/auth` nếu là hạ tầng |
| `import xuyên module phải qua barrel` | `import { X } from "@/features/admin/users"` thay vì đường dẫn sâu |
| `UI là riêng của từng module — copy file bạn cần...` | Copy component từ `features/_template/ui/` vào `<module>/ui/` của bạn, đừng import của module khác |
| `bề mặt employee chỉ được dùng admin/app-shell...` | Không import business module của admin; UI thì copy bản riêng |
