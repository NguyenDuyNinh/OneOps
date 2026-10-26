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
│                        packages/shared-types                           │
│                 (Hợp đồng dữ liệu - Nguồn sự thật duy nhất)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Types dùng chung
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
2. **Nguồn Sự Thật Duy Nhất (`packages/shared-types`)**:
   Mọi Enum, Interface, DTO payload đều được định nghĩa tại một package dùng chung. Khi Backend hoặc Frontend gõ sai 1 ký tự, lệnh `pnpm typecheck` sẽ báo đỏ ngay lập tức trước khi code được đẩy lên Git.
3. **Kiến Trúc Khớp Nối Lỏng Bằng Sự Kiện (Event-Driven Architecture)**:
   Thay vì Dev 2 `inject` Service của Dev 3 để gửi thông báo, Dev 2 chỉ việc phát ra một sự kiện:
   `this.eventEmitter.emit('task.created', payload)`.
   Dev 3 ở module bên cạnh chỉ việc đón nghe bằng `@OnEvent('task.created')`. Hai module hoàn toàn không biết đến sự tồn tại của nhau ở tầng code, triệt tiêu 100% nguy cơ Circular Dependency và xung đột merge!

---

## 2. Sơ Đồ Phân Bổ 3 Kỹ Sư & Ranh Giới Module

| Thành viên | Phân Hệ Nghiệp Vụ | Backend Sở Hữu (`apps/api`) | Frontend Sở Hữu (`apps/web`) | Shared Types (`packages/shared-types`) |
|---|---|---|---|---|
| **👤 Dev 1** | **Điểm Danh & Ca Làm Việc** | `modules/attendance/` | `features/attendance/`<br>`app/attendance/` | `attendance.types.ts` |
| **👤 Dev 2** | **Quản Lý Task & Kanban Board** | `modules/tasks/` | `features/tasks/`<br>`app/tasks/` | `task.types.ts` |
| **👤 Dev 3** | **Chat & Trung Tâm Thông Báo** | `modules/chat/`<br>`modules/notifications/` | `features/chat/`<br>`features/notifications/`<br>`app/chat/` | `chat.types.ts`<br>`notification.types.ts` |

---

## 3. Giải Phẫu Cấu Trúc Source Code Chi Tiết

```
oneops/
├── apps/
│   ├── api/                                # BACKEND: NestJS Framework
│   │   ├── src/
│   │   │   ├── core/                       # [SHARED] Hạ tầng cốt lõi
│   │   │   │   ├── prisma.service.ts       # Kết nối DB qua Prisma singleton
│   │   │   │   ├── guards/                 # JwtAuthGuard, RolesGuard
│   │   │   │   └── decorators/             # @CurrentUser(), @Roles(), @Public()
│   │   │   ├── modules/
│   │   │   │   ├── auth/                   # Xác thực JWT, đăng nhập, phân quyền
│   │   │   │   ├── users/                  # Quản lý hồ sơ nhân viên
│   │   │   │   ├── attendance/             # [Dev 1] Logic điểm danh, kiểm tra IP văn phòng
│   │   │   │   ├── tasks/                  # [Dev 2] Máy trạng thái 7 bước, Kanban, đề xuất
│   │   │   │   ├── chat/                   # [Dev 3] Socket Gateway, phòng chat 1-1 & nhóm
│   │   │   │   └── notifications/          # [Dev 3] Lắng nghe Event, đẩy In-app notification
│   │   │   ├── app.module.ts               # Root Module tổng hợp
│   │   │   └── main.ts                     # Điểm khởi chạy API (Port 4000)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                                # FRONTEND: Next.js 14 App Router
│       ├── src/
│       │   ├── app/                        # Next.js App Router (Routing)
│       │   │   ├── attendance/page.tsx     # [Dev 1] Màn hình điểm danh
│       │   │   ├── tasks/page.tsx          # [Dev 2] Màn hình bảng Kanban
│       │   │   ├── chat/page.tsx           # [Dev 3] Màn hình hội thoại
│       │   │   ├── layout.tsx              # Root HTML Layout
│       │   │   └── globals.css             # Design tokens, màu sắc, font chữ
│       │   ├── features/                   # Feature-Sliced Design (Tách biệt tính năng)
│       │   │   ├── attendance/             # [Dev 1] API client, hooks, components
│       │   │   ├── tasks/                  # [Dev 2] API client, hooks, components
│       │   │   ├── chat/                   # [Dev 3] API client, hooks, components
│       │   │   └── notifications/          # [Dev 3] Popover thông báo, chuông thông báo
│       │   └── shared/                     # Thư viện dùng chung của Frontend
│       │       ├── lib/api-client.ts       # Axios instance đính kèm JWT tự động
│       │       └── lib/socket-client.ts    # Socket.IO client kết nối thời gian thực
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── database/                           # ORM & DATABASE SCHEMA
│   │   ├── prisma/schema.prisma            # Khai báo Models, Enums, Relations PostgreSQL
│   │   └── src/index.ts                    # Export PrismaClient dùng chung
│   ├── shared-types/                       # TYPESCRIPT TYPES (HỢP ĐỒNG DỮ LIỆU)
│   │   └── src/
│   │       ├── attendance.types.ts         # [Dev 1] Types & DTOs điểm danh
│   │       ├── task.types.ts               # [Dev 2] Types & DTOs công việc
│   │       ├── chat.types.ts               # [Dev 3] Types tin nhắn, phòng chat
│   │       ├── notification.types.ts       # [Dev 3] Types sự kiện thông báo
│   │       └── user.types.ts               # Types người dùng & JWT
│   └── config/                             # Cấu hình TypeScript base
│
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

### Bước 1: Khai báo Hợp đồng Dữ liệu (Shared Types)
Mở file types của module mình trong `packages/shared-types/src/` để thêm interface hoặc DTO:
```typescript
// packages/shared-types/src/task.types.ts
export interface CreateTaskDto {
  title: string;
  deadline: string;
  assigneeId: string;
}
```

### Bước 2: Bổ sung Database Model (Nếu có)
Nếu tính năng cần bảng mới, tạo PR sửa `packages/database/prisma/schema.prisma` và chạy:
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
