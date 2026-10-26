# AGENTS.md — Quy Tắc Kiến Trúc Tối Giản Cho AI

> **MỤC ĐÍCH**: File này tóm tắt các nguyên tắc cốt lõi mà AI PHẢI tuân thủ trong mỗi phiên làm việc.
> Ngắn gọn, súc tích, ưu tiên hiệu năng ngữ cảnh (context-efficient).

---

## 1. PHÂN QUYỀN SỞ HỮU FILE (Zero-Conflict Boundary)

| Phạm vi | Chủ sở hữu | Quy tắc bắt buộc |
|---|---|---|
| `apps/api/src/modules/attendance/`<br>`apps/web/src/features/attendance/`<br>`packages/shared-types/src/attendance.types.ts` | **Dev 1** | Chỉ Dev 1 được sửa/tạo mới trong phạm vi này. |
| `apps/api/src/modules/tasks/`<br>`apps/web/src/features/tasks/`<br>`packages/shared-types/src/task.types.ts` | **Dev 2** | Chỉ Dev 2 được sửa/tạo mới trong phạm vi này. |
| `apps/api/src/modules/chat/`<br>`apps/api/src/modules/notifications/`<br>`apps/web/src/features/chat/`<br>`apps/web/src/features/notifications/`<br>`packages/shared-types/src/chat.types.ts`<br>`packages/shared-types/src/notification.types.ts` | **Dev 3** | Chỉ Dev 3 được sửa/tạo mới trong phạm vi này. |
| `packages/database/prisma/schema.prisma`<br>`apps/api/src/core/`<br>`apps/web/src/shared/`<br>`packages/shared-types/src/user.types.ts` | **SHARED** | Cần sự đồng ý của cả 3 dev trước khi sửa. |

---

## 2. 10 ĐIỀU CẤM KỶ LUẬT (Hard Anti-Patterns)

1. ❌ **CẤM import trực tiếp Service của module khác**: Module A muốn báo cho Module B **bắt buộc** dùng `this.eventEmitter.emit(...)` và `@OnEvent(...)`.
2. ❌ **CẤM dùng type `any`**: Sử dụng interface cụ thể từ `@oneops/shared-types` hoặc dùng `unknown` kèm Type Guard.
3. ❌ **CẤM `console.log`**: Sử dụng `Logger` của NestJS trên BE (`private readonly logger = new Logger(...)`).
4. ❌ **CẤM nuốt ngoại lệ**: Tuyệt đối không viết `catch (e) {}` rỗng mà không xử lý hoặc rethrow.
5. ❌ **CẤM gọi API trực tiếp trong JSX**: Toàn bộ HTTP request trên FE phải thông qua thư mục `features/<module>/api/` và bọc trong `hooks/`.
6. ❌ **CẤM viết Business Logic trong Controller**: Controller chỉ nhận DTO, gọi Service và trả về response.
7. ❌ **CẤM định nghĩa lại Type trùng lặp**: Mọi type dùng chung giữa FE và BE phải nằm tại `packages/shared-types/`.
8. ❌ **CẤM truy vấn thừa dữ liệu**: Khi dùng Prisma, luôn dùng `select` để lấy đúng các trường cần thiết (tránh lộ password/sensitive info).
9. ❌ **CẤM Hardcode**: Không fix cứng IP, port, URL, secret key trong source code. Luôn dùng biến môi trường.
10. ❌ **CẤM bỏ qua DTO validation**: Mọi endpoint nhận payload phải có DTO class với decorator từ `class-validator`.

---

## 3. TIÊU CHUẨN KIẾN TRÚC NHANH

### Backend (NestJS)
- **Controller**: `@UseGuards(JwtAuthGuard)`, nhận `@CurrentUser()`, gọi duy nhất method của service module đó.
- **Service**: Chứa 100% logic nghiệp vụ. Dùng `$transaction` cho các thao tác ghi dữ liệu nhiều bước. Bắn event khi hoàn tất tác vụ quan trọng.
- **Gateway (Socket.IO)**: Đặt tên room: `<domain>:<id>` (ví dụ: `headcount`, `tasks:user:${userId}`, `chat:room:${roomId}`). Đặt tên event: `<domain>:<action>` (ví dụ: `task:status_changed`).

### Frontend (Next.js 14)
- **Server Components**: Mặc định cho layout và trang fetch dữ liệu ban đầu.
- **Client Components**: Chỉ gắn `'use client'` khi có tương tác (state, hook, websocket, event handler).
- **Feature Structure**: Mỗi feature phải đủ 4 thư mục: `components/`, `hooks/`, `api/`, `types/` (chỉ re-export).
- **Styling**: Ưu tiên CSS Modules (`.module.css`) hoặc CSS Variables trong `globals.css`.

---

## 4. QUY ƯỚC GIT NHANH
- **Branch**: `feat/<module>/<tên-ngắn>`, `fix/<module>/<tên-ngắn>`
- **Commit**: `<type>(<scope>): <mô tả ngắn bằng tiếng Anh>`
  - *Type*: `feat` | `fix` | `chore` | `refactor` | `docs`
  - *Scope*: `attendance` | `tasks` | `chat` | `notifications` | `db` | `shared`
