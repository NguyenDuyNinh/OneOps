# Dọn dẹp sau chuyển đổi OneOps

Đã xóa source của các module thi hành án khỏi frontend, backend và contracts; thay dashboard/reports và workflow cũ. Danh sách đầy đủ ở WORK-MANAGEMENT.md. Không giữ code legacy bằng alias hay folder archive trong runtime.

Đã thay bộ test nghiệp vụ cũ bằng CRUD/isolation/concurrency/summary tests và browser tests của công việc/lịch. Các ví dụ UI được chuyển nội dung sang công việc. Đã bỏ logo eTCTHA, ba nav icon không còn dùng và file download token mang tên nhận diện cũ. Các bộ token vẫn giữ giá trị thiết kế.

Globals CSS đã bỏ 118 rule không còn class được source tham chiếu; CSS nghiệp vụ mới nằm trong từng module. Unused check phát hiện primitive foundations không được dashboard mới dùng và file đó đã được xóa.

Giữ migration history, dữ liệu PostgreSQL cũ, thư viện UI/token studio, dependencies/build outputs cần vận hành và bản phân phối token download. Các implementation UI tương tự thuộc domain khác nhau vẫn độc lập theo yêu cầu, không hợp nhất thành shared.

Tài liệu khảo sát/audit cấu trúc cũ và ảnh home cũ đã bỏ; báo cáo chuyển đổi và kiến trúc hiện tại thay thế chúng. Không xem node_modules, generated Prisma, dist hoặc dữ liệu .local/postgres là file nghiệp vụ thừa để xóa trong khi đang vận hành.

## Phân bổ theo file cấu trúc

Đã bỏ cây source cũ modules/application/tooling/platform và package contracts sau khi chuyển implementation sang features/core và DTO/types của đúng chức năng. Prisma config/history/client chuyển vào packages/database; model vẫn có một nguồn ở feature/prisma. Không tạo bản sao schema. Các thư mục trống được tái lập bằng structure:prepare, không thêm file placeholder. Xem FOLDER-MAPPING.md.

## 30/10/2026 — bỏ audit-backups, làm trống company-profile

Đã bỏ cả hai thư mục audit-backups FE/BE và khai báo dựng lại chúng. Xóa toàn bộ implementation company-profile, gỡ API /teams, trang /tenant-system/company-profile, redirect /teams, menu và form. Giữ company-profile dưới dạng các thư mục cấu trúc trống. departments-teams là chức năng quản lý phòng ban và chưa có implementation; không nhận code cũ. Chỉ gỡ WorkTeam khỏi Prisma nguồn/client; không DROP bảng hoặc xóa dữ liệu PostgreSQL và không sửa migration history.
