# Kiến trúc OneOps theo file cấu trúc

Dự án dùng **Next.js 16**, **NestJS 11**, **PostgreSQL 16+** và **Prisma 7.10.1**, tổ chức theo bốn miền nghiệp vụ chính: `tenant-system`, `work-management`, `hr-management`, `crm`. File `Cau Truc Thu Muc (1).md` tại root là chuẩn cấu trúc thư mục. Xem `FOLDER-MAPPING.md` để biết vị trí từng chức năng và phần còn trống.

```text
packages/database/
  prisma/schema/base.prisma      # DataSource PostgreSQL, generator và danh sách multi-schema namespaces
  prisma/schema/features         # Symlink/Junction tới model gốc dưới API features
  prisma/migrations/             # Lịch sử các bản migration đã áp dụng
  generated/                     # Prisma Client sinh tự động, không sửa trực tiếp
  index.ts                       # Public exports: PrismaClient, Prisma namespace và model types
apps/api/src/
  core/                          # Hạ tầng backend: database lifecycle, auth actor context, filters, pipes, notification events
  features/                      # 4 module chính và 39 chức năng con
    tenant-system/               # Xác thực phiên, tài khoản, vai trò/phân quyền, nhật ký kiểm toán bất biến
    hr-management/               # Sơ đồ tổ chức phòng ban, chức danh ngạch bậc, hồ sơ nhân sự
    work-management/             # Nhiệm vụ, quy trình việc, bình luận, dự án, mốc & QA, timesheet, thông báo SSE
    crm/                         # Khung module thương mại & quan hệ khách hàng (sẵn sàng mở rộng)
apps/web/src/
  app/                           # Next.js App Router (route mỏng trực tiếp dưới 4 miền; layout gốc giữ shell)
  core/                          # Shell, layout, context providers, Feature Registry, Design System
  icons/                         # Bộ biểu tượng SVG tự sở hữu
  features/                      # Đối xứng 39 chức năng con với BE, tự sở hữu components, hooks, api, types
```

---

## 1. Nguyên tắc sở hữu & Ranh giới phân hệ

1. **Độc lập tuyệt đối giữa các Leaf Feature:**
   - Từng feature tự sở hữu `components/`, `hooks/`, `api/`, `types.ts`, `constants.ts` ở FE và `<name>.controller.ts`, `<name>.service.ts`, `<name>.repository.ts`, `dto/`, `prisma/` ở BE.
   - Không có generic CRUD factory, base business repository hay package contracts dùng chung.
   - Các UI primitives dù tương tự giữa các feature vẫn được sở hữu độc lập trong thư mục `components/primitives/` của chính feature đó.

2. **Giao tiếp Frontend có chủ đích:**
   - Frontend feature tuyệt đối không import source hoặc primitives nội bộ của feature khác.
   - Hai tích hợp công khai được phép: `Tasks` nhúng `KanbanBoard` (`work/kanban`) và `TaskComments` (`work/task-comments`) qua public `index.ts`, truyền dữ liệu/callback.
   - Shell và routing chỉ tích hợp thông qua public feature exports.

3. **Giao tiếp Backend & Tầng điều phối (Composition):**
   - Leaf backend feature chỉ truy cập delegate Prisma và model do chính mình sở hữu.
   - Tích hợp liên phân hệ nằm ở các Composition Service/Module thuộc tầng domain (ví dụ: `work-management.composition.ts`, `accounts-credentials.ts`, `permission-audit.ts`), trao đổi thông qua public interfaces hoặc service ports được định nghĩa rõ ràng.
   - Tầng core chỉ chứa hạ tầng, không chứa nghiệp vụ. Root `AppModule` ghép `CoreModule` và đúng 4 main modules (`TenantSystemModule`, `HrManagementModule`, `WorkManagementModule`, `CrmModule`).

4. **Kiểm soát dữ liệu & Kiểu:**
   - DTO validation ở BE sử dụng Zod schema nghiêm ngặt; transport types ở FE được định nghĩa riêng trong `types.ts`.
   - Frontend không import NestJS, Prisma, `@oneops/database` hoặc source code backend.
   - Backend chưa triển khai và frontend chưa triển khai được giữ trống hoàn toàn; không tạo stub hay mock endpoint giả mạo.

