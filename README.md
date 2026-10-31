# OneOps — Nền Tảng Điều Hành & Quản Lý Doanh Nghiệp Hợp Nhất

> **OneOps** (One-stop Operations Management Platform) là hệ thống quản trị vận hành doanh nghiệp toàn diện, tích hợp chặt chẽ giữa **Quản trị hệ thống (Tenant System)**, **Quản lý nhân sự (HR Management)**, **Điều phối công việc (Work Management)** và **Quản lý quan hệ khách hàng (CRM)** trên nền tảng kiến trúc Monorepo hiện đại, an toàn và có khả năng mở rộng cao.

---

## Mục lục

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Ngăn xếp công nghệ (Tech Stack)](#2-ngăn-xếp-công-nghệ-tech-stack)
3. [Kiến trúc & Ranh giới phân hệ](#3-kiến-trúc--ranh-giới-phân-hệ)
4. [Danh mục 20 chức năng dữ liệu đã triển khai](#4-danh-mục-20-chức-năng-dữ-liệu-đã-triển-khai)
5. [Quy tắc nghiệp vụ cốt lõi & Cơ chế an toàn](#5-quy-tắc-nghiệp-vụ-cốt-lõi--cơ-chế-an-toàn)
6. [Hướng dẫn cài đặt & Khởi động nhanh](#6-hướng-dẫn-cài-đặt--khởi-động-nhanh)
7. [Hướng dẫn sử dụng hệ thống (User Guide)](#7-hướng-dẫn-sử-dụng-hệ-thống-user-guide)
8. [Hệ thống Design Tokens & Tùy biến Theme](#8-hệ-thống-design-tokens--tùy-biến-theme)
9. [Bộ lệnh phát triển & Cổng kiểm tra chất lượng](#9-bộ-lệnh-phát-triển--cổng-kiểm-tra-chất-lượng)
10. [Quy tắc phát triển & Hướng dẫn phối hợp AI](#10-quy-tắc-phát-triển--hướng-dẫn-phối-hợp-ai)

---

## 1. Tổng quan hệ thống

OneOps được thiết kế nhằm giải quyết bài toán phân mảnh dữ liệu trong doanh nghiệp, quy tụ mọi luồng nghiệp vụ hàng ngày về một không gian làm việc số thống nhất:

- **Hệ thống đa người dùng & Đa cấp quyền (Tenant & Multi-tenant Ready):** Định danh tổ chức, phiên làm việc an toàn với sliding-window, phân quyền hạn chế theo vai trò (RBAC), kiểm soát tài khoản và nhật ký kiểm toán bất biến (append-only checklog).
- **Quản trị nhân lực thông minh (HR Management):** Sơ đồ tổ chức phân cấp hình cây không chu trình, phòng ban, chức danh, ngạch bậc, hồ sơ nhân sự và theo dõi công suất nhân lực.
- **Không gian điều hành công việc linh hoạt (Work Management):** Bảng tổng quan cá nhân hóa ("Workspace Today"), lịch làm việc, quản lý công việc với bảng Kanban trực quan, máy trạng thái công việc (Task State Machine), bình luận trao đổi, dự án, mốc tiến độ & cổng kiểm định chất lượng (QA Gate), chấm công thời gian thực (Timesheets), hệ thống đề xuất & duyệt (Approvals), ghi chú SOP nội bộ và trung tâm thông báo thời gian thực qua Server-Sent Events (SSE).
- **Chuẩn bị mở rộng kinh doanh (CRM):** Cấu trúc sẵn sàng cho quy trình tiền bán hàng (Leads/Briefs), hợp đồng thương mại (Quotations/Contracts) và chăm sóc khách hàng sau bán (Customer Portal).

---

## 2. Ngăn xếp công nghệ (Tech Stack)

| Tầng hệ thống | Công nghệ chủ đạo | Phiên bản & Đặc điểm |
| :--- | :--- | :--- |
| **Monorepo** | npm Workspaces | Quản lý đồng bộ giữa `apps/*` và `packages/*` |
| **Frontend Web** | Next.js, React, Tailwind CSS | **Next.js 16.4.3** (App Router, React 19), Tailwind CSS v4, Radix UI Primitives, CSS Modules cục bộ |
| **Backend API** | NestJS, TypeScript, Node.js | **NestJS 11**, Node.js ≥ 22.12.0, Zod DTO Validation, Server-Sent Events (SSE), Session sliding-window |
| **Database & ORM** | PostgreSQL, Prisma ORM | **PostgreSQL 16+**, **Prisma 7.10.1** với multi-schema database federation, Optimistic Concurrency Control |
| **Design System** | OneOps Token Studio | **187 semantic tokens**, hỗ trợ Light/Dark themes, Comfortable/Compact density |
| **Kiểm thử tự động** | Playwright, Node Test Runner | Playwright 1.64.1 (E2E), Node.js native test runner cho API integration tests |

---

## 3. Kiến trúc & Ranh giới phân hệ

Hệ thống tuân thủ nghiêm ngặt **Kiến trúc Lục giác (Hexagonal / Clean Architecture)** và nguyên tắc cô lập ranh giới chức năng (**Strict Feature Boundaries**).

```text
oneops/
├── apps/
│   ├── web/                           # Next.js App Router (Port 3002)
│   │   └── src/
│   │       ├── app/                   # Route mỏng (render public components)
│   │       ├── core/                  # Hạ tầng web, Shell, Feature Registry, Design System
│   │       └── features/              # Feature modules tự sở hữu UI/Hooks/API clients
│   │           ├── tenant-system/     # Phân hệ quản trị hệ thống
│   │           ├── hr-management/     # Phân hệ quản lý nhân sự
│   │           ├── work-management/   # Phân hệ điều phối công việc
│   │           └── crm/               # Phân hệ quan hệ khách hàng
│   └── api/                           # NestJS Backend API (Port 4000)
│       └── src/
│           ├── core/                  # Guard phiên, Exception filters, Event emitter
│           └── features/              # Feature modules tự sở hữu Controller/Service/Repo/Prisma
│               ├── tenant-system/
│               ├── hr-management/
│               ├── work-management/
│               └── crm/
├── packages/
│   └── database/                      # Prisma schema base, migrations và generated client
├── tokens/                            # Single source of truth cho design tokens (source.json)
└── scripts/                           # Bộ công cụ build tokens, check boundaries, dev server
```

### Nguyên tắc ranh giới bất biến (Immutable Invariants)
1. **Không import chéo giữa các Leaf Feature:** Mỗi feature tự định nghĩa UI, primitives, hook, HTTP client, types, DTO, service, repository và model Prisma của chính nó. Không tạo "shared business component", generic CRUD factory hay base repository dùng chung.
2. **Tích hợp liên phân hệ qua Composition Module:** Khi cần điều phối nghiệp vụ giữa các chức năng, sử dụng Composition Service ở tầng domain (ví dụ: `work-management.composition.ts`, `permission-audit.ts`), gọi thông qua public interfaces đã được kiểm soát.
3. **Chỉ Repository chạm Database:** Controller chỉ xử lý HTTP; Service chỉ xử lý nghiệp vụ thuần túy; duy nhất Repository được phép import `@oneops/database` và truy vấn database delegate.
4. **Không tạo file placeholder:** Các chức năng chưa làm phải được để trống hoàn toàn; không sinh API giả hoặc file rỗng để "làm đẹp" cây thư mục.

---

## 4. Danh mục 20 chức năng dữ liệu đã triển khai

Hệ thống OneOps hiện sở hữu **20 chức năng dữ liệu hoàn chỉnh** (gồm 9 Resource Features đã đăng ký trong `modules.json` và 11 Data Features mở rộng):

| STT | Phân hệ (Domain) | Tên chức năng | Đường dẫn Feature | Route Web | Schema Database | Model Prisma chính |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `tenant-system` | **Xác thực phiên** | `access-control/tenant-auth` | `/tenant-system/auth` | `tenant_auth` | `TenantSession` |
| 2 | `tenant-system` | **Quản lý tài khoản** | `access-control/accounts` | `/tenant-system/accounts` | `tenant_accounts` | `TenantAccount` |
| 3 | `tenant-system` | **Vai trò & Quyền hạn** | `access-control/roles-permissions` | `/tenant-system/roles-permissions` | `tenant_permissions` | `TenantRole`, `TenantRoleBinding` |
| 4 | `tenant-system` | **Nhật ký kiểm toán** | `checklog` | `/tenant-system/checklog` | `tenant_checklog` | `AuditChecklog` |
| 5 | `hr-management` | **Phòng ban & Đội ngũ** | `organization/departments-teams` | `/hr-management/organization` | `hr_departments` | `HrDepartment` |
| 6 | `hr-management` | **Chức danh & Ngạch bậc** | `organization/positions-grades` | `/hr-management/positions` | `hr_positions` | `HrPosition` |
| 7 | `hr-management` | **Hồ sơ nhân sự** | `employees/employee-directory` | `/hr-management/employees` | `hr_employees` | `HrEmployee` |
| 8 | `work-management` | **Tổng quan làm việc** | `coordination/workspace-today` | `/` (Home) | `work_dashboard` | `WorkspaceWidget` |
| 9 | `work-management` | **Công việc & Nhiệm vụ** | `work/tasks` | `/work-management/tasks` | `work_tasks` | `WorkTask` |
| 10 | `work-management` | **Bảng Kanban** | `work/tasks` (Kanban view) | `/work-management/kanban` | `work_tasks` | `WorkTask` |
| 11 | `work-management` | **Luồng quy trình việc** | `work/tasks/workflow` | `/work-management/tasks` | `work_task_workflow` | `WorkTaskWorkflow` |
| 12 | `work-management` | **Thảo luận công việc** | `work/tasks/comments` | `/work-management/tasks` | `work_task_comments` | `WorkTaskComment` |
| 13 | `work-management` | **Không gian dự án** | `projects/project-spaces` | `/work-management/projects` | `work_projects` | `WorkProject` |
| 14 | `work-management` | **Mốc tiến độ & Cổng QA** | `projects/milestones-qa` | `/work-management/milestones` | `work_milestones_qa` | `WorkMilestone`, `WorkQaGate` |
| 15 | `work-management` | **Chấm công thời gian** | `work/timesheets` | `/work-management/timesheets` | `work_timesheets` | `WorkTimesheet` |
| 16 | `work-management` | **Lịch sự kiện** | `coordination/workspace-today/calendar` | `/work-management/calendar` | `work_calendar` | `WorkEvent` |
| 17 | `work-management` | **Đề xuất & Phê duyệt** | `coordination/tickets-approvals` | `/work-management/tickets-approvals` | `work_requests` | `WorkRequest` |
| 18 | `work-management` | **Trao đổi nội bộ** | `coordination/internal-chat` | `/work-management/internal-chat` | `work_messages` | `WorkThread`, `WorkMessage` |
| 19 | `work-management` | **Kho tri thức & SOP** | `coordination/knowledge-sop` | `/work-management/knowledge-sop` | `work_notes` | `WorkNote` |
| 20 | `work-management` | **Trung tâm thông báo** | `coordination/notifications` | `/work-management/notifications` | `work_notifications` | `NotificationRecord` |

---

## 5. Quy tắc nghiệp vụ cốt lõi & Cơ chế an toàn

### 5.1. Khởi tạo Quản trị viên đầu tiên (First Admin Bootstrap)
- Hệ thống hỗ trợ chế độ tự khởi tạo an toàn. Khi khởi động trên cơ sở dữ liệu trống chưa có tài khoản (`needsSetup: true`), API tự động mở endpoint thiết lập tài khoản Quản trị viên đầu tiên tại giao diện `/tenant-system/auth`.
- Sau khi tài khoản Quản trị viên đầu tiên được tạo thành công, cờ `needsSetup` được khóa vĩnh viễn và hệ thống chuyển về chế độ bảo vệ xác thực nghiêm ngặt.

### 5.2. Quản lý phiên trượt & Kiểm soát truy cập (Sliding Window Session & RBAC)
- **Sliding Window:** Phiên đăng nhập có thời hạn mặc định 30 phút và tự động gia hạn khi có hoạt động mới của người dùng.
- **RBAC Guards:** Mọi route backend được bảo vệ bởi `SessionGuard` và `PermissionGuard`. Các quyền được khai báo thông qua Decorators: `@RequirePermission('module:action')`, `@AdminOnly()` hoặc `@Public()`.

### 5.3. Trung tâm thông báo thời gian thực & Cơ chế Soft-Delete
- **Real-time SSE Stream:** Cung cấp kênh sự kiện một chiều Server-Sent Events tại `/api/v1/work/notifications/stream?recipient={name}`, thông báo đẩy tức thì khi:
  - Có công việc mới được phân công cho người dùng.
  - Trạng thái công việc chuyển tiếp.
  - Có tin nhắn trao đổi nội bộ hoặc lịch họp mới.
- **Xóa mềm (Soft Delete):** Để đảm bảo tính toàn vẹn dữ liệu và khả năng truy vết, thao tác "Xóa thông báo" trên giao diện người dùng thực hiện cập nhật trường `deletedAt: DateTime`. Thông báo bị xóa sẽ lập tức biến mất khỏi danh sách và bộ đếm chưa đọc trên giao diện, nhưng dữ liệu gốc trong PostgreSQL vẫn được lưu trữ nguyên vẹn để phục vụ thanh tra.

### 5.4. Máy trạng thái công việc (Task State Machine: TR-02 → TR-09)
Mọi công việc tuân thủ quy trình chuyển trạng thái hữu hạn và được thẩm định chặt chẽ:
```text
[Draft] ──> [Open] ──> [In Progress] ──> [Review] ──> [Completed]
  │           │              │              │
  └───> [Cancelled]    [Blocked] <──────────┘
```
- Không thể chuyển sang `Completed` nếu các điều kiện tiên quyết (Pre-requisites) hoặc chỉ tiêu kiểm định (QA Gate) chưa được nghiệm thu.
- Tự động ghi nhật ký kiểm toán và bắn thông báo tới người liên quan khi trạng thái thay đổi.

### 5.5. Nhật ký kiểm toán bất biến (Append-Only Audit Checklog)
- Mọi hành vi tạo mới, cập nhật trạng thái, phân quyền hay cấu hình hệ thống đều được tự động ghi nhận vào schema `tenant_checklog`.
- Bảng nhật ký kiểm toán được bảo vệ tuyệt đối: không có logic cập nhật (`UPDATE`) hoặc xóa (`DELETE`), bảo đảm bằng chứng pháp lý và an toàn hoạt động.

### 5.6. Kiểm soát cập nhật đồng thời (Optimistic Concurrency Control)
- Mọi bản ghi dữ liệu cốt lõi đều chứa trường `version: Int`.
- Khi cập nhật, hệ thống so khớp `WHERE id = :id AND version = :expectedVersion`. Trường hợp có xung đột cập nhật đồng thời, thao tác sẽ bị từ chối với mã lỗi `409 Conflict`, ngăn chặn triệt để tình trạng ghi đè mất mát dữ liệu.

---

## 6. Hướng dẫn cài đặt & Khởi động nhanh

### 6.1. Yêu cầu môi trường
- **Node.js:** Phiên bản `>= 22.12.0` (Khuyến nghị Node.js v24.x LTS).
- **npm:** Phiên bản `>= 10.x`.
- **PostgreSQL:** Phiên bản `16+` đang hoạt động trên máy cục bộ (local).

### 6.2. Các bước cài đặt chi tiết

#### Bước 1: Cài đặt mã nguồn và thư viện
```sh
# Clone mã nguồn
git clone <repository-url>
cd OneOps

# Cài đặt toàn bộ dependencies trong monorepo
npm ci
```

#### Bước 2: Cấu hình biến môi trường
Sao chép cấu hình mẫu cho backend và frontend:

```sh
# Cấu hình Backend
cp apps/api/.env.example apps/api/.env

# Cấu hình Frontend
cp apps/web/.env.example apps/web/.env.local
```

Mở file `apps/api/.env` và cập nhật chuỗi kết nối PostgreSQL của bạn:
```env
PORT=4000
HOST=127.0.0.1
DATABASE_URL="postgresql://<db_user>:<db_password>@127.0.0.1:5432/<db_name>?schema=public"
```

> [!NOTE]
> Để chạy kiểm thử tích hợp (`npm run test:api`), bạn cần tạo sẵn cơ sở dữ liệu test riêng biệt có tên kết thúc bằng `_test` (ví dụ: `etctha_test`).

#### Bước 3: Chuẩn bị cấu trúc thư mục, sinh Design Tokens và Prisma Client
```sh
npm run prepare:dev
```
Lệnh này sẽ tự động:
1. Khôi phục toàn bộ cấu trúc thư mục feature rỗng chuẩn (`npm run structure:prepare`).
2. Biên dịch 187 tokens từ `tokens/source.json` sang CSS Variables và TypeScript types (`npm run tokens:build`).
3. Sinh Prisma Client đa schema cho `@oneops/database` (`npm run db:generate`).

#### Bước 4: Thực thi Migration cơ sở dữ liệu
```sh
npm run db:migrate
```

#### Bước 5: Khởi động môi trường phát triển (Dev Server)
```sh
npm run dev
```
Hệ thống sẽ đồng thời khởi động:
- **Web Frontend:** [http://localhost:3002](http://localhost:3002)
- **Backend API:** [http://127.0.0.1:4000/api/v1](http://127.0.0.1:4000/api/v1)

#### Bước 6: Khởi tạo tài khoản Quản trị viên đầu tiên
1. Truy cập trình duyệt vào: [http://localhost:3002/tenant-system/auth](http://localhost:3002/tenant-system/auth)
2. Nhập thông tin tài khoản quản trị (Họ tên, Email, Mật khẩu quản trị).
3. Sau khi tạo thành công, hệ thống sẽ tự động đăng nhập và đưa bạn vào Bảng điều khiển trung tâm (`/`).

---

## 7. Hướng dẫn sử dụng hệ thống (User Guide)

Hệ thống OneOps được tổ chức thành các không gian nghiệp vụ liên kết chặt chẽ. Dưới đây là hướng dẫn chi tiết quy trình sử dụng các phân hệ:

### 7.1. Bắt đầu phiên làm việc & Điều hướng chung

- **Đăng nhập & Phiên làm việc:** Truy cập `/tenant-system/auth`. Hệ thống duy trì phiên trượt (sliding session 30 phút). Thông tin người dùng hiện tại hiển thị tại góc trên bên phải thanh tiêu đề (AppShell Header).
- **Thanh điều hướng chính (Sidebar):** Cung cấp lối tắt tới 4 nhóm nghiệp vụ chính: _Điều phối công việc_, _Quản lý nhân sự_, _Quản trị hệ thống_ và _Giao diện Design System_.
- **Tạo nhanh toàn cục (Global Quick Create):** Nút dấu cộng `+` trên thanh tiêu đề cho phép tạo ngay Công việc (Task), Dự án (Project), Sự kiện lịch (Event) hoặc Đề xuất (Request) từ bất kỳ trang nào.

---

### 7.2. Phân hệ Điều phối Công việc (Work Management)

#### A. Tổng quan ngày làm việc (`/` - Workspace Today)

- **Widget Thống kê:** Hiển thị tức thời số lượng công việc cần xử lý trong ngày, công việc đang thực hiện, công việc quá hạn cần ưu tiên.
- **Lịch hôm nay:** Điểm danh các cuộc họp, mốc bàn giao sắp diễn ra.
- **Lối tắt nhanh:** Truy cập nhanh vào các dự án trọng điểm và danh sách thông báo chưa đọc.

#### B. Quản lý Công việc & Bảng Kanban (`/work-management/tasks` & `/work-management/kanban`)

- **Tạo mới công việc:** Nhập tiêu đề, mô tả, chọn người phụ trách (Assignee), dự án liên quan, mức độ ưu tiên (_Thấp, Trung bình, Cao, Khẩn cấp_) và ngày hết hạn (_Due Date_).
- **Theo dõi dạng Danh sách (`/work-management/tasks`):** Xem bảng tổng hợp, sắp xếp, lọc theo trạng thái và người phụ trách.
- **Điều phối dạng Kanban (`/work-management/kanban`):**
  - Kéo-thả thẻ công việc qua các cột trạng thái: `Draft` $\rightarrow$ `Open` $\rightarrow$ `In Progress` $\rightarrow$ `Review` $\rightarrow$ `Completed`.
  - Hệ thống tự động kiểm soát điều kiện chuyển tiếp theo quy chuẩn máy trạng thái (TR-02..TR-09).
- **Thảo luận & Bình luận công việc:** Bấm vào chi tiết công việc để mở tab bình luận, trao đổi ý kiến và cập nhật tiến độ; người được phân công sẽ nhận thông báo tức thời.

#### C. Quản lý Dự án & Cổng kiểm định chất lượng (`/work-management/projects` & `/work-management/milestones`)

- **Không gian Dự án (`/work-management/projects`):** Tạo và theo dõi các dự án của doanh nghiệp, phân nhóm dự án, giám sát tỷ lệ % hoàn thành và danh sách các công việc thuộc dự án.
- **Mốc tiến độ & Cổng QA (`/work-management/milestones`):** Thiết lập các mốc bàn giao quan trọng (Milestone). Kích hoạt cổng kiểm định chất lượng (QA Gate) bắt buộc ký duyệt trước khi nghiệm thu hoàn tất công việc.

#### D. Chấm công thời gian thực (`/work-management/timesheets`)

- Ghi nhận thời gian làm việc hàng ngày theo từng đầu việc hoặc dự án cụ thể.
- Nhập số giờ thực tế, đính kèm ghi chú kết quả công việc và gửi bảng chấm công tuần để quản lý trực tiếp phê duyệt.

#### E. Lịch làm việc & Sự kiện (`/work-management/calendar`)

- Xem lịch trình theo dạng Tháng, Tuần hoặc Ngày.
- Tạo lịch họp, lịch công tác, mốc bàn giao. Khi thêm người tham gia, hệ thống sẽ tự động gửi thông báo lịch tới tài khoản của họ.

#### F. Đề xuất & Phê duyệt (`/work-management/tickets-approvals`)

- Tạo các phiếu đề xuất nội bộ: Xin nghỉ phép, tạm ứng công tác phí, đề xuất mua sắm trang thiết bị, phê duyệt tài liệu.
- Cấp quản lý xem xét nội dung đề xuất và thực hiện thao tác **Duyệt (Approve)** hoặc **Từ chối (Reject)** kèm lý do phản hồi.

#### G. Trao đổi nội bộ & Kho tri thức SOP (`/work-management/internal-chat` & `/work-management/knowledge-sop`)

- **Trao đổi nội bộ (`/work-management/internal-chat`):** Tạo các luồng hội thoại theo chủ đề hoặc trao đổi trực tiếp giữa các thành viên dự án mà không cần dùng ứng dụng ngoài.
- **Kho tri thức & SOP (`/work-management/knowledge-sop`):** Soạn thảo và lưu trữ quy trình vận hành tiêu chuẩn (SOP), tài liệu đào tạo, hướng dẫn nghiệp vụ nội bộ của công ty.

#### H. Trung tâm thông báo thời gian thực (`/work-management/notifications`)

- **Chuông thông báo (Header Bell):** Tự động hiển thị huy hiệu (badge) số lượng thông báo chưa đọc, cập nhật tức thì qua Server-Sent Events khi có việc mới được giao, có tin nhắn hoặc lịch họp.
- **Xem & Quản lý:** Truy cập `/work-management/notifications` để xem toàn bộ danh sách, lọc thông báo chưa đọc, đánh dấu đã đọc.
- **Xóa thông báo (Soft Delete):** Bấm nút xóa để ẩn thông báo khỏi màn hình làm việc cá nhân. Dữ liệu gốc trong database vẫn được lưu vết để phục vụ kiểm toán hệ thống.

---

### 7.3. Phân hệ Quản lý Nhân sự (HR Management)

- **Sơ đồ tổ chức & Phòng ban (`/hr-management/organization`):**
  - Xem và thiết lập cây phân cấp cơ cấu tổ chức (Phòng ban cha $\rightarrow$ Phòng ban con) đảm bảo không có vòng lặp chu trình.
  - Phân bổ chức danh Trưởng phòng / Trưởng nhóm quản lý trực tiếp.
- **Chức danh & Ngạch bậc (`/hr-management/positions`):**
  - Định nghĩa danh mục vị trí công việc, chức danh nghề nghiệp, ngạch bậc chuyên môn trong doanh nghiệp.
- **Hồ sơ nhân sự (`/hr-management/employees`):**
  - Quản lý danh bạ nhân sự toàn công ty: Mã nhân viên, họ tên, email, số điện thoại, ngày vào làm.
  - Phân bổ nhân sự vào đúng phòng ban và vị trí công tác tương ứng; liên kết hồ sơ nhân sự với tài khoản đăng nhập OneOps.

---

### 7.4. Phân hệ Quản trị Hệ thống (Tenant System)

- **Quản lý tài khoản (`/tenant-system/accounts`):**
  - Cấp tài khoản mới cho nhân sự, phân bổ trạng thái (_Kích hoạt / Tạm khóa_).
- **Vai trò & Quyền hạn (`/tenant-system/roles-permissions`):**
  - Thiết lập các vai trò người dùng (ví dụ: _Super Admin, Project Manager, Team Lead, Employee, Auditor_).
  - Phân quyền chi tiết (Xem, Tạo, Sửa, Duyệt, Xóa) trên từng phân hệ nghiệp vụ cụ thể.
- **Nhật ký kiểm toán (`/tenant-system/checklog`):**
  - Tra cứu toàn bộ lịch sử thao tác quan trọng trên hệ thống (ai thực hiện, hành động gì, thời gian nào, dữ liệu trước và sau thay đổi).
  - Bảng ghi nhận bất biến (append-only), chống sửa đổi hoặc xóa nhật ký.

---

## 8. Hệ thống Design Tokens & Tùy biến Theme

Hệ thống OneOps được tổ chức thành các không gian nghiệp vụ liên kết chặt chẽ. Dưới đây là hướng dẫn chi tiết quy trình sử dụng các phân hệ:

### 7.1. Bắt đầu phiên làm việc & Điều hướng chung
- **Đăng nhập & Phiên làm việc:** Truy cập `/tenant-system/auth`. Hệ thống duy trì phiên trượt (sliding session 30 phút). Thông tin người dùng hiện tại hiển thị tại góc trên bên phải thanh tiêu đề (AppShell Header).
- **Thanh điều hướng chính (Sidebar):** Cung cấp lối tắt tới 4 nhóm nghiệp vụ chính: *Điều phối công việc*, *Quản lý nhân sự*, *Quản trị hệ thống* và *Giao diện Design System*.
- **Tạo nhanh toàn cục (Global Quick Create):** Nút dấu cộng `+` trên thanh tiêu đề cho phép tạo ngay Công việc (Task), Dự án (Project), Sự kiện lịch (Event) hoặc Đề xuất (Request) từ bất kỳ trang nào.

---

### 7.2. Phân hệ Điều phối Công việc (Work Management)

#### A. Tổng quan ngày làm việc (`/` - Workspace Today)
- **Widget Thống kê:** Hiển thị tức thời số lượng công việc cần xử lý trong ngày, công việc đang thực hiện, công việc quá hạn cần ưu tiên.
- **Lịch hôm nay:** Điểm danh các cuộc họp, mốc bàn giao sắp diễn ra.
- **Lối tắt nhanh:** Truy cập nhanh vào các dự án trọng điểm và danh sách thông báo chưa đọc.

#### B. Quản lý Công việc & Bảng Kanban (`/work-management/tasks` & `/work-management/kanban`)
- **Tạo mới công việc:** Nhập tiêu đề, mô tả, chọn người phụ trách (Assignee), dự án liên quan, mức độ ưu tiên (*Thấp, Trung bình, Cao, Khẩn cấp*) và ngày hết hạn (*Due Date*).
- **Theo dõi dạng Danh sách (`/work-management/tasks`):** Xem bảng tổng hợp, sắp xếp, lọc theo trạng thái và người phụ trách.
- **Điều phối dạng Kanban (`/work-management/kanban`):** 
  - Kéo-thả thẻ công việc qua các cột trạng thái: `Draft` $\rightarrow$ `Open` $\rightarrow$ `In Progress` $\rightarrow$ `Review` $\rightarrow$ `Completed`.
  - Hệ thống tự động kiểm soát điều kiện chuyển tiếp theo quy chuẩn máy trạng thái (TR-02..TR-09).
- **Thảo luận & Bình luận công việc:** Bấm vào chi tiết công việc để mở tab bình luận, trao đổi ý kiến và cập nhật tiến độ; người được phân công sẽ nhận thông báo tức thời.

#### C. Quản lý Dự án & Cổng kiểm định chất lượng (`/work-management/projects` & `/work-management/milestones`)
- **Không gian Dự án (`/work-management/projects`):** Tạo và theo dõi các dự án của doanh nghiệp, phân nhóm dự án, giám sát tỷ lệ % hoàn thành và danh sách các công việc thuộc dự án.
- **Mốc tiến độ & Cổng QA (`/work-management/milestones`):** Thiết lập các mốc bàn giao quan trọng (Milestone). Kích hoạt cổng kiểm định chất lượng (QA Gate) bắt buộc ký duyệt trước khi nghiệm thu hoàn tất công việc.

#### D. Chấm công thời gian thực (`/work-management/timesheets`)
- Ghi nhận thời gian làm việc hàng ngày theo từng đầu việc hoặc dự án cụ thể.
- Nhập số giờ thực tế, đính kèm ghi chú kết quả công việc và gửi bảng chấm công tuần để quản lý trực tiếp phê duyệt.

#### E. Lịch làm việc & Sự kiện (`/work-management/calendar`)
- Xem lịch trình theo dạng Tháng, Tuần hoặc Ngày.
- Tạo lịch họp, lịch công tác, mốc bàn giao. Khi thêm người tham gia, hệ thống sẽ tự động gửi thông báo lịch tới tài khoản của họ.

#### F. Đề xuất & Phê duyệt (`/work-management/tickets-approvals`)
- Tạo các phiếu đề xuất nội bộ: Xin nghỉ phép, tạm ứng công tác phí, đề xuất mua sắm trang thiết bị, phê duyệt tài liệu.
- Cấp quản lý xem xét nội dung đề xuất và thực hiện thao tác **Duyệt (Approve)** hoặc **Từ chối (Reject)** kèm lý do phản hồi.

#### G. Trao đổi nội bộ & Kho tri thức SOP (`/work-management/internal-chat` & `/work-management/knowledge-sop`)
- **Trao đổi nội bộ (`/work-management/internal-chat`):** Tạo các luồng hội thoại theo chủ đề hoặc trao đổi trực tiếp giữa các thành viên dự án mà không cần dùng ứng dụng ngoài.
- **Kho tri thức & SOP (`/work-management/knowledge-sop`):** Soạn thảo và lưu trữ quy trình vận hành tiêu chuẩn (SOP), tài liệu đào tạo, hướng dẫn nghiệp vụ nội bộ của công ty.

#### H. Trung tâm thông báo thời gian thực (`/work-management/notifications`)
- **Chuông thông báo (Header Bell):** Tự động hiển thị huy hiệu (badge) số lượng thông báo chưa đọc, cập nhật tức thì qua Server-Sent Events khi có việc mới được giao, có tin nhắn hoặc lịch họp.
- **Xem & Quản lý:** Truy cập `/work-management/notifications` để xem toàn bộ danh sách, lọc thông báo chưa đọc, đánh dấu đã đọc.
- **Xóa thông báo (Soft Delete):** Bấm nút xóa để ẩn thông báo khỏi màn hình làm việc cá nhân. Dữ liệu gốc trong database vẫn được lưu vết để phục vụ kiểm toán hệ thống.

---

### 7.3. Phân hệ Quản lý Nhân sự (HR Management)

- **Sơ đồ tổ chức & Phòng ban (`/hr-management/organization`):**
  - Xem và thiết lập cây phân cấp cơ cấu tổ chức (Phòng ban cha $\rightarrow$ Phòng ban con) đảm bảo không có vòng lặp chu trình.
  - Phân bổ chức danh Trưởng phòng / Trưởng nhóm quản lý trực tiếp.
- **Chức danh & Ngạch bậc (`/hr-management/positions`):**
  - Định nghĩa danh mục vị trí công việc, chức danh nghề nghiệp, ngạch bậc chuyên môn trong doanh nghiệp.
- **Hồ sơ nhân sự (`/hr-management/employees`):**
  - Quản lý danh bạ nhân sự toàn công ty: Mã nhân viên, họ tên, email, số điện thoại, ngày vào làm.
  - Phân bổ nhân sự vào đúng phòng ban và vị trí công tác tương ứng; liên kết hồ sơ nhân sự với tài khoản đăng nhập OneOps.

---

### 7.4. Phân hệ Quản trị Hệ thống (Tenant System)

- **Quản lý tài khoản (`/tenant-system/accounts`):**
  - Cấp tài khoản mới cho nhân sự, phân bổ trạng thái (*Kích hoạt / Tạm khóa*).
- **Vai trò & Quyền hạn (`/tenant-system/roles-permissions`):**
  - Thiết lập các vai trò người dùng (ví dụ: *Super Admin, Project Manager, Team Lead, Employee, Auditor*).
  - Phân quyền chi tiết (Xem, Tạo, Sửa, Duyệt, Xóa) trên từng phân hệ nghiệp vụ cụ thể.
- **Nhật ký kiểm toán (`/tenant-system/checklog`):**
  - Tra cứu toàn bộ lịch sử thao tác quan trọng trên hệ thống (ai thực hiện, hành động gì, thời gian nào, dữ liệu trước và sau thay đổi).
  - Bảng ghi nhận bất biến (append-only), chống sửa đổi hoặc xóa nhật ký.

---

## 8. Hệ thống Design Tokens & Tùy biến Theme

OneOps sở hữu hệ thống thiết kế đồng nhất dựa trên **187 semantic design tokens**, được định nghĩa duy nhất tại `tokens/source.json`.

- **Thư viện mẫu UI:** Xem trực tiếp tại [http://localhost:3002/design-system](http://localhost:3002/design-system)
- **Bảng tra cứu Token:** Xem trực tiếp tại [http://localhost:3002/design-tokens](http://localhost:3002/design-tokens)

```text
tokens/
├── source.json              # NGUỒN DUY NHẤT: Bảng token gốc
├── README.md                # Tài liệu phân loại token
└── generated/               # Các file sinh tự động (KHÔNG sửa trực tiếp)
    ├── tokens.css           # Biến CSS nạp tại root layout
    ├── tokens.d.ts          # Định nghĩa kiểu TypeScript
    └── tokens.json          # Mapping JSON cho công cụ build
```

### Hướng dẫn tùy biến giao diện theo thương hiệu (Theme Customization)

Để thay đổi theme hoặc tạo phong cách riêng cho khách hàng:

1. Mở file `tokens/source.json`.
2. Thay đổi giá trị màu sắc, bo góc, font chữ tại các token ngữ nghĩa:
   - Màu chủ đạo: `color.accent.primary`, `color.accent.muted`
   - Màu nền bề mặt: `color.surface.canvas`, `color.surface.panel`, `color.surface.card`
   - Màu chữ: `color.text.primary`, `color.text.muted`
   - Đường viền: `color.border.subtle`, `color.border.strong`
3. Chạy lệnh biên dịch token:
   ```sh
   npm run tokens:build
   ```
4. Xác nhận tính hợp lệ bằng cổng kiểm tra token:
   ```sh
   npm run tokens:check
   npm run test:tokens
   ```

---

## 9. Bộ lệnh phát triển & Cổng kiểm tra chất lượng

### 9.1. Các lệnh phát triển hàng ngày

| Lệnh                             | Chức năng                                                  |
| :------------------------------- | :--------------------------------------------------------- |
| `npm run dev`                    | Khởi chạy toàn bộ hệ thống (Web + API) ở chế độ phát triển |
| `npm run dev:web`                | Khởi chạy riêng ứng dụng Next.js frontend (Port 3002)      |
| `npm run dev:api`                | Khởi chạy riêng dịch vụ NestJS backend (Port 4000)         |
| `npm run prepare:dev`            | Chuẩn bị thư mục feature, build tokens và generate Prisma  |
| `npm run db:generate`            | Biên dịch lại Prisma client và build gói database          |
| `npm run db:migrate`             | Áp dụng các migration Prisma có sẵn lên database dev       |
| `npm run db:dev -- --name <ten>` | Tạo và kiểm tra migration mới trong quá trình phát triển   |
| `npm run format`                 | Tự động định dạng code bằng Prettier cho toàn bộ repo      |

### 9.2. 7 Cổng kiểm tra chất lượng trước khi bàn giao (Pre-flight Quality Gates)

Trước khi commit mã nguồn hoặc tạo Pull Request, bắt buộc phải vượt qua toàn bộ các cổng kiểm định sau:

```sh
# 1. Kiểm tra ranh giới kiến trúc & cấu trúc 4 phân hệ
npm run architecture:check

# 2. Quét mã nguồn mồ côi (không được import từ entrypoint)
npm run unused:check

# 3. Thẩm định tính nguyên vẹn của 187 Design Tokens
npm run tokens:check

# 4. Kiểm tra kiểu dữ liệu toàn bộ monorepo (0 errors)
npm run typecheck

# 5. Kiểm tra quy chuẩn mã nguồn bằng ESLint
npm run lint

# 6. Kiểm tra chuẩn định dạng Prettier
npm run format:check

# 7. Biên dịch production build cho cả Web và API
npm run build
```

### 9.3. Bộ lệnh kiểm thử nâng cao

- **API Integration Tests:** `npm run test:api` (Kiểm thử toàn bộ 22 luồng tích hợp database và nghiệp vụ).
- **Design Tokens Tests:** `npm run test:tokens` (Kiểm tra token contrast, mapping và cấu trúc).
- **End-to-End Tests:** `npm run test:e2e` (Kiểm thử luồng người dùng thực tế bằng Playwright).

---

## 10. Quy tắc phát triển & Hướng dẫn phối hợp AI

> Chi tiết quy định xem tại: [AGENTS.md](AGENTS.md).

Khi làm việc độc lập hoặc hướng dẫn các trợ lý AI hỗ trợ phát triển:

1. **Phạm vi hẹp & tập trung:** Chỉ sửa đổi mã nguồn bên trong đường dẫn chức năng được giao (`<feature-path>`). Tuyệt đối không format hoặc sửa đổi mã nguồn ngoài phạm vi.
2. **Component tự sở hữu:** Thành phần UI phải nằm trong thư mục `components/primitives/` của chính chức năng đó. Có thể tham khảo code mẫu từ `/design-system`, sao chép vào nội bộ feature và đổi đường dẫn import; không phụ thuộc vào component chung.
3. **Tuân thủ Design Tokens:** Luôn sử dụng Tailwind utilities ngữ nghĩa (`bg-surface`, `text-foreground`, `border-border`, `rounded-control`). Không hardcode mã màu hex/RGB, không lạm dụng `!important` hay override CSS toàn cục.
4. **Không hard-delete dữ liệu:** Mọi dữ liệu liên quan đến lịch sử kiểm toán, thông báo hoặc nghiệp vụ người dùng phải áp dụng cơ chế đánh dấu xóa mềm (`deletedAt`) hoặc append-only log.
5. **Đảm bảo tính trung thực:** Không nuốt lỗi (silent fail), không trả dữ liệu mẫu/mock data giả mạo trên môi trường production, và giữ nguyên tính xác thực phân quyền của hệ thống.

---

## Bản quyền & Đóng góp

Hệ thống được phát triển bởi đội ngũ kỹ thuật **OneOps**. Mọi quyền được bảo lưu. Để biết thêm thông tin chi tiết về tài liệu kỹ thuật, vui lòng tham khảo thư mục [docs/](docs/ARCHITECTURE.md).
