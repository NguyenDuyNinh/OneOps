# Kiến trúc OneOps theo file cấu trúc

Dự án dùng Next.js 16, NestJS, PostgreSQL và Prisma, tổ chức theo bốn miền: tenant-system, work-management, hr-management, crm. File `Cau Truc Thu Muc (1).md` tại root là chuẩn cấu trúc. Xem FOLDER-MAPPING.md để biết vị trí từng chức năng cũ và phần còn trống.

```text
packages/database/
  prisma/schema/base.prisma      # chỉ datasource/generator
  prisma/schema/features         # symlink tới model gốc dưới API features
  prisma/migrations/
  prisma/seed/                   # trống, chưa có seed
  generated/                     # tự sinh, không sửa
  index.ts                       # PrismaClient, Prisma, model types
apps/api/src/
  core/                          # database lifecycle, filter, pipe; phần chưa có để trống
  shared/constants/, helpers/    # trống
  features/
    tenant-system/
    work-management/
    hr-management/
    crm/
apps/web/src/
  app/                           # route trực tiếp dưới 4 miền; layout gốc giữ shell
  app/(auth)/, (error-pages)/     # trống
  core/                          # layout/context/config/UI tools/tokens
  icons/
  features/                      # đối xứng 39 chức năng con với BE
```

## Sở hữu và tích hợp

Từng feature sở hữu components/hooks/api/types/constants riêng ở FE và controller/service/repository/DTO/model riêng ở BE nếu đã được viết. Không có generic CRUD factory hoặc base business repository. Các primitive tương tự trong các feature vẫn được sở hữu độc lập.

Frontend feature không import business implementation từ core hoặc nội bộ feature khác. Hai tích hợp công khai có chủ đích: Tasks dùng KanbanBoard và TaskComments qua public index, truyền dữ liệu/callback; hai view không import repository, hook, API hay component nội bộ của Tasks. Core/route chỉ ghép public feature exports.

Backend feature chỉ truy cập delegate Prisma của chính mình. Các main module và `work-management.insights.module.ts` là composition root, chỉ sử dụng public service/module exports. Core hạ tầng không import nghiệp vụ. Root AppModule ghép CoreModule và đúng 4 main module, kể cả Tenant/HR/CRM hiện chưa có controller con.

DTO validation BE và transport types/schema FE nằm trong feature của từng bên. Frontend không import NestJS, Prisma, database package hoặc source BE. Backend chưa có và frontend chưa có không được lấp bằng stub/endpoint giả.

## Database và vận hành

Mỗi implementation dữ liệu giữ namespace work_* đã có, tên model và API giữ tương thích. Prisma đọc trực tiếp các model tại features/*/*/*/prisma thông qua link cấu hình, không nhân đôi schema. Database package chỉ phát client/types; connection lifecycle và PostgreSQL adapter ở API core/database.

`npm run db:generate` generate và build package database trước khi API được biên dịch. `db:migrate`/`db:dev` chạy tại package database; migration history được di chuyển nguyên vẹn. Chuyển thư mục không tạo SQL mới hoặc xóa dữ liệu. localStorage vẫn chỉ dùng cho UI preferences.

Optimistic version, strict Zod, chuẩn hóa code, transaction/list pagination và kiểm tra ngày/giờ được giữ. API/E2E chỉ dùng database có tên kết thúc _test. Các điểm tích hợp backend vẫn là hợp đồng giữa chức năng, không thể đảm bảo tuyệt đối không có merge conflict tại cấu hình/lockfile/migration.

## Kiểm tra

Boundary check xác minh 4 nhóm, 39 thư mục đối xứng, artifact/model/delegate cho 9 implementation hiện hữu; chặn import nội bộ trái phép và tái tạo cấu trúc cũ. Unused check đọc import graph của source và entrypoint database package. Build chạy cả hai kiểm tra. Empty folders tái lập qua structure:prepare, không cần file .gitkeep/source giả.

Giữ UI/UX, catalog/design tokens. Chưa bổ sung authentication, RBAC, event bus, realtime, attendance/leaves, CRM hoặc các nghiệp vụ được mô tả trong file mẫu nhưng chưa có trong mã nguồn.

Company-profile hiện để trống; departments-teams thuộc HR có trách nhiệm quản lý phòng ban, chưa có code. Audit-backups đã bỏ; checklog là nhánh nhật ký được giữ. Bảng work_teams cũ được giữ trong database/migration history nhưng không còn model hoặc endpoint trong runtime.