---

## 2. Cơ sở dữ liệu & Vận hành

1. **Multi-Schema PostgreSQL Federation:**
   - Mỗi chức năng sở hữu database schema riêng (ví dụ: `tenant_auth`, `tenant_accounts`, `tenant_permissions`, `tenant_checklog`, `hr_departments`, `hr_positions`, `hr_employees`, `work_tasks`, `work_task_workflow`, `work_task_comments`, `work_milestones_qa`, `work_timesheets`, `work_calendar`, `work_requests`, `work_messages`, `work_notes`, `work_reports`, `work_notifications`, `work_dashboard`, `work_projects`).
   - Prisma đọc trực tiếp các model tại `apps/api/src/features/*/*/*/prisma/*.prisma` qua directory junction `packages/database/prisma/schema/features`.
   - Gói `@oneops/database` quản lý cấu hình, client và lịch sử migration.

2. **Tính toàn vẹn & Cơ chế an toàn:**
   - **Optimistic Concurrency Control:** Các model nghiệp vụ đều duy trì trường `version: Int` để ngăn chặn race conditions và xung đột ghi đè.
   - **Xóa mềm (Soft Delete) & Append-Only Log:** Dữ liệu thông báo (`work_notifications`) áp dụng xóa mềm `deletedAt` để bảo toàn vết; dữ liệu nhật ký kiểm toán (`tenant_checklog`) là bất biến (không có lệnh UPDATE/DELETE).
   - **Chu kỳ kiểm thử:** API và E2E tests chỉ chạy trên database riêng có tên kết thúc bằng `_test` (ví dụ: `etctha_test`). Không áp dụng migration phá hủy hoặc reset dữ liệu để sửa drift.

---

## 3. Hệ thống kiểm định & Trạng thái hiện tại

- **Boundary Check (`npm run architecture:check`):**
  - Xác minh 4 nhóm chính, 39 thư mục đối xứng FE/BE.
  - Kiểm tra tính hợp lệ của **20 implementation dữ liệu** (9 record APIs, 11 resource APIs) và **30 models** thuộc quyền sở hữu của các chức năng.
  - Chặn triệt để các vi phạm ranh giới, import nội bộ chéo hoặc cấu trúc ngoài quy chuẩn.
- **Unused Check (`npm run unused:check`):**
  - Quét toàn bộ đồ thị import từ các entrypoint ứng dụng. Xác nhận **540 source files** đều đang được sử dụng và liên kết hợp lệ.
- **Tokens Check (`npm run tokens:check`):**
  - Xác minh **187 semantic design tokens** được ánh xạ nhất quán qua 10 tệp dẫn xuất.
- **Các phân hệ đã triển khai:**
  - `tenant-system`: Xác thực phiên trượt (`tenant-auth`), tài khoản (`accounts`), vai trò & phân quyền (`roles-permissions`), nhật ký kiểm toán (`checklog`).
  - `hr-management`: Sơ đồ phòng ban phân cấp (`departments-teams`), chức danh ngạch bậc (`positions-grades`), hồ sơ nhân sự (`employee-directory`).
  - `work-management`: Tổng quan hôm nay (`workspace-today`), công việc (`tasks`), quy trình việc máy trạng thái (`task-workflow`), bình luận (`task-comments`), Kanban (`kanban`), dự án (`project-spaces`), mốc tiến độ & QA Gate (`milestones-qa`), chấm công (`timesheets`), lịch (`calendar`), đề xuất (`tickets-approvals`), trao đổi (`internal-chat`), tri thức SOP (`knowledge-sop`), báo cáo (`reports`), thông báo thời gian thực SSE (`notifications`).
- **Các phần tiếp tục để trống:**
  - `company-profile`, `work-policies`, `automation-hub` (`external-integrations`, `workflow-rules`, `ai-copilot`).
  - Phân hệ chấm công/nghỉ phép mở rộng (`attendance`, `leaves`) và định biên (`resource-capacity`).
  - Phân hệ `crm` (tiền bán hàng, hợp đồng, chăm sóc khách hàng).
