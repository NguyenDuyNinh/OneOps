# AGENTS.md — Quy Tắc Kiến Trúc Tối Giản Cho AI

> **MỤC ĐÍCH**: File này tóm tắt các nguyên tắc cốt lõi mà AI PHẢI tuân thủ trong mỗi phiên làm việc.
> Ngắn gọn, súc tích, ưu tiên hiệu năng ngữ cảnh (context-efficient).

---

## 1. PHÂN QUYỀN SỞ HỮU FILE (Zero-Conflict Boundary)

| Phạm vi | Chủ sở hữu | Quy tắc bắt buộc |
|---|---|---|
| `apps/api/src/modules/attendance/`<br>`apps/api/prisma/schema/attendance.prisma`<br>`apps/web/src/features/admin/attendance/`<br>`apps/web/src/features/employee/attendance/` | **Dev 1** | Chỉ Dev 1 được sửa/tạo mới trong phạm vi này. |
| `apps/api/src/modules/tasks/`<br>`apps/api/prisma/schema/tasks.prisma`<br>`apps/web/src/features/admin/tasks/`<br>`apps/web/src/features/employee/tasks/` | **Dev 2** | Chỉ Dev 2 được sửa/tạo mới trong phạm vi này. |
| `apps/api/src/modules/chat/`<br>`apps/api/src/modules/notifications/`<br>`apps/api/prisma/schema/chat.prisma`<br>`apps/api/prisma/schema/notifications.prisma`<br>`apps/web/src/features/employee/chat/`<br>`apps/web/src/features/employee/notifications/`<br>`apps/web/src/features/admin/notifications/` | **Dev 3** | Chỉ Dev 3 được sửa/tạo mới trong phạm vi này. |
| `apps/api/prisma/schema/users.prisma`<br>`apps/api/src/modules/users/`<br>`apps/api/src/modules/platform/`<br>`apps/api/src/modules/database/`<br>`apps/web/src/features/auth/`<br>`apps/web/src/features/admin/ui/`<br>`apps/web/src/features/admin/app-shell/`<br>`apps/web/src/features/admin/users/` | **SHARED** | Cần sự đồng ý của cả 3 dev trước khi sửa. |

> **Không còn `packages/`**: toàn bộ source nằm trong `apps/`. Type của module nào nằm ngay trong module đó
> (BE: `apps/api/src/modules/<module>/<module>.types.ts`; FE: `apps/web/src/features/<surface>/<module>/types.ts`).
> Hạ tầng dùng chung của BE là 2 module: `modules/platform/` (guards, decorators, `types/`) và `modules/database/` (Prisma).

> **FE chia theo BỀ MẶT, không theo domain**: `features/admin/*` (màn hình quản trị, route `/admin`),
> `features/employee/*` (màn hình nhân viên, route ngoài `/admin`), và `features/auth/` **dùng chung cho cả hai**
> (đăng nhập + phiên + HTTP client). Chấp nhận **lặp code** giữa admin và employee (types/api/hook) để hai bề mặt
> không phụ thuộc nhau. **Không có thư mục `shared`.**

---

## 2. 10 ĐIỀU CẤM KỶ LUẬT (Hard Anti-Patterns)

