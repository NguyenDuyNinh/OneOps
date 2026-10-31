# Specification Work extensions — APPROVED

**Trạng thái:** APPROVED ngày 30/10/2026. Người dùng chấp nhận toàn bộ phương án đánh dấu “(đề xuất)” làm quyết định triển khai. Thay đổi sau phê duyệt phải cập nhật version, acceptance mapping và test.

## 1. Mục tiêu và phạm vi

Hai nhánh mở rộng của `work-management/projects`, bổ sung cho `project-spaces` đã có:

| Nhánh | Sở hữu | Phụ thuộc |
| --- | --- | --- |
| `timesheets` | Bản ghi thời gian làm việc, kỳ timesheet, trạng thái duyệt, điều chỉnh | Task, Project/Sprint (scalar ID), Employee (scalar ID) |
| `milestones-qa` | Milestone dự án, checklist/Test case, kết quả kiểm tra gắn với Story/Task | Project/Sprint, Task (scalar ID) |

Không nhánh nào sở hữu lại dữ liệu của `project-spaces` hay `tasks`. Mọi liên kết dùng scalar ID; không thêm foreign key xuyên namespace.

## 2. Timesheets

### 2.1 Mục tiêu

Ghi nhận thời gian thực tế theo Task/Project để tính năng suất, đối chiếu ước lượng (Story Points hoặc giờ) và cung cấp số liệu tham chiếu cho báo cáo và công nợ ở CRM.

### 2.2 Thực thể đề xuất

- **TimesheetPeriod:** kỳ tuần (hoặc tháng), trạng thái `OPEN → SUBMITTED → APPROVED | REJECTED`.
- **TimeEntry:** `employeeId`, `projectId`, `taskId?`, `workDate`, `minutes`, `note`, `billable`, `status`.
- **TimeEntryAdjustment:** điều chỉnh sau khi kỳ đã duyệt; giữ bản ghi gốc, không sửa/xóa.

Quy tắc:

- Thời gian lưu bằng phút (số nguyên), không dùng giờ thập phân.
- Một `TimeEntry` thuộc đúng một kỳ; kỳ đã `APPROVED` bị khóa với mọi sửa trực tiếp.
- Tổng thời gian một nhân viên một ngày không vượt ngưỡng cấu hình; vượt ngưỡng cần lý do và Manager duyệt.
- Không tự sinh time entry từ dữ liệu điểm danh; attendance và timesheet là hai nguồn độc lập và không được trộn.
- `taskId` nếu có phải thuộc project của entry và nhân viên phải là thành viên project hoặc người phụ trách/kiểm tra.
- Timesheet không quyết định lương; không chứa dữ liệu lương hay đơn giá tiền tệ (đơn giá thuộc CRM nếu có).
- `billable` chỉ là cờ tham chiếu; CRM đọc qua public contract, không đọc bảng trực tiếp.
- Submit/approve dùng `Idempotency-Key`; gửi lặp không tạo kỳ hoặc entry thứ hai.
- Không tự duyệt timesheet của chính mình.

### 2.3 UI/UX

- Lưới nhập theo tuần: dòng là Task/Project, cột là ngày, ô nhập phút; có tổng ngày và tổng tuần tính client nhưng server là nguồn đúng.
- Hiển thị rõ kỳ đang mở, hạn nộp, trạng thái duyệt và người duyệt.
- Cảnh báo khi vượt ngưỡng ngày/tuần, khi task không thuộc project, hoặc khi task đã hoàn thành/hủy.
- Mobile: nhập theo ngày, không bắt buộc dùng lưới nhiều cột.
- Trạng thái bắt buộc theo `docs/UX-DESIGN-CONTRACT.md`: loading, empty, filtered empty, error, forbidden, conflict (kỳ đã duyệt), success.

### 2.4 Acceptance tối thiểu

1. Kỳ `APPROVED` chặn sửa entry trực tiếp; điều chỉnh tạo bản ghi mới và giữ lịch sử.
2. Tổng giờ trong kỳ khớp tổng entry hợp lệ sau điều chỉnh.
3. Không tạo entry cho task của project khác hoặc nhân viên ngoài project.
4. Submit lặp cùng `Idempotency-Key` không tạo kỳ/entry thứ hai.
5. Employee chỉ thấy timesheet của mình; Manager thấy trong phạm vi quản lý.
6. Không có API nào trả dữ liệu timesheet của người ngoài scope qua đoán ID.

## 3. Milestones và QA

### 3.1 Mục tiêu

