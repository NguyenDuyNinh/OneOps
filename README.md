# OneOps — Nền Tảng Vận Hành Nội Bộ Hợp Nhất

> **Hệ thống điều hành quản lý nhân sự, điểm danh, phân công nhiệm vụ (Kanban) và giao tiếp nội bộ theo thời gian thực.**
> Dự án được xây dựng theo mô hình **Monorepo kết hợp Kiến trúc Hướng Sự Kiện (Event-Driven Architecture)**, tối ưu cho 3 lập trình viên phát triển song song với **tỷ lệ xung đột code xấp xỉ bằng 0 (Zero-Conflict Merge)**.

---

## MỤC LỤC
1. [Hiệu Quả Của Phương Pháp Luận OneOps](#1-hiệu-quả-của-phương-pháp-luận-oneops)
2. [Sơ Đồ Phân Bổ 3 Kỹ Sư & Ranh Giới Module](#2-sơ-đồ-phân-bổ-3-kỹ-sư--ranh-giới-module)
3. [Giải Phẫu Cấu Trúc Source Code Chi Tiết](#3-giải-phẫu-cấu-trúc-source-code-chi-tiết)
4. [Luồng Dữ Liệu Hoạt Động (Data Flow Walkthrough)](#4-luồng-dữ-liệu-hoạt-động-data-flow-walkthrough)
5. [Quy Trình Phát Triển Một Tính Năng Mới (Step-by-Step)](#5-quy-trình-phát-triển-một-tính-năng-mới-step-by-step)
6. [Hướng Dẫn Cài Đặt & Khởi Chạy Hệ Thống](#6-hướng-dẫn-cài-đặt--khởi-chạy-hệ-thống)
7. [Tài Liệu Quy Chuẩn Đi Kèm](#7-tài-liệu-quy-chuẩn-đi-kèm)

---

## 1. Hiệu Quả Của Phương Pháp Luận OneOps

### 1.1 Những vấn đề nhức nhối khi 3 lập trình viên làm chung dự án
Trong các dự án truyền thống, khi 3 người cùng làm việc trên một repository, các vấn đề sau luôn xảy ra:
* **Xung đột Merge liên miên (Merge Conflicts)**: Cả 3 người cùng sửa file `app.module.ts`, cùng sửa file `routes.ts`, hoặc cùng đụng vào `schema.prisma`.
* **Phụ thuộc chéo nguy hiểm (Spaghetti Coupling)**: Module Task gọi trực tiếp Service của Notification, Notification lại gọi ngược lại User/Attendance, tạo thành các vòng lặp phụ thuộc (Circular Dependency) khiến hệ thống không thể khởi động hoặc crash ngầm.
* **Lệch pha kiểu dữ liệu (Type Drift)**: Backend sửa trường `status` từ số sang chữ, nhưng Frontend không hề biết, dẫn đến lỗi runtime trên giao diện.
* **Tắc nghẽn tiến độ (Blockers)**: Dev 3 phải ngồi đợi Dev 1 và Dev 2 code xong API thì mới có thể bắt đầu tích hợp thông báo.

### 1.2 Giải pháp phương pháp luận tại OneOps
Để giải quyết triệt để các vấn đề trên, OneOps áp dụng 3 trụ cột kiến trúc:

```
┌────────────────────────────────────────────────────────────────────────┐
│  MỖI APP TỰ SỞ HỮU HỢP ĐỒNG DỮ LIỆU (không còn package chung)          │
│  BE: apps/api/src/modules/<module>/<module>.types.ts                   │
│  FE: apps/web/src/features/<surface>/<module>/types.ts                 │
│  BE: platform · database | FE: auth (dùng chung cả 2 bề mặt)            │
│  UI: mỗi module tự sở hữu `<module>/ui/` — không có UI kit dùng chung   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                    │ Types nội bộ từng app
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│     Dev 1     │           │     Dev 2     │           │     Dev 3     │
│  Điểm Danh    │           │  Công Việc    │           │  Chat & Notif │
│  (Attendance) │           │  (Tasks)      │           │ (Comm & Hub)  │
└───────┬───────┘           └───────┬───────┘           └───────┬───────┘
        │ emit('attendance.*')      │ emit('task.*')            ▲
        └───────────────────────────┼───────────────────────────┘
                                    │ Lắng nghe qua @OnEvent()
                                    ▼
                      [EventEmitter2 Bus Lõi]
```

1. **Phân Ranh Giới Dọc (Vertical Slice Ownership)**:
   Mỗi developer làm chủ hoàn toàn một lát cắt dọc độc lập từ DB Model $\rightarrow$ DTO $\rightarrow$ NestJS Service/Controller $\rightarrow$ Next.js Hook $\rightarrow$ UI Component. Dev 1 không bao giờ phải chạm vào thư mục của Dev 2 hay Dev 3.
2. **Mỗi App Tự Sở Hữu Hợp Đồng Dữ Liệu (Vertical Slice Types)**:
   Backend khai báo model/enum/response/event ngay trong `apps/api/src/modules/<module>/<module>.types.ts`; Frontend khai báo shape mình dùng trong `apps/web/src/features/<surface>/<module>/types.ts`. Cùng một domain ở bề mặt admin và bề mặt nhân viên thì **viết 2 bản** — chấp nhận lặp để hai bề mặt không phụ thuộc nhau; chỉ định danh (`UserRole`, `AuthenticatedUser`) nằm ở `features/auth/types.ts`. Nhờ vậy module là một khối trọn vẹn, không phải sửa file chung khi thêm tính năng — và `pnpm typecheck` vẫn bắt được lệch contract giữa hai phía.
3. **Kiến Trúc Khớp Nối Lỏng Bằng Sự Kiện (Event-Driven Architecture)**:
   Thay vì Dev 2 `inject` Service của Dev 3 để gửi thông báo, Dev 2 chỉ việc phát ra một sự kiện:
   `this.eventEmitter.emit('task.created', payload)`.
   Dev 3 ở module bên cạnh chỉ việc đón nghe bằng `@OnEvent('task.created')`. Hai module hoàn toàn không biết đến sự tồn tại của nhau ở tầng code, triệt tiêu 100% nguy cơ Circular Dependency và xung đột merge!

---

## 2. Sơ Đồ Phân Bổ 3 Kỹ Sư & Ranh Giới Module

| Thành viên | Phân Hệ Nghiệp Vụ | Backend Sở Hữu (`apps/api`) | Frontend Sở Hữu (`apps/web`) | Types Sở Hữu |
|---|---|---|---|---|
| **👤 Dev 1** | **Điểm Danh & Ca Làm Việc** | `modules/attendance/` | `features/attendance/` (chưa triển khai)<br>route `/admin/attendance` | `attendance.types.ts`<br>`features/attendance/types.ts` |
| **👤 Dev 2** | **Quản Lý Task & Kanban Board** | `modules/tasks/` | `features/tasks/` (chưa triển khai)<br>route `/admin/tasks` | `tasks.types.ts`<br>`features/tasks/types.ts` |
| **👤 Dev 3** | **Chat & Trung Tâm Thông Báo** | `modules/chat/`<br>`modules/notifications/` | `features/chat/`<br>`features/notifications/` (chưa triển khai) | `chat.types.ts`<br>`notifications.types.ts`<br>`features/chat/types.ts` |

---

## 3. Giải Phẫu Cấu Trúc Source Code Chi Tiết

```
oneops/
├── apps/
│   ├── api/                                # BACKEND: NestJS Framework
│   │   ├── prisma/
│   │   │   ├── schema/                     # 1 file/module: users, attendance, tasks,
│   │   │   │                               # chat, notifications (users giữ datasource)
│   │   │   └── seed.ts                     # Seed tài khoản mẫu
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── database/               # [SHARED] PrismaService + DatabaseModule
│   │   │   │   ├── platform/               # [SHARED] guards/, decorators/, types/
│   │   │   │   ├── auth/                   # Xác thực JWT, đăng nhập, phân quyền
│   │   │   │   ├── users/                  # Quản lý hồ sơ nhân viên
│   │   │   │   ├── attendance/             # [Dev 1] Điểm danh + attendance.types.ts
│   │   │   │   ├── tasks/                  # [Dev 2] Kanban + tasks.types.ts
│   │   │   │   ├── chat/                   # [Dev 3] Socket Gateway + chat.types.ts
│   │   │   │   └── notifications/          # [Dev 3] Event listener + notifications.types.ts
│   │   │   ├── app.module.ts               # Root Module tổng hợp
│   │   │   └── main.ts                     # Điểm khởi chạy API (Port 4000)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                                # FRONTEND: Next.js 14 App Router
│       ├── src/
│       │   ├── app/                        # Next.js App Router (Routing)
│       │   │   ├── admin/                  # [AuthGuard] tổng quan + users/
│       │   │   ├── (auth)/signin/          # Đăng nhập
│       │   │   ├── layout.tsx              # Root HTML Layout
│       │   │   └── globals.css             # Design tokens, màu sắc, font chữ
│       │   ├── features/                   # Chia theo BỀ MẶT (surface)
│       │   │   ├── auth/                   # [DÙNG CHUNG] đăng nhập, session, api-client, UserRole
│       │   │   ├── admin/                  # Bề mặt quản trị — route /admin/*
│       │   │   │   ├── navigation/         #   menu của bề mặt (module riêng)
│       │   │   │   │   ├── types.ts        #     NavSection, SubMenuItem
│       │   │   │   │   ├── base.tsx        #     nhóm cố định (tổng quan, auth)
│       │   │   │   │   └── generated.ts    #     ráp tự động — KHÔNG sửa tay, đã gitignore
│       │   │   │   ├── app-shell/          #   hạ tầng bề mặt: header, sidebar, theme context
│       │   │   │   │   └── ui/             #     UI riêng của shell (dropdown...)
│       │   │   │   └── users/              #   quản lý tài khoản
│       │   │   │       ├── ui/             #     UI riêng của module (alert/ button/ modal/ table...)
│       │   │   │       ├── components/     #     UI nghiệp vụ (UsersTable, UserFormModal...)
│       │   │   │       ├── hooks/ api/     #     logic + gọi API
│       │   │   │       └── nav.tsx         #     menu của module (tự ráp, không sửa file chung)
│       │   │   ├── employee/               # Bề mặt nhân viên — thêm module tại đây (chưa triển khai)
│       │   │   └── _template/              # Mẫu copy cho slice mới
│       │   │       └── ui/                 #   bộ UI mẫu đầy đủ — copy vào <module>/ui/
│       │   └── icons/                      # Bộ icon SVG dùng chung
│       ├── package.json
│       └── tsconfig.json
│
├── scripts/
│   ├── gen-nav.mjs                         # Sinh menu từ features/<surface>/<module>/nav.tsx
│   ├── check-boundaries.mjs                # Chặn import chéo bề mặt/module (dùng trong CI)
│   └── ui-drift.mjs                        # Báo cáo bản UI copy nào đã lệch bộ mẫu (pnpm ui:drift)
│
├── .github/
│   ├── CODEOWNERS                          # Chủ sở hữu theo vùng → tự request review
│   ├── pull_request_template.md
│   └── workflows/ci.yml                    # verify + typecheck + build
│
├── CONTRIBUTING.md                         # Quy tắc PR, xử lý conflict lockfile/schema
├── AGENTS.md                               # Luật tối cao cho AI & Developers
├── CLEANCODE.md                            # Cẩm nang quy tắc viết code chi tiết
├── pnpm-workspace.yaml                     # Quản lý liên kết nội bộ Monorepo
└── package.json                            # Scripts build & chạy toàn hệ thống
```

---

## 4. Luồng Dữ Liệu Hoạt Động (Data Flow Walkthrough)

Dưới đây là ví dụ minh họa trực quan luồng vận hành khi **Quản lý tạo một Task mới cho Nhân viên**:

```
[Quản lý trên Next.js Web]
       │
       ▼ (1) Gửi form tạo task (POST /tasks)
[TasksController (Dev 2)]
       │
       ▼ (2) Validate DTO bằng class-validator
[TasksService (Dev 2)]
       │
       ├─► (3) Ghi dữ liệu Task vào PostgreSQL qua PrismaService
       │
       └─► (4) Bắn sự kiện nội bộ:
               this.eventEmitter.emit('task.created', { taskId, title, assigneeId })
                       │
                       ▼
       [NotificationsService (Dev 3)]  <--- Đón nghe bằng @OnEvent('task.created')
               │
               ├─► (5) Lưu thông báo vào bảng Notification trong DB
               │
               └─► (6) Bắn WebSocket tới phòng cá nhân của Nhân viên:
                       this.server.to(`user:${assigneeId}`).emit('notification:new', notif)
                               │
                               ▼
               [Next.js Client của Nhân viên]
               (Chuông thông báo nhảy số đỏ tức thì trong vòng 2 giây - No reload!)
```

---

## 5. Quy Trình Phát Triển Một Tính Năng Mới (Step-by-Step)

Mỗi khi nhận một User Story mới, developer thực hiện tuần tự theo 5 bước:

### Bước 1: Khai báo Hợp đồng Dữ liệu trong Module
Không còn package `shared-types`: mỗi app tự khai báo contract của mình ngay trong slice.
```typescript
// BE — apps/api/src/modules/tasks/tasks.types.ts (model / response / event payload)
export interface TaskSummary {
  id: string;
  title: string;
  deadline: Date;
}

// FE — apps/web/src/features/tasks/types.ts (shape FE thực sự dùng)
export interface TaskSummary {
  id: string;
  title: string;
  deadline: string; // ISO 8601 sau khi serialize qua HTTP
}
```
* Payload **request** phía API vẫn phải là class DTO `class-validator` trong `modules/<module>/dto/` — không khai báo lại các DTO đó trong `*.types.ts`.
* Type dùng từ 2 feature trở lên đặt tại `apps/api/src/modules/platform/types/` (BE) hoặc `apps/web/src/features/auth/types.ts` (FE, chỉ định danh/vai trò). Type nghiệp vụ ở FE **cố ý lặp** giữa bề mặt admin và employee.

### Bước 2: Bổ sung Database Model (Nếu có)
Nếu tính năng cần bảng mới, tạo PR sửa `apps/api/prisma/schema/<module>.prisma` và chạy:
```bash
pnpm db:generate
```

### Bước 3: Hiện thực hóa Backend (NestJS)
Tạo DTO validation $\rightarrow$ Viết Service logic $\rightarrow$ Mở Endpoint tại Controller:
```typescript
// apps/api/src/modules/tasks/tasks.service.ts
async create(userId: string, dto: CreateTaskDto) {
  // Logic kiểm tra hạn, phân công, ghi DB...
  this.eventEmitter.emit('task.created', task);
  return task;
}
```

### Bước 4: Viết API Client & Hook tại Frontend (Next.js)
```typescript
// apps/web/src/features/tasks/api/tasks.api.ts
export const tasksApi = {
  create: (dto: CreateTaskDto): Promise<Task> => apiClient.post('/tasks', dto),
};

// apps/web/src/features/tasks/hooks/useTasks.ts
export function useTasks() {
  const createTask = async (dto: CreateTaskDto) => {
    return await tasksApi.create(dto);
  };
  return { createTask };
}
```

### Bước 5: Render Giao Diện (React Component)
Component chỉ gọi qua Hook, áp dụng CSS Modules để đảm bảo giao diện đẹp mắt và độc lập:
```tsx
// apps/web/src/features/tasks/components/CreateTaskModal.tsx
export function CreateTaskModal() {
  const { createTask } = useTasks();
  // Render JSX...
}
```

---

## 6. Hướng Dẫn Cài Đặt & Khởi Chạy Hệ Thống

### 6.1 Yêu cầu tiên quyết
* **Node.js**: Phiên bản 20 trở lên (`node -v`).
* **pnpm**: Phiên bản 9 trở lên (`npm install -g pnpm`).

### 6.2 Cài đặt Dependencies
Tại thư mục gốc dự án:
```bash
pnpm install
```

### 6.3 Cấu hình Cơ Sở Dữ Liệu (PostgreSQL)
Bạn có thể chọn **1 trong 3 cách** (Không bắt buộc phải dùng Docker):

* **Cách 1: Cloud Database miễn phí (Khuyên dùng khi làm nhóm)**:
  Tạo DB miễn phí trong 30 giây tại **[Neon.tech](https://neon.tech)** hoặc **[Supabase](https://supabase.com)**. Lấy URL dán vào file `.env`:
  ```env
  DATABASE_URL="postgresql://user:pass@ep-cool-db.neon.tech/oneops?sslmode=require"
  ```
* **Cách 2: Cài ứng dụng trực tiếp trên macOS**:
  Tải app **[Postgres.app](https://postgresapp.com/)**, mở lên và bấm *Initialize*.
* **Cách 3: Chạy qua Docker**:
  ```bash
  docker run --name oneops-db -e POSTGRES_USER=oneops -e POSTGRES_PASSWORD=oneops -e POSTGRES_DB=oneops -p 5432:5432 -d postgres:16
  ```

### 6.4 Đồng Bộ Database & Prisma Client
```bash
# Đẩy schema lên database
pnpm db:migrate

# Tạo Prisma Client cho TypeScript
pnpm db:generate
```

### 6.5 Khởi Chạy Toàn Bộ Ứng Dụng (Development)
Chỉ với 1 dòng lệnh duy nhất, cả Backend và Frontend sẽ cùng khởi chạy:
```bash
pnpm dev
```
* **Backend NestJS API**: `http://localhost:4000`
* **Frontend Next.js Web**: `http://localhost:3000`

---

## 7. Tài Liệu Quy Chuẩn Đi Kèm

Mọi thành viên và AI Agent khi làm việc trong dự án bắt buộc phải tham khảo:
1. **[AGENTS.md](./AGENTS.md)**: 10 điều cấm kỷ luật, phân quyền sở hữu file cho từng Dev, quy tắc bảo toàn kiến trúc.
2. **[CLEANCODE.md](./CLEANCODE.md)**: Tiêu chuẩn viết code sạch, quy tắc đặt tên, giới hạn độ dài hàm, checklist review trước khi merge PR.
