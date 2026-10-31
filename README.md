# OneOps

**Nền tảng vận hành nội bộ hợp nhất** — quản lý tài khoản, chấm công, công việc và giao tiếp nội bộ trong một hệ thống duy nhất.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-000000?logo=nextdotjs&logoColor=white)](#3-công-nghệ-sử-dụng)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](#3-công-nghệ-sử-dụng)
[![NestJS](https://img.shields.io/badge/NestJS-10.3-E0234E?logo=nestjs&logoColor=white)](#3-công-nghệ-sử-dụng)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](#3-công-nghệ-sử-dụng)
[![Prisma](https://img.shields.io/badge/Prisma-5.21-2D3748?logo=prisma&logoColor=white)](#3-công-nghệ-sử-dụng)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](#3-công-nghệ-sử-dụng)

---

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Tính năng chính](#2-tính-năng-chính)
3. [Công nghệ sử dụng](#3-công-nghệ-sử-dụng)
4. [Cấu trúc hệ thống](#4-cấu-trúc-hệ-thống) — gồm hướng dẫn sắp xếp thư mục theo chiều dọc
5. [Workflow của dự án](#5-workflow-của-dự-án)
6. [Cài đặt & chạy](#6-cài-đặt--chạy)
7. [Lệnh thường dùng](#7-lệnh-thường-dùng)
8. [Kiểm tra & CI](#8-kiểm-tra--ci)
9. [Xử lý sự cố](#9-xử-lý-sự-cố)
10. [Tài liệu](#10-tài-liệu)
11. [Trạng thái dự án](#11-trạng-thái-dự-án)

---

## 1. Giới thiệu

OneOps là hệ thống vận hành nội bộ dành cho doanh nghiệp, gom bốn nghiệp vụ thường bị tách rời vào cùng một nơi:

| Nghiệp vụ | Người dùng chính | Giá trị |
|---|---|---|
| **Tài khoản & nhân sự** | Quản trị viên | Quản lý danh tính, vai trò, trạng thái truy cập |
| **Chấm công** | Nhân viên, quản lý | Ghi nhận có mặt, đếm số người đang làm việc theo thời gian thực |
| **Công việc** | Quản lý, nhân viên | Giao việc, theo dõi tiến độ, xử lý trễ hạn |
| **Chat & thông báo** | Toàn bộ | Trao đổi theo phòng và nhận thông báo tức thời |

### Hai bề mặt giao diện

Hệ thống chia giao diện theo **bề mặt (surface)**, không theo domain:

| Bề mặt | Route | Đặc điểm |
|---|---|---|
| **Admin** | `/admin/*` | Mật độ thông tin cao, thao tác hàng loạt, bảng dữ liệu lớn |
| **Nhân viên** | ngoài `/admin` | Mobile-first, thao tác nhanh, ít bước |
| **Auth** | `/signin`, `/signup` | Dùng chung cho cả hai bề mặt |

Hai bề mặt dùng **cùng một ngôn ngữ thị giác** (token, typography, component shape), chỉ khác mật độ và cách bố trí.

### Điểm khác biệt về kiến trúc

- **Vertical slice**: mỗi module sở hữu trọn vẹn từ database model → DTO → service → hook → UI.
- **Event-driven**: các module giao tiếp qua `EventEmitter2`, không import chéo service.
- **Contract theo từng app**: BE và FE tự khai báo type của mình; `pnpm typecheck` bắt lệch contract.
- **UI theo từng module**: mỗi module copy bộ primitive vào `ui/` riêng — không có UI kit dùng chung, nhưng có token chung để giữ nhất quán.

---

## 2. Tính năng chính

### Đã hoạt động

| Nhóm | Tính năng |
|---|---|
| **Xác thực** | Đăng nhập JWT, lưu phiên, tự đính kèm Bearer token, tự đăng xuất khi 401, guard theo vai trò (`ADMIN` / `MANAGER` / `EMPLOYEE`) |
| **Quản lý tài khoản** | Danh sách có tìm kiếm, lọc vai trò/trạng thái, phân trang; thẻ KPI tổng hợp; tạo & sửa tài khoản; bật/tắt truy cập; đặt lại mật khẩu; gán quản lý trực tiếp |
| **App shell** | Header đầy đủ, sidebar dạng rail + panel phụ kéo giãn được (lưu vào `localStorage`), breadcrumb, dark mode, responsive từ 375 px |
| **Điều hướng** | Menu tự sinh từ `nav.tsx` của từng module — thêm màn hình không cần sửa file chung |
| **Thiết kế** | Design system đầy đủ: token màu/typo/spacing, 20 component spec, checklist accessibility |

### Đã có backend, giao diện đang triển khai

| Nhóm | Backend đã có | Frontend |
|---|---|---|
| **Chấm công** | `POST /attendance/check-in`, `GET /attendance/headcount`, gateway realtime, giới hạn IP văn phòng theo `OFFICE_ALLOWED_IPS` | Đang triển khai |
| **Công việc** | `POST /tasks`, `GET /tasks`, `PATCH /tasks/:id/status`; state machine 7 trạng thái; trạng thái deadline (bình thường / sắp hạn / quá hạn); log thay đổi; đề xuất tạm hoãn — huỷ — đổi hạn; bình luận; đánh dấu cần giao lại | Đang triển khai |
| **Chat** | `GET /chat/rooms`, Socket.IO gateway | Đang triển khai |
| **Thông báo** | `GET /notifications`, lưu DB, đẩy WebSocket theo phòng `user:<id>`, 13 loại thông báo, deep link `actionUrl` | Đang triển khai |

### Trạng thái công việc

```
TODO → IN_PROGRESS → REVIEW → DONE
         ↑              │
         └── REWORK ────┘
PAUSED · CANCELLED (trạng thái dừng)
```

---

## 3. Công nghệ sử dụng

### Frontend — `apps/web`

| Thành phần | Công nghệ | Ghi chú |
|---|---|---|
| Framework | **Next.js 16.1** (App Router) | Server Components mặc định |
| UI runtime | **React 19.2** | |
| Ngôn ngữ | **TypeScript 5.9** | `strict` |
| Styling | **Tailwind CSS 4.1** | CSS-first, `@theme` trong `globals.css` — **không có** `tailwind.config.*` |
| Font | **Be Vietnam Pro** (`next/font`) | Subset `latin` + `vietnamese` |
| Biểu đồ | ApexCharts 4 · FullCalendar 6 | |
| Tương tác | react-dnd · react-dropzone · flatpickr · swiper | |
| Tiện ích | `clsx` · `tailwind-merge` · `zod` | |

### Backend — `apps/api`

| Thành phần | Công nghệ | Ghi chú |
|---|---|---|
| Framework | **NestJS 10.3** | Module hoá, DI |
| Ngôn ngữ | **TypeScript 5.4** | |
| ORM | **Prisma 5.21** | `prismaSchemaFolder` — 1 file `.prisma` / module |
| Database | **PostgreSQL 16** | |
| Realtime | **Socket.IO 4.7** (`@nestjs/websockets`) | |
| Event bus | **`@nestjs/event-emitter`** (EventEmitter2) | Giao tiếp liên module |
| Xác thực | **Passport JWT** · `bcrypt` | |
| Validation | **class-validator** · class-transformer | `whitelist` + `forbidNonWhitelisted` |
| Định kỳ | `@nestjs/schedule` | Quét deadline, nhắc chấm công |

### Hạ tầng & công cụ

| Thành phần | Công nghệ |
|---|---|
| Monorepo | **pnpm workspace 12** (`apps/*`) |
| CI | GitHub Actions — Prisma validate → boundary check → typecheck → build |
| Kiểm tra kiến trúc | `scripts/check-boundaries.mjs` |
| Sinh menu | `scripts/gen-nav.mjs` |
| Đo drift UI | `scripts/ui-drift.mjs` |

> **Lưu ý:** repo chưa cấu hình ESLint/Prettier. `pnpm lint` hiện chạy kiểm tra ranh giới kiến trúc, không phải lint cú pháp. Định dạng cơ bản được chốt bằng `.editorconfig` (UTF-8, LF, 2 space).

---

## 4. Cấu trúc hệ thống

### 4.1 Kiến trúc tổng thể

```
┌───────────────────────────── Next.js 16 · apps/web ─────────────────────────────┐
│                                                                                 │
│   Bề mặt ADMIN            Bề mặt NHÂN VIÊN          Bề mặt AUTH                 │
│   /admin/*                ngoài /admin              /signin · /signup           │
│   features/admin/*        features/employee/*       features/auth/*             │
│                                                                                 │
└───────────────────────────────────┬─────────────────────────────────────────────┘
                                    │
                       HTTP (Bearer JWT) · WebSocket
                                    │
┌───────────────────────────────────▼─────────────────────────────────────────────┐
│                            NestJS 10 · apps/api                                 │
│                                                                                 │
│   platform/       guards · decorators · types dùng chung                        │
│   database/       PrismaService (global)                                        │
│                                                                                 │
│   auth · users · attendance · tasks · chat · notifications                      │
│                                                                                 │
│   ── EventEmitter2 (in-process) ──►  @OnEvent(...)  giữa các module             │
└───────────────────────────────────┬─────────────────────────────────────────────┘
                                    │  Prisma
                          ┌─────────▼─────────┐
                          │    PostgreSQL     │
                          └───────────────────┘
```

### 4.2 Ba quyết định kiến trúc cốt lõi

**① Vertical slice — mỗi module là một khối trọn vẹn**

Một module sở hữu toàn bộ đường đi của dữ liệu: schema → DTO → service → controller → type → hook → UI. Thêm tính năng không phải sửa file dùng chung, nên không tạo xung đột.

**② Event-driven — module không biết nhau**

Module A cần báo cho module B thì **phát sự kiện**, không `inject` service của nhau:

```typescript
// tasks.service.ts — module Tasks phát
this.eventEmitter.emit('task.created', { taskId, taskTitle, assigneeId, ... });
```

```typescript
// notifications.service.ts — module Notifications nghe
@OnEvent('task.created')
handleTaskCreated(payload: TaskCreatedEvent) { /* lưu DB + đẩy WebSocket */ }
```

Payload do module **phát** sở hữu; module nghe chỉ `import type`. Nhờ vậy không có circular dependency.

**③ Contract theo từng app — không có package dùng chung**

```typescript
// BE — apps/api/src/modules/tasks/tasks.types.ts
export interface Task { id: string; deadline: Date; }

// FE — apps/web/src/features/admin/tasks/types.ts
export interface Task { id: string; deadline: string; } // ISO sau khi serialize
```

Hai bên khai báo song song. Chấp nhận lặp để hai app độc lập, `pnpm typecheck` vẫn bắt được lệch.

### 4.3 Cấu trúc thư mục

```
OneOps/
├── apps/
│   ├── api/                                  # BACKEND — NestJS
│   │   ├── prisma/
│   │   │   ├── schema/                       # 1 file / module
│   │   │   │   ├── users.prisma              # giữ generator + datasource + model User
│   │   │   │   ├── attendance.prisma
│   │   │   │   ├── tasks.prisma
│   │   │   │   ├── chat.prisma
│   │   │   │   └── notifications.prisma
│   │   │   └── seed.ts                       # Seed tài khoản mẫu
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── platform/                 # guards · decorators · types dùng chung
│   │       │   ├── database/                 # PrismaService + DatabaseModule (@Global)
│   │       │   ├── auth/                     # Đăng nhập JWT
│   │       │   ├── users/                    # Quản lý tài khoản
│   │       │   ├── attendance/               # Chấm công + gateway
│   │       │   ├── tasks/                    # Công việc + state machine
│   │       │   ├── chat/                     # Phòng chat + gateway
│   │       │   └── notifications/            # Event listener + gateway
│   │       ├── app.module.ts
│   │       └── main.ts                       # Port 4000, bật CORS + ValidationPipe
│   │
│   └── web/                                  # FRONTEND — Next.js
│       └── src/
│           ├── app/                          # Routes
│           │   ├── (auth)/signin/            # Đăng nhập
│           │   ├── admin/                    # Khu vực quản trị (AuthGuard)
│           │   │   ├── layout.tsx            # Shell: header + rail + panel
│           │   │   └── users/                # Quản lý tài khoản
│           │   ├── layout.tsx                # Font + ThemeProvider + SidebarProvider
│           │   └── globals.css               # Toàn bộ design token
│           ├── features/
│           │   ├── auth/                     # Dùng chung: phiên, api-client, UserRole, theme
│           │   ├── admin/
│           │   │   ├── app-shell/            # Header · sidebar · theme toggle
│           │   │   ├── navigation/           # Menu của bề mặt (generated.ts — không sửa tay)
│           │   │   └── users/                # Một vertical slice hoàn chỉnh
│           │   │       ├── ui/               #   Primitive riêng của module
│           │   │       ├── components/       #   Thành phần nghiệp vụ
│           │   │       ├── hooks/ · api/     #   Logic + gọi API
│           │   │       ├── types.ts
│           │   │       ├── constants.ts
│           │   │       ├── nav.tsx           #   Đăng ký menu
│           │   │       └── index.ts          #   Barrel — điểm import duy nhất
│           │   ├── employee/                 # Bề mặt nhân viên — tạo khi triển khai
│           │   └── _template/                # Mẫu để copy cho slice mới
│           │       └── ui/                   #   Bộ primitive đầy đủ
│           └── icons/                        # Icon SVG
│
├── scripts/
│   ├── gen-nav.mjs                           # Sinh menu từ nav.tsx
│   ├── check-boundaries.mjs                  # Chặn import chéo bề mặt / module
│   └── ui-drift.mjs                          # So bản copy UI với _template
│
├── .github/
│   ├── CODEOWNERS
│   ├── pull_request_template.md
│   └── workflows/ci.yml
│
├── .env.example                              # Mẫu biến môi trường cấp repo
├── AGENTS.md                                 # Luật kiến trúc & ranh giới sở hữu
├── CLEANCODE.md                              # Quy tắc viết code
├── CONTRIBUTING.md                           # Quy trình PR, xử lý conflict
├── DESIGN.md                                 # Hợp đồng thị giác & UI
├── skill.md                                  # Quy trình thiết kế UI
├── pnpm-workspace.yaml
└── package.json
```

### 4.4 Ranh giới cần nhớ

| Quy tắc | Lý do |
|---|---|
| Không import UI của module khác | Mỗi module sở hữu bản copy — sửa không làm vỡ module khác |
| Không import chéo `admin` ↔ `employee` | Hai bề mặt không phụ thuộc nhau |
| Import xuyên module phải qua barrel `@/features/<surface>/<module>` | Giữ điểm vào rõ ràng |
| Không import `_template` | Đây là bộ mẫu để copy, không phải thư viện |
| Không sửa `navigation/generated.ts` | File sinh tự động, đã gitignore |
| `ThemeProvider` chỉ bọc một lần ở `app/layout.tsx` | Tránh hai nguồn state theme |

### 4.5 Sắp xếp thư mục theo chiều dọc (vertical slice)

Một **chức năng** trong OneOps không chia thành "thư mục frontend" và "thư mục backend". Nó là một lát cắt dọc đi xuyên cả hai app, và mỗi phía có đúng **một thư mục sở hữu trọn vẹn phần của mình**.

```
Chức năng: Quản lý tài khoản
│
├── Dữ liệu     apps/api/prisma/schema/users.prisma
├── Backend     apps/api/src/modules/users/
└── Frontend    apps/web/src/features/admin/users/
```

Ba nơi, **cùng một cái tên**. Nhìn tên thư mục là biết ngay nó thuộc chức năng nào, không cần mở file.

| Nơi | Quy ước | Ví dụ |
|---|---|---|
| Schema | `<module>.prisma` | `users.prisma` |
| BE module | `apps/api/src/modules/<module>/` | `modules/users/` |
| FE module | `features/<surface>/<module>/` | `features/admin/users/` |
| Route | `app/<surface>/<module>/page.tsx` | `app/admin/users/page.tsx` |

`<surface>` là `admin` hoặc `employee`. Cùng một domain ở hai bề mặt thì có **hai thư mục FE riêng** (`features/admin/tasks/` và `features/employee/tasks/`) — đó là chủ ý, không phải trùng lặp.

#### 4.5.1 Thư mục backend gồm những gì

```
apps/api/src/modules/tasks/
├── tasks.module.ts          # Khai báo controller / provider / export
├── tasks.controller.ts      # HTTP: guard + DTO + gọi service
├── tasks.service.ts         # Toàn bộ business logic + phát sự kiện
├── tasks.types.ts           # Model, enum, response, event payload
├── tasks.gateway.ts         # WebSocket (chỉ khi module có realtime)
├── task-state.machine.ts    # Phần logic tách riêng khi file chính quá dài
└── dto/
    ├── create-task.dto.ts   # class-validator
    └── update-task.dto.ts
```

| File | Chứa | Không được chứa |
|---|---|---|
| `*.module.ts` | Danh sách controller/provider, module cần import | Logic |
| `*.controller.ts` | Route, guard, nhận DTO, gọi **một** method của service | Truy vấn Prisma, tính toán |
| `*.service.ts` | Toàn bộ nghiệp vụ, `$transaction`, phát sự kiện | `Request`/`Response`, mã HTTP |
| `*.types.ts` | Interface/enum của module và event payload | Class DTO có decorator |
| `dto/*.dto.ts` | Class có decorator `class-validator` | Interface thuần |
| `*.gateway.ts` | Socket.IO, room `<domain>:<id>`, event `<domain>:<action>` | Nghiệp vụ (phải gọi service) |

**Vì sao tách `types.ts` khỏi `dto/`:** `types.ts` là contract nội bộ và payload sự kiện — module khác được phép `import type` từ đây. `dto/` là lớp validate ở cửa vào HTTP, không ai khác được phụ thuộc vào.

#### 4.5.2 Thư mục frontend gồm những gì

```
apps/web/src/features/admin/users/
├── UsersScreen.tsx          # Lắp ghép toàn màn hình (composition gốc)
├── index.ts                 # Barrel — điểm import duy nhất từ bên ngoài
├── nav.tsx                  # Đăng ký menu (gen-nav tự quét)
├── types.ts                 # Contract của slice
├── constants.ts             # Nhãn, option, hằng số nghiệp vụ
├── api/
│   └── users.api.ts         # Chỉ HTTP — không state, không JSX
├── hooks/
│   └── useUsers.ts          # State + orchestration, gọi api/
├── components/
│   ├── UsersTable.tsx       # UI nghiệp vụ
│   ├── UsersToolbar.tsx
│   └── UserFormModal.tsx
└── ui/
    ├── Button.tsx           # Primitive COPY từ _template/ui
    ├── InputField.tsx
    ├── Modal.tsx
    └── Table.tsx
```

Chiều phụ thuộc **một chiều**, không được quay ngược:

```
page.tsx → <Module>Screen → components/ → hooks/ → api/ → api-client
                                  └──────→ ui/   (chỉ hiển thị)
```

| Thư mục | Trách nhiệm | Không được làm |
|---|---|---|
| `api/` | Gọi endpoint, trả về type | Giữ state, render |
| `hooks/` | State, effect, optimistic update, gọi `api/` | Render JSX |
| `components/` | UI nghiệp vụ, nhận props | Gọi API, biết endpoint |
| `ui/` | Primitive thuần, không biết nghiệp vụ | Đọc `types.ts` của module, gọi API |
| `types.ts` | Shape dữ liệu | Chứa component hoặc hàm |
| `constants.ts` | Nhãn, option, giới hạn | Chứa secret hoặc URL tuyệt đối |
| `nav.tsx` | Đúng một `NavSection` | Logic |
| `index.ts` | Export những gì bên ngoài thật sự dùng | Export tràn lan mọi file nội bộ |

Barrel chỉ mở ra thứ cần thiết:

```ts
export { default as UsersScreen } from "./UsersScreen";
export { useUsers } from "./hooks/useUsers";
export type { AdminUserListItem, UserStats } from "./types";
```

Không export `ui/Button` qua barrel — module khác muốn dùng thì **tự copy** bản của nó.

#### 4.5.3 Vì sao hầu như không phải sửa file chung

Đây là lý do mô hình này tồn tại: thêm một chức năng **không** kéo theo việc sửa file của người khác.

| Việc cần làm | Cơ chế có sẵn | Sửa file khác? |
|---|---|---|
| Thêm bảng dữ liệu | `prismaSchemaFolder` tự gộp mọi file `*.prisma` trong `schema/` | Không |
| Dùng Prisma | `DatabaseModule` là `@Global()`, inject `PrismaService` | Không |
| Dùng guard / decorator | Import class từ `modules/platform/` (vd. `../platform/guards/jwt-auth.guard`) | Không |
| Thêm màn hình | Tạo thư mục route trong `app/` | Không |
| Thêm menu | `gen-nav.mjs` quét `features/<surface>/*/nav.tsx` | Không |
| Thêm UI | Copy từ `features/_template/ui/` vào `<module>/ui/` | Không |
| Gọi API | `features/auth/lib/api-client.ts` đã gắn token, xử lý 401 | Không |
| Báo cho module khác | `eventEmitter.emit(...)` | Không |
| Nhận từ module khác | `@OnEvent(...)` | Không |

Hai việc **có** phải sửa ngoài thư mục của bạn, và cả hai đều là thêm dòng:

| Việc | File phải sửa | Mức độ |
|---|---|---|
| Tạo domain backend mới | `apps/api/src/app.module.ts` — thêm 1 import + 1 dòng trong `imports` | 1 dòng, chỉ thêm |
| Thêm bề mặt thứ ba (hiếm) | `SURFACES` trong `scripts/check-boundaries.mjs` và danh sách surface trong `scripts/gen-nav.mjs` | 2 file, chỉ thêm |

**Trường hợp thường gặp — tạo domain backend mới:** thêm một import và một dòng vào `apps/api/src/app.module.ts`:

```ts
import { LeaveModule } from './modules/leave/leave.module';

@Module({
  imports: [
    // ...
    LeaveModule,
  ],
})
```

Đây là file thuộc nhóm SHARED, nhưng thay đổi chỉ là **thêm dòng** — không sửa dòng của người khác, nên xung đột gần như bằng không. Mọi thứ còn lại của module (controller, service, dto, gateway) nằm trọn trong thư mục của bạn.

#### 4.5.4 Ví dụ đầy đủ: thêm chức năng "Đơn xin nghỉ phép"

```
apps/api/prisma/schema/leave.prisma                     ← MỚI  (dữ liệu)
apps/api/src/modules/leave/leave.module.ts              ← MỚI
                           leave.controller.ts          ← MỚI
                           leave.service.ts             ← MỚI
                           leave.types.ts               ← MỚI
                           dto/create-leave.dto.ts      ← MỚI
apps/api/src/app.module.ts                              ← SỬA 1 dòng

apps/web/src/features/admin/leave/leave.types.ts        ← MỚI
                                  leave.constants.ts    ← MỚI
                                  LeaveScreen.tsx       ← MỚI  (composition)
                                  LeaveScreenHeader.tsx ← MỚI  (nếu cần tách)
                                  nav.tsx               ← MỚI  (menu)
                                  index.ts              ← MỚI  (barrel)
                                  api/leave.api.ts      ← MỚI
                                  hooks/useLeave.ts     ← MỚI
                                  components/LeaveTable.tsx  ← MỚI
                                  ui/Button.tsx         ← COPY từ _template
apps/web/src/app/admin/leave/page.tsx                   ← MỚI  (route, ~10 dòng)
```

**Route chỉ để lắp ghép** — không logic, không state:

```tsx
// apps/web/src/app/admin/leave/page.tsx
import { LeaveScreen, PageBreadcrumb } from "@/features/admin/leave";

export default function LeavePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Đơn xin nghỉ phép" />
      <LeaveScreen />
    </div>
  );
}
```

**Menu tự đăng ký** — không sửa file nào khác:

```tsx
// apps/web/src/features/admin/leave/nav.tsx
import type { NavSection } from "@/features/admin/navigation";
import { FolderIcon } from "@/icons";

export const leaveNav: NavSection = {
  name: "Nghỉ phép",
  icon: <FolderIcon />,
  path: "/admin/leave",
  items: [{ name: "Đơn xin nghỉ", path: "/admin/leave", icon: <FolderIcon />, pro: false }],
};
```

Tên export **bắt buộc** là `<camelCaseTênThưMục>Nav` — `gen-nav.mjs` sẽ báo lỗi nếu sai. Icon phải là thứ đã export từ `@/icons`; chưa có thì thêm file SVG vào `apps/web/src/icons/` rồi export ở `index.tsx`.

**Backend tự chứa** — controller mỏng, service giữ logic, module khai báo:

```ts
// leave.controller.ts
@Controller('leave')
@UseGuards(JwtAuthGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateLeaveDto) {
    return this.leaveService.create(user.sub, dto);
  }
}
```

```ts
// leave.service.ts
async create(userId: string, dto: CreateLeaveDto) {
  const request = await this.prisma.leaveRequest.create({
    data: { userId, ...dto },
    select: { id: true, userId: true, fromDate: true, toDate: true },
  });

  this.eventEmitter.emit('leave.created', { requestId: request.id, userId });
  return request;
}
```

Module `notifications` ở thư mục khác chỉ cần thêm `@OnEvent('leave.created')` — **không import service của bạn**.

#### 4.5.5 Checklist khi tạo một module mới

- [ ] Ba nơi cùng tên: `<module>.prisma` · `modules/<module>/` · `features/<surface>/<module>/`
- [ ] BE: `types.ts` → `dto/` → `service.ts` → `controller.ts` → `module.ts`
- [ ] FE: `types.ts` → `api/` → `hooks/` → `components/` → `<Module>Screen.tsx`
- [ ] `nav.tsx` export đúng `<camelCase>Nav`
- [ ] `page.tsx` chỉ có metadata + breadcrumb + Screen
- [ ] `index.ts` chỉ export thứ bên ngoài dùng
- [ ] `ui/` là bản copy, không import từ module khác
- [ ] Nếu tạo domain BE mới: thêm **một dòng** vào `app.module.ts`
- [ ] `pnpm verify` xanh

#### 4.5.6 Dấu hiệu bạn đang sắp xếp sai

| Dấu hiệu | Vấn đề | Cách sửa |
|---|---|---|
| Phải sửa `navigation/generated.ts` | Đang sửa file sinh tự động | Tạo `nav.tsx` rồi chạy `pnpm nav:gen` |
| Tạo `features/shared/` hoặc `packages/ui` | Đang dựng lại UI kit dùng chung | Copy vào `<module>/ui/` |
| Module A import service module B | Phụ thuộc chéo, sẽ sinh circular dependency | Dùng `emit` + `@OnEvent` |
| Component gọi `fetch` trực tiếp | Bỏ qua tầng `api/` + `hooks/` | Chuyển vào `api/`, gọi qua hook |
| `page.tsx` dài hơn 20 dòng | Logic đang nằm ở route | Chuyển vào `<Module>Screen` |
| `types.ts` chứa class DTO | Trộn contract với validation | DTO đặt trong `dto/` |
| Controller có truy vấn Prisma | Business logic trong controller | Chuyển xuống service |
| Một module có hai thư mục cùng tên ở hai nơi khác nhau | Tên không khớp quy ước | Đổi về `<module>` |

---

## 5. Workflow của dự án

### 5.1 Luồng xử lý một request

Ví dụ: quản lý tạo công việc cho nhân viên.

```
[Trình duyệt]
     │  POST /tasks  (Bearer JWT)
     ▼
[TasksController]           ← JwtAuthGuard + RolesGuard
     │  validate DTO (class-validator)
     ▼
[TasksService]              ← toàn bộ business logic
     │
     ├──► Prisma ──► PostgreSQL          (ghi Task + TaskLog, trong $transaction)
     │
     └──► EventEmitter2.emit('task.created', payload)
                    │
                    ▼
        [NotificationsService]  @OnEvent('task.created')
                    │
                    ├──► Prisma ──► Notification (lưu DB)
                    │
                    └──► Socket.IO: to(`user:${assigneeId}`).emit('notification:new')
                                    │
                                    ▼
                        [Client] chuông thông báo cập nhật, không cần reload
```

**Nguyên tắc:** Controller chỉ nhận DTO và gọi Service. Service chứa 100% logic và là nơi duy nhất phát sự kiện. Module nghe không được import Service của module phát.

### 5.2 Quy trình phát triển một tính năng

> Cách đặt file và thư mục cho từng bước: xem [§4.5](#45-sắp-xếp-thư-mục-theo-chiều-dọc-vertical-slice).

```
① Xác định bề mặt & module
        ↓
② Khai báo contract (BE types + DTO · FE types)
        ↓
③ Schema Prisma (nếu cần bảng mới)
        ↓
④ Backend: Service → Controller → Gateway
        ↓
⑤ Frontend: api/ → hooks/
        ↓
⑥ UI: copy primitive vào <module>/ui/ rồi lắp ghép
        ↓
⑦ nav.tsx + pnpm verify
```

**① Xác định bề mặt & module**

| Màn hình | Đặt tại |
|---|---|
| Route `/admin/...` | `features/admin/<module>/` |
| Route ngoài `/admin` | `features/employee/<module>/` |
| Dùng chung 2 bề mặt | `features/auth/` |
| API | `apps/api/src/modules/<module>/` |
| Bảng dữ liệu | `apps/api/prisma/schema/<module>.prisma` |

Bắt đầu bằng cách copy `features/_template/` → `features/<surface>/<module>/`.

**② Khai báo contract**

Type nghiệp vụ đặt ngay trong module. Payload request vẫn phải là class DTO có decorator `class-validator`.

**③ Schema Prisma**

Chỉ sửa file `.prisma` của module mình. File `users.prisma` giữ `generator` + `datasource`.

```bash
pnpm db:generate
pnpm db:migrate
```

**④ Backend**

- **Service**: business logic, dùng `$transaction` cho thao tác nhiều bước, phát sự kiện khi hoàn tất.
- **Controller**: chỉ guard + DTO + gọi service.
- **Gateway**: room đặt tên `<domain>:<id>`, event đặt tên `<domain>:<action>`.

**⑤ Frontend data layer**

```typescript
// api/tasks.api.ts — chỉ HTTP
export const tasksApi = {
  create: (dto: CreateTaskDto) => api.post<Task>("/tasks", dto),
};

// hooks/useTasks.ts — state + orchestration
export function useTasks() {
  const [items, setItems] = useState<Task[]>([]);
  // ...
  return { items, createTask };
}
```

Mọi request đi qua `features/auth/lib/api-client.ts` (`api`, `ApiError`) — client này tự gắn token và xử lý 401. **Không tự viết `fetch`.**

**⑥ UI**

```bash
# copy đúng primitive bạn cần, không import từ _template
cp apps/web/src/features/_template/ui/button/Button.tsx \
   apps/web/src/features/admin/tasks/ui/Button.tsx
```

Sau đó lắp ghép trong `components/`. Mọi class màu sắc lấy từ token trong `globals.css`.

**⑦ Đăng ký menu & kiểm tra**

```tsx
// features/admin/tasks/nav.tsx
import type { NavSection } from "@/features/admin/navigation";

export const tasksNav: NavSection = {
  name: "Công việc",
  icon: <FolderIcon />,
  path: "/admin/tasks",
  items: [/* ... */],
};
```

Tên export phải là `<camelCaseTênThưMục>Nav`. Sau đó:

```bash
pnpm nav:gen     # hoặc để pnpm dev / typecheck tự chạy
pnpm verify
```

### 5.3 Workflow Git

```
main
 └── feat/<module>/<mô-tả-ngắn>      tính năng mới
 └── fix/<module>/<mô-tả-ngắn>       sửa lỗi
```

1. Tạo nhánh từ `main`.
2. Code theo vertical slice — một PR chỉ chạm một module/màn hình.
3. `git pull --rebase origin main` trước khi push.
4. `pnpm verify` phải xanh.
5. Mở PR, điền template, chờ review theo `CODEOWNERS`.

**Commit message:**

```
<type>(<scope>): <mô tả ngắn bằng tiếng Anh>

type  : feat | fix | chore | refactor | docs
scope : attendance | tasks | chat | notifications | users | auth | ui | shell | db
```

Ví dụ: `feat(tasks): add kanban drag and drop`, `fix(auth): clear session on 401`.

---

## 6. Cài đặt & chạy

### 6.1 Yêu cầu

| Công cụ | Phiên bản | Kiểm tra |
|---|---|---|
| Node.js | ≥ 20 (khuyến nghị 20 LTS) | `node -v` |
| pnpm | ≥ 12 | `pnpm -v` |
| PostgreSQL | ≥ 14 (hoặc cloud tương thích) | — |

Cài pnpm nếu chưa có:

```bash
npm install -g pnpm
```

### 6.2 Cài dependencies

```bash
pnpm install
```

Lệnh `postinstall` tự chạy `gen-nav.mjs` để sinh menu — đây là lý do `navigation/generated.ts` không tồn tại trong repo.

### 6.3 Cấu hình biến môi trường

```bash
# macOS / Linux / Git Bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

```powershell
# Windows PowerShell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env.local
```

**Backend — `apps/api/.env`**

| Biến | Bắt buộc | Mặc định | Ý nghĩa |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | Chuỗi kết nối PostgreSQL |
| `JWT_SECRET` | ✅ | — | Khoá ký JWT, nên ≥ 32 ký tự ngẫu nhiên |
| `JWT_EXPIRES_IN` | | `7d` | Thời hạn access token |
| `PORT` | | `4000` | Cổng API |
| `WS_CORS_ORIGIN` | | `http://localhost:3000` | Origin được phép kết nối |
| `OFFICE_ALLOWED_IPS` | | `127.0.0.1,::1` | Dải IP được chấm công (chỉ chặn khi `NODE_ENV=production`) |
| `SEED_DEFAULT_PASSWORD` | | ngẫu nhiên | Mật khẩu cho tài khoản seed |
| `NODE_ENV` | | `development` | |

> `SMTP_*` và `REDIS_URL` có trong file mẫu nhưng **chưa được dùng** trong code hiện tại.

**Frontend — `apps/web/.env.local`**

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000` | Base URL của API |

Sinh secret nhanh:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6.4 Chuẩn bị database

Chọn một trong ba cách:

**Cách 1 — Cloud (nhanh nhất, không cần cài gì)**

Tạo database miễn phí tại [Neon](https://neon.tech) hoặc [Supabase](https://supabase.com), rồi dán chuỗi kết nối:

```env
DATABASE_URL="postgresql://user:pass@host/oneops?sslmode=require"
```

**Cách 2 — Docker**

```bash
docker run --name oneops-db \
  -e POSTGRES_USER=oneops \
  -e POSTGRES_PASSWORD=oneops \
  -e POSTGRES_DB=oneops \
  -p 5432:5432 -d postgres:16
```

```env
DATABASE_URL="postgresql://oneops:oneops@localhost:5432/oneops?schema=public"
```

**Cách 3 — Cài trực tiếp**

Cài PostgreSQL 14+ (hoặc [Postgres.app](https://postgresapp.com/) trên macOS), tạo database `oneops`, rồi trỏ `DATABASE_URL` vào đó.

### 6.5 Khởi tạo schema & dữ liệu mẫu

Repo **chưa có lịch sử migration** (`apps/api/prisma/migrations/` không tồn tại). Lần đầu dựng database, tạo migration khởi tạo:

```bash
pnpm --filter @oneops/api exec prisma migrate dev --name init
```

Từ lần sau trở đi (đã có migration):

```bash
pnpm db:migrate      # áp migration lên database
```

Sau đó sinh Prisma Client và nạp dữ liệu mẫu:

```bash
pnpm db:generate
pnpm db:seed
```

> Chỉ cần dữ liệu thử và không quan tâm migration: dùng `pnpm --filter @oneops/api exec prisma db push` để đẩy thẳng schema.

Seed tạo sẵn ba tài khoản:

| Email | Vai trò |
|---|---|
| `admin@oneops.vn` | `ADMIN` |
| `manager@oneops.vn` | `MANAGER` |
| `employee@oneops.vn` | `EMPLOYEE` |

Mật khẩu là giá trị `SEED_DEFAULT_PASSWORD`. Nếu không khai báo, script sinh mật khẩu ngẫu nhiên và **in ra một lần** trên terminal — hãy lưu lại.

### 6.6 Chạy development

```bash
pnpm dev
```

| Dịch vụ | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |

Chạy riêng lẻ:

```bash
pnpm dev:web
pnpm dev:api
```

### 6.7 Build production

```bash
pnpm build
```

### 6.8 Sử dụng lần đầu

1. Mở http://localhost:3000 — ứng dụng chuyển tới `/signin`.
2. Đăng nhập bằng một trong ba tài khoản seed ở mục 6.5.
3. Sau khi đăng nhập, bạn vào khu vực quản trị `/admin`.
4. Vào **Quản lý tài khoản** (`/admin/users`) để xem danh sách, tìm kiếm, lọc, tạo tài khoản mới hoặc tạm khoá một tài khoản.

Phím tắt: `Ctrl/Cmd + K` đưa con trỏ vào ô tìm kiếm ở header.

> Các màn hình chấm công, công việc, chat và thông báo chưa có giao diện — chỉ mới có API. Xem mục 2 và mục 11.

---

## 7. Lệnh thường dùng

### Cấp repo

| Lệnh | Tác dụng |
|---|---|
| `pnpm install` | Cài dependencies + sinh menu |
| `pnpm dev` | Chạy song song API và web |
| `pnpm dev:web` | Chỉ chạy frontend |
| `pnpm dev:api` | Chỉ chạy backend |
| `pnpm build` | Build cả hai app |
| `pnpm typecheck` | Typecheck API và web |
| `pnpm test` | Chạy test — hiện repo chưa có test file nào, `jest` sẽ báo "No tests found" |
| `pnpm lint:structure` | Kiểm tra ranh giới kiến trúc |
| `pnpm nav:gen` | Sinh lại menu |
| `pnpm ui:drift` | Xem bản UI copy nào đã lệch `_template` |
| **`pnpm verify`** | `nav:gen` + `lint:structure` + `typecheck` — **cổng chặn trước khi push** |

### Database

| Lệnh | Tác dụng |
|---|---|
| `pnpm db:migrate` | Tạo & áp migration mới (`prisma migrate dev`) |
| `pnpm db:generate` | Sinh Prisma Client |
| `pnpm db:seed` | Nạp dữ liệu mẫu |
| `pnpm db:studio` | Mở Prisma Studio |
| `pnpm db:reset` | Xoá và dựng lại database (mất dữ liệu) |

### API endpoints hiện có

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/auth/login` | Đăng nhập, trả access token |
| `GET` | `/users` | Danh sách tài khoản (phân trang, lọc) |
| `GET` | `/users/stats` | Số liệu tổng hợp cho thẻ KPI |
| `GET` | `/users/:id` | Chi tiết tài khoản |
| `POST` | `/users` | Tạo tài khoản |
| `PATCH` | `/users/:id` | Cập nhật hồ sơ |
| `PATCH` | `/users/:id/status` | Bật / tắt truy cập |
| `PATCH` | `/users/:id/password` | Đặt lại mật khẩu |
| `POST` | `/attendance/check-in` | Chấm công vào |
| `GET` | `/attendance/headcount` | Số người đang làm việc |
| `POST` | `/tasks` | Tạo công việc |
| `GET` | `/tasks` | Danh sách công việc |
| `PATCH` | `/tasks/:id/status` | Chuyển trạng thái |
| `GET` | `/chat/rooms` | Danh sách phòng chat |
| `GET` | `/notifications` | Thông báo của người dùng hiện tại |

---

## 8. Kiểm tra & CI

### Trước khi push

```bash
pnpm verify
```

Lệnh này chặn được:

| Lỗi | Ví dụ |
|---|---|
| Import chéo bề mặt | `admin` import `employee` |
| Import chéo module | Module `tasks` import service module `notifications` |
| Import xuyên module không qua barrel | `@/features/admin/users/components/UsersTable` thay vì `@/features/admin/users` |
| UI của module khác | `@/features/admin/users/ui/Button` |
| `console.log` | Bắt buộc dùng `Logger` ở BE |
| Lệch contract | Type BE và FE không khớp |

### CI

`.github/workflows/ci.yml` chạy trên mọi PR và push vào `main`:

```
pnpm install --frozen-lockfile
  → prisma generate + validate
  → lint:structure
  → typecheck
  → build web
```

CI dùng Node 20 và pnpm 12 — giữ máy local khớp để tránh lệch lockfile.

### `ui:drift` — kiểm soát "style trôi"

Mỗi module sở hữu bản UI riêng, nên các bản copy sẽ lệch dần. `pnpm ui:drift` in ra bản nào đã lệch và bao nhiêu dòng.

- **Không chặn merge** — lệch là được phép.
- Nhưng nếu **cùng một component lệch ở ≥ 3 module vì cùng một lý do** → đó là tín hiệu phải đưa khác biệt lên token trong `globals.css`, cập nhật `_template/ui`, rồi copy lại.
- Không bao giờ "gộp lại thành kit chung".

---

## 9. Xử lý sự cố

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| `Thiếu biến môi trường bắt buộc: JWT_SECRET` | Chưa có `apps/api/.env` | Copy từ `.env.example` và điền `JWT_SECRET` |
| `Can't reach database server` | `DATABASE_URL` sai hoặc DB chưa chạy | Kiểm tra chuỗi kết nối, thử `pnpm db:studio` |
| `@prisma/client did not initialize yet` | Chưa generate sau khi đổi schema | `pnpm db:generate` |
| `Cannot find module '@/features/admin/navigation'` | `generated.ts` chưa được sinh | `pnpm nav:gen` |
| Port 3000/4000 đang bận | Tiến trình cũ còn chạy | Đổi `PORT` trong `.env`, hoặc tắt tiến trình đang giữ cổng |
| Trang trắng sau khi đăng nhập | Token hết hạn hoặc sai `NEXT_PUBLIC_API_BASE_URL` | Kiểm tra `.env.local`, đăng nhập lại |
| Bấm **Sign out** nhưng bị đưa ngược về `/admin` | Menu hiện chỉ điều hướng về `/signin`, chưa xoá phiên | Xoá `oneops.accessToken` và `oneops.user` trong localStorage/sessionStorage, rồi tải lại `/signin` |
| CORS error | `WS_CORS_ORIGIN` không khớp origin của web | Đặt đúng, ví dụ `http://localhost:3000` |
| Chấm công bị chặn | IP ngoài `OFFICE_ALLOWED_IPS` khi `NODE_ENV=production` | Thêm dải IP văn phòng vào biến |
| Lỗi build `bcrypt` trên Windows | Thiếu prebuilt binary | Dùng Node 20 LTS, hoặc cài Visual Studio Build Tools |

---

## 10. Tài liệu

| Tài liệu | Nội dung | Ai đọc |
|---|---|---|
| [**AGENTS.md**](./AGENTS.md) | Ranh giới sở hữu file, 10 điều cấm kỷ luật, chuẩn kiến trúc BE/FE | Bắt buộc — cả người và AI |
| [**DESIGN.md**](./DESIGN.md) | Hợp đồng thị giác: token, 20 component spec, page pattern, accessibility, checklist | Làm bất kỳ UI nào |
| [**CLEANCODE.md**](./CLEANCODE.md) | Quy tắc viết code, đặt tên, độ dài hàm, checklist review | Trước khi mở PR |
| [**CONTRIBUTING.md**](./CONTRIBUTING.md) | Quy trình PR, đăng ký menu, xử lý conflict lockfile/schema | Người mới tham gia |
| [**skill.md**](./skill.md) | Quy trình thiết kế: phân loại, Design Read, critique 5 chiều, checklist | Làm task thiết kế |
| [features/_template/README.md](./apps/web/src/features/_template/README.md) | Danh mục bộ UI mẫu và cách copy | Tạo module mới |

### Thứ tự ưu tiên khi tài liệu mâu thuẫn

```
brief người dùng
  → AGENTS.md / CLEANCODE.md   (kiến trúc, ranh giới, chất lượng code)
  → DESIGN.md                   (hợp đồng thị giác)
  → skill.md                    (quy trình, craft)
  → mặc định của framework
```

---

## 11. Trạng thái dự án

| Hạng mục | Trạng thái |
|---|---|
| Monorepo, CI, kiểm tra ranh giới | ✅ Hoàn thành |
| Design system & token | ✅ Hoàn thành |
| App shell (header, sidebar, dark mode, responsive) | ✅ Hoàn thành |
| Xác thực JWT & phân quyền | ✅ Hoàn thành |
| Quản lý tài khoản (admin) | ✅ Hoàn thành |
| Chấm công | 🟡 Backend xong · Frontend đang làm |
| Công việc / Kanban | 🟡 Backend xong · Frontend đang làm |
| Chat | 🟡 Backend xong · Frontend đang làm |
| Thông báo | 🟡 Backend xong · Frontend đang làm |
| Bề mặt nhân viên (`features/employee/`) | ⬜ Chưa bắt đầu |
| Test tự động | ⬜ Chưa có test file |
| ESLint / Prettier | ⬜ Chưa cấu hình |

---

## Đóng góp

1. Đọc `AGENTS.md` và `CONTRIBUTING.md`.
2. Tạo nhánh `feat/<module>/<tên-ngắn>`.
3. Chạy `pnpm verify` trước khi push.
4. Mở PR theo template.

Câu hỏi về kiến trúc: xem `AGENTS.md`. Câu hỏi về giao diện: xem `DESIGN.md`.

---

<p align="center">
  <sub>Dự án nội bộ · Chưa có tệp LICENSE</sub>
</p>