Bổ sung mốc tiến độ theo hợp đồng/giai đoạn và vòng kiểm tra chất lượng có bằng chứng, gắn với Story/Task trong dự án.

### 3.2 Milestone

- **Milestone:** project, tên, mô tả, ngày mục tiêu, trạng thái `PLANNED → IN_PROGRESS → COMPLETED | MISSED | CANCELLED`.
- Milestone gắn với nhiều Backlog item/Task qua bảng liên kết nội bộ (scalar ID).
- Tiến độ milestone = số item `COMPLETED` / tổng item liên kết; không nhập tay phần trăm.
- `MISSED` là trạng thái tính theo ngày khi quá hạn và chưa hoàn thành; không ghi đè trạng thái công việc của Task.
- Milestone không thay thế Sprint; một Sprint có thể phục vụ nhiều milestone và ngược lại.

### 3.3 QA / kiểm tra chất lượng

- **AcceptanceItem (Test case):** thuộc một Task hoặc Story; gồm tiêu chí, bước kiểm tra tùy chọn, kết quả mong đợi.
- **AcceptanceResult:** `PASS | FAIL | BLOCKED`, người kiểm tra, thời điểm, ghi chú, bằng chứng (file/link).
- Người kiểm tra là Reviewer của Task hoặc người được Manager chỉ định; không tạo role thứ ba.
- Task chỉ được `COMPLETED` khi toàn bộ AcceptanceItem bắt buộc có kết quả `PASS`, hoặc Manager override có lý do và audit.
- Kết quả kiểm tra là bất biến sau khi ghi; sửa sai bằng kết quả mới, giữ lịch sử.
- QA không sở hữu trạng thái Task; nó cung cấp điều kiện cho workflow của Tasks.
- Không có thư viện test case dùng chung xuyên dự án trong phạm vi này.

### 3.4 UI/UX

- Milestone hiển thị trên tab riêng của Project: danh sách + timeline; quá hạn có nhãn text và màu.
- Checklist QA nằm trong tab Kiểm tra của Task detail; mỗi mục có trạng thái text, người kiểm tra, bằng chứng.
- Không dùng chỉ màu để phân biệt PASS/FAIL/BLOCKED; luôn có nhãn.
- Bảng kết quả kiểm tra hỗ trợ đọc bằng screen reader và không phụ thuộc tooltip.

### 3.5 Acceptance tối thiểu

1. Không thể chuyển Task sang `COMPLETED` khi còn AcceptanceItem bắt buộc chưa `PASS`, trừ override có audit.
2. Tiến độ milestone tính tự động và khớp số item hoàn thành.
3. Sửa kết quả kiểm tra tạo bản ghi mới, không ghi đè lịch sử.
4. Người không phải Reviewer/được chỉ định không ghi được kết quả kiểm tra.
5. Milestone quá hạn chuyển `MISSED` mà không đổi trạng thái Task.

## 4. Quyết định mở cần phê duyệt

1. **Kỳ timesheet:** theo tuần (đề xuất) hay theo tháng? Ngày bắt đầu tuần?
2. **Bắt buộc duyệt:** mọi timesheet cần Manager duyệt, hay chỉ khi vượt ngưỡng/khác thường?
3. **Quan hệ với điểm danh:** có đối chiếu chênh lệch giờ timesheet và giờ điểm danh không, hay độc lập hoàn toàn?
4. **Đơn vị nhập:** phút (đề xuất) hay giờ? Có làm tròn theo bước 15/30 phút?
5. **Billable và đơn giá:** timesheet chỉ giữ cờ billable (đề xuất) hay cần lưu đơn giá để CRM dùng?
6. **Milestone:** gắn với hợp đồng/giai đoạn thanh toán (đề xuất) hay chỉ là mốc nội bộ?
7. **QA:** dùng checklist nhẹ gắn Task (đề xuất) hay cần module test case đầy đủ với thư viện dùng chung?
8. **Override hoàn thành:** Manager được override khi QA chưa PASS không, và cần ai duyệt?

Đã phê duyệt ngày 30/10/2026: kỳ timesheet theo tuần (thứ Hai); duyệt chỉ khi vượt ngưỡng/khác thường; độc lập với điểm danh; nhập theo phút, làm tròn 15 phút; chỉ giữ cờ billable; milestone gắn hợp đồng/giai đoạn; QA là checklist nhẹ gắn Task; Manager được override khi QA chưa PASS và phải ghi audit. Hai nhánh được mở khóa.