1. ❌ **CẤM import trực tiếp Service của module khác**: Module A muốn báo cho Module B **bắt buộc** dùng `this.eventEmitter.emit(...)` và `@OnEvent(...)`.
2. ❌ **CẤM dùng type `any`**: Sử dụng interface cụ thể khai báo trong module (`<module>.types.ts` / `features/<module>/types.ts`), `modules/platform/types/` (BE) hoặc `features/auth/types.ts` (FE — định danh/vai trò), hoặc dùng `unknown` kèm Type Guard.
3. ❌ **CẤM `console.log`**: Sử dụng `Logger` của NestJS trên BE (`private readonly logger = new Logger(...)`).
4. ❌ **CẤM nuốt ngoại lệ**: Tuyệt đối không viết `catch (e) {}` rỗng mà không xử lý hoặc rethrow.
5. ❌ **CẤM gọi API trực tiếp trong JSX**: Toàn bộ HTTP request trên FE phải thông qua thư mục `features/<module>/api/` và bọc trong `hooks/`.
6. ❌ **CẤM viết Business Logic trong Controller**: Controller chỉ nhận DTO, gọi Service và trả về response.
7. ❌ **CẤM định nghĩa lại Type trùng lặp trong cùng một app**: Mỗi app tự sở hữu contract của mình — BE đặt tại `modules/<module>/<module>.types.ts`, FE đặt tại `features/<module>/types.ts`. Không tạo lại type định danh đã có ở `modules/platform/types/` (BE) hoặc `features/auth/types.ts` (FE); chấp nhận FE/BE định nghĩa song song cùng một shape. Type nghiệp vụ **cố ý** khai báo riêng cho từng bề mặt (admin vs employee).
8. ❌ **CẤM truy vấn thừa dữ liệu**: Khi dùng Prisma, luôn dùng `select` để lấy đúng các trường cần thiết (tránh lộ password/sensitive info).
9. ❌ **CẤM Hardcode**: Không fix cứng IP, port, URL, secret key trong source code. Luôn dùng biến môi trường.
10. ❌ **CẤM bỏ qua DTO validation**: Mọi endpoint nhận payload phải có DTO class với decorator từ `class-validator`.

---

## 3. TIÊU CHUẨN KIẾN TRÚC NHANH

### Database Multi-Schema (Prisma Schema Folder)
- Sử dụng tính năng `prismaSchemaFolder`. Mỗi module có file `.prisma` độc lập trong `apps/api/prisma/schema/`.
- Thay đổi schema của module nào thì dev phụ trách module đó **chỉ sửa file `.prisma` tương ứng** (ví dụ: Dev 1 sửa `attendance.prisma`, Dev 2 sửa `tasks.prisma`).
- Tuyệt đối không có xung đột Merge conflict trên Database Schema!

### Backend (NestJS)
- **Controller**: `@UseGuards(JwtAuthGuard)`, nhận `@CurrentUser()`, gọi duy nhất method của service module đó.
- **Service**: Chứa 100% logic nghiệp vụ. Dùng `$transaction` cho các thao tác ghi dữ liệu nhiều bước. Bắn event khi hoàn tất tác vụ quan trọng.
- **Gateway (Socket.IO)**: Đặt tên room: `<domain>:<id>` (ví dụ: `headcount`, `tasks:user:${userId}`, `chat:room:${roomId}`). Đặt tên event: `<domain>:<action>` (ví dụ: `task:status_changed`).
- **Types**: Model, enum, response và event payload của module đặt tại `modules/<module>/<module>.types.ts`. Type dùng chung toàn BE (vd. `UserRole`, `JwtPayload`) đặt tại `modules/platform/types/`. Payload request vẫn là class DTO `class-validator` trong `dto/` (không khai báo lại DTO interface trong file types).
- **Database**: Inject `PrismaService` từ `modules/database/` (đã `@Global()`), không tự `new PrismaClient()`. Không khai báo lại `PrismaService` trong `providers` của module nghiệp vụ.
- **Hạ tầng dùng chung**: `modules/platform/` chứa guards/decorators/types. Hai module `platform` và `database` **tuyệt đối không được import module nghiệp vụ** — chỉ được bị import.
- **Cross-module**: Event payload do module **phát** sở hữu; module lắng nghe chỉ `import type` từ file types của module phát — tuyệt đối không import Service.

