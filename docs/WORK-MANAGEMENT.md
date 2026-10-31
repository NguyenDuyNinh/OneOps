# Chuyển sang quản lý công việc — 29/10/2026

## Tham khảo

- [Video Base XSpace](https://www.youtube.com/watch?v=Y90cri-fntU): “Giải pháp Base XSpace: Đánh thức trạng thái làm việc sâu cho lãnh đạo&nhân viên”. Đã đọc tiêu đề/mô tả trong YouTube; video không có transcript xuất được. Không tuyên bố khôi phục từng màn hình/tính năng của video.
- [Base XSpace](https://base.vn/app/xspace): không gian số, dashboard, giao tiếp và lịch.
- [Base WeWork](https://base.vn/app/wework): công việc/dự án, phân công và các góc nhìn tiến độ.
- [XCalendar My time](https://help.base.vn/support/solutions/articles/63000284083--xspace-xcalendar-b%E1%BA%ADt-ch%E1%BA%BF-%C4%91%E1%BB%99-my-time-%C4%91%E1%BB%83-theo-d%C3%B5i-l%E1%BB%8Bch-bi%E1%BB%83u-c%C3%B4ng-vi%E1%BB%87c): tham khảo lịch và thời gian tập trung.

Phạm vi lựa chọn là nền tảng công việc nội bộ gồm chín domain, có lưu dữ liệu thật và giữ hệ UI/UX cũ. Đây không phải bản sao đầy đủ Base.vn.

## Giữ và thay

Giữ Tailwind/Radix, palette, typography, Inter, dark mode/density, component interactions, header/sidebar, catalog và 187 tokens. Thêm CSS Module cho UI nghiệp vụ mới, không thêm CSS nghiệp vụ mới vào globals. Các class CSS cũ không được source tham chiếu đã được loại bỏ có kiểm tra hồi quy bằng trình duyệt.

Bỏ source FE/BE/contract của personal-cases, organization-cases, linked-documents, forwarded-cases, property-processing, documents, books, receipts, reconciliation, archives; dashboard/reports cũ được thay bằng domain mới. Bỏ workflow case-transfers, redirect cũ và bộ kiểm thử phụ thuộc nghiệp vụ cũ. Ví dụ design-system được thay nội dung công việc; giữ component implementation.

Đổi workspace/package scope sang `@oneops/*` và nhận diện giao diện thành OneOps. Các chuỗi kết nối PostgreSQL kỹ thuật giữ nguyên để không phá môi trường đang có. Các bảng cũ không bị xóa; schema mới dùng prefix work_.

## Phạm vi thực hiện

CRUD/tìm kiếm/lọc/CSV từng module; Kanban công việc, checklist, bình luận; lịch tháng và lịch họp/tập trung; kênh trao đổi dạng chủ đề; dự án, đội nhóm, đề xuất, ghi chú, báo cáo; dashboard tổng hợp thật; tiện ích cá nhân lưu API.

Chưa có xác thực/SSO/RBAC, liên kết thành viên với tài khoản thật, chat/socket realtime, notification service, upload file, Gantt/dependency scheduling, đồng bộ lịch ngoài hoặc kết nối Base. “Người duyệt” và trạng thái đề xuất hiện là dữ liệu làm việc, không phải quy trình phân quyền phê duyệt đã được bảo vệ.

## Dữ liệu

Migration mới chỉ tạo 9 namespace work_* và bảng/index. Không sửa/xóa dữ liệu cũ, không tự biến hồ sơ cũ thành công việc và không tự seed số liệu giả vào database ứng dụng. API/E2E chỉ dọn các bảng mới trong database kết thúc _test.

## Cập nhật 31/10/2026 — hoàn thiện nhánh Work

Phần nêu “chưa có” ở trên chỉ đúng cho bản 29/10. Hiện trạng nhánh Work:

- Trạng thái công việc chỉ đổi qua `task-workflow` (TR-02…TR-09); tạo mới và PATCH không nhận `status`. Mỗi lần đổi lưu lịch sử, lý do và một bình luận SYSTEM.
- Người thực hiện gửi đề xuất HOLD/CANCEL/DEADLINE; Quản lý khác người đề xuất quyết định, tự quyết bị từ chối.
- Bình luận tách thành API riêng `/task-comments` (COMMENT/SYSTEM, @nhắc tên, đính kèm liên kết); không còn lưu trong `fields` của công việc.
- `milestones-qa` quản lý mốc theo dự án/hợp đồng, liên kết công việc và tiêu chí chấp nhận; tiêu chí bắt buộc chặn TR-04 và Quản lý chỉ override khi ghi lý do.
- `timesheets` ghi tuần bắt đầu thứ Hai, bước 15 phút, ngưỡng ngày 480 phút và tuần 2400 phút; gửi dưới ngưỡng tự duyệt, Quản lý không tự duyệt tuần của mình, điều chỉnh chỉ sau khi duyệt.
- Đã có xác thực phiên, tài khoản, phân quyền theo hành động và thông báo trong ứng dụng (SSE). Vẫn chưa có upload file, chat realtime, outbox/retry cho thông báo, đồng bộ lịch ngoài và kết nối Base.
