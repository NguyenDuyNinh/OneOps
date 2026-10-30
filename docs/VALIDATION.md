# Xác minh sau phân bổ theo file cấu trúc — 29/10/2026

- 4 main groups và 39 thư mục chức năng con đối xứng FE/BE, theo `Cau Truc Thu Muc (1).md`.
- 8 implementation dữ liệu hiện hữu được di chuyển; không tạo API/trang nghiệp vụ mới cho phần còn trống.
- Prisma validate/generate đọc model gốc qua database package; lần chuyển thư mục trước đó có migrate diff trả **No difference detected**. Cập nhật 30/10 đã gỡ WorkTeam khỏi source/client, không áp dụng migration DROP hoặc xóa bảng cũ.
- Boundary check và unused check đạt: 269 file nguồn reachable; entrypoint database package được đưa vào import graph. Folder trống được kiểm tra riêng bằng feature-structure.json.
- 8/8 API integration đạt sau khi đổi tên class, chuyển DTO/client/database config: CRUD isolation, version conflict, strict validation, checklist/comments, pagination, concurrency, workspace metrics qua nhiều trang và restart persistence.
- Build đã biên dịch được routing nhóm admin, 4 main Nest modules và các feature đã có. URL cũ chuyển tiếp sang route mới; API URL giữ tương thích.

Browser suites kiểm tra catalog/token studio, theme/density, mobile, asset SVG qua Next bundle, điều hướng và route chưa triển khai 404; Kanban tại đường dẫn mới, checklist/comment đã tách, sửa/xuất/xóa và đổi phân hệ trong dialog tạo mới. Kết quả: **7/7 browser tests đạt**. Build, typecheck toàn workspace, lint, format và **5/5 test token** đều đạt.

Chi tiết vị trí mới và phần thiếu: `FOLDER-MAPPING.md`. Những phần authentication, RBAC, event bus, realtime, attendance/leaves và CRM vẫn chưa được triển khai.

## Xóa code company-profile và bỏ audit-backups — 30/10/2026

Còn 39 chức năng cấu trúc và 8 implementation dữ liệu. company-profile và departments-teams không có file implementation ở cả FE/BE; departments-teams được xác định là quản lý phòng ban. audit-backups đã bị gỡ và không được structure:prepare tạo lại. Menu, form, API /teams, route /tenant-system/company-profile và redirect /teams đã gỡ. Test API xác nhận /teams trả 404; browser test kiểm tra cả /teams và /tenant-system/company-profile trả 404. Không sửa lịch sử migration hoặc xóa dữ liệu PostgreSQL cũ.