### Frontend (Next.js 14)
- **Server Components**: Mặc định cho layout và trang fetch dữ liệu ban đầu.
- **Client Components**: Chỉ gắn `'use client'` khi có tương tác (state, hook, websocket, event handler).
- **Feature Structure**: `components/`, `hooks/`, `api/`, `ui/`, `types.ts`, `constants.ts`, `index.ts` (barrel — bên ngoài chỉ import từ đây).
- **Bề mặt (surface)**: `features/admin/<module>/` cho màn hình quản trị (route `/admin/*`), `features/employee/<module>/` cho màn hình nhân viên. **Cấm** `admin/*` import `employee/*` và ngược lại.
- **Types**: Contract của slice đặt tại `features/<surface>/<module>/types.ts`. Cùng một domain ở 2 bề mặt thì **viết 2 bản** — đó là chủ ý, không phải lỗi. Chỉ định danh (`UserRole`, `AuthenticatedUser`) đặt tại `features/auth/types.ts`.
- **Không có `features/shared`**: cần dùng chung 2 bề mặt thì copy; nếu là hạ tầng kỹ thuật thuần (HTTP, session, hằng số API) thì đặt trong `features/auth/`.
- **Gọi API**: chỉ qua `features/auth/lib/api-client.ts` (`api`, `ApiError`) — client này tự gắn token, không tự viết `fetch`.
- **UI là TÀI SẢN RIÊNG của từng module**: mỗi module có `<module>/ui/` (button, form, modal, table...) và **chỉ dùng UI của chính nó**. Cấm `import ... from "@/features/admin/users/ui/..."` ở nơi khác. Cần component cho module mình thì **copy** từ `features/_template/ui/` vào `<module>/ui/` rồi sửa thoải mái — sửa UI module mình không làm vỡ module khác, và không ai phải xin phép ai.
  - Muốn đổi style chung của toàn hệ thống? Đổi **CSS variables / Tailwind tokens** trong `app/globals.css`, không đổi component của module khác.
  - **Kiểm soát "style trôi"**: `pnpm ui:drift` so mọi bản copy với `features/_template/ui` và báo bản nào đã lệch (+x/-y dòng). KHÔNG chặn merge — chỉ để nhìn thấy. Nếu **cùng một component lệch ở ≥3 module vì cùng lý do** → đó là tín hiệu phải token hoá (đưa khác biệt lên `@theme` trong `globals.css`), rồi cập nhật `_template/ui`, rồi mới copy lại. Không bao giờ "gộp lại thành kit chung".
  - `features/_template/ui/` là **bộ mẫu đầy đủ** (alert, avatar, badge, button, checkbox, dropdown, file-input, form, images, input, label, modal, multi-select, phone-input, radio, select, switch, table, textarea, date-picker, video, breadcrumb, grid-shape). Không import từ `_template` — chỉ copy.
- **Khung quản trị**: `features/admin/app-shell/` (header, sidebar, sidebar context) là **hạ tầng bề mặt** — được mọi module trong `features/admin/` dùng, nhưng bản thân nó không import module nghiệp vụ nào. UI riêng của shell nằm ở `features/admin/app-shell/ui/`.
- **Theme là global, thuộc `features/auth`**: `ThemeProvider`/`useTheme` ở `features/auth/context/ThemeContext.tsx`, được bọc **một lần duy nhất** ở `app/layout.tsx`. Cấm bọc lại `ThemeProvider` ở layout con (2 provider = 2 nguồn state, theme lệch giữa các nhánh).
- **Trang auth (`app/(auth)/**`) chỉ dùng UI của `features/auth`**: cấm import component/UI từ `features/admin/**` hoặc `features/employee/**`. Cần gì chưa có thì viết vào `features/auth/ui/`. `pnpm lint:structure` chặn vi phạm này.
- **Kiểm tra ranh giới**: `pnpm lint:structure` (chạy trong `pnpm verify` + CI) chặn import UI chéo module, import xuyên module không qua barrel, `admin` ↔ `employee`, `console.log`.
- **Navigation**: mỗi module tự khai báo `features/<surface>/<module>/nav.tsx` → `export const <module>Nav: NavSection`. Registry `features/<surface>/nav.generated.ts` do `scripts/gen-nav.mjs` sinh (đã gitignore) — **cấm sửa tay**, cấm thêm màn hình bằng cách sửa file menu chung.
- **Session**: `saveSession`/`getAccessToken`/`clearSession` tại `features/auth/lib/auth-storage.ts`.
- **Styling**: Ưu tiên CSS Modules (`.module.css`) hoặc CSS Variables trong `globals.css`.

---

## 4. QUY ƯỚC GIT NHANH
- **Trước khi push**: `pnpm verify` (sinh nav + kiểm tra ranh giới + typecheck). CI chạy đúng lệnh này.
- **Branch**: `feat/<module>/<tên-ngắn>`, `fix/<module>/<tên-ngắn>`
- **Commit**: `<type>(<scope>): <mô tả ngắn bằng tiếng Anh>`
  - *Type*: `feat` | `fix` | `chore` | `refactor` | `docs`
  - *Scope*: `attendance` | `tasks` | `chat` | `notifications` | `users` | `auth` | `ui` | `shell` | `db`
