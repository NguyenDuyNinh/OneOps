# Specification HR extensions — APPROVED

**Trạng thái:** APPROVED ngày 30/10/2026. Người dùng chấp nhận toàn bộ phương án đánh dấu “(đề xuất)” làm quyết định triển khai. Thay đổi sau phê duyệt phải cập nhật version, acceptance mapping và test.

## 1. Mục tiêu và phạm vi

Bốn nhánh bổ sung, không thay thế các nhánh HR đã có (`daily-checkin`, `workforce-board`, `checkin-explanations`, `attendance-reports`, `leave-requests`, `leave-approvals`, `employee-directory`, `departments-teams`).

| Nhánh | Sở hữu | Không sở hữu |
| --- | --- | --- |
| `hr-management/attendance/shifts-schedules` | Mẫu ca, gán ca theo tuần, lịch làm việc cá nhân | Giờ làm chuẩn, ngày lễ, hạn mức phép (`work-policies`) |
| `hr-management/employees/resource-capacity` | Công suất tính theo kỳ, phân bổ dự án, mức quá tải | Task/Project, timesheet, leave |
| `hr-management/organization/positions-grades` | Danh mục chức danh, cấp bậc, ánh xạ nhân viên | Quyền truy cập (không bao giờ dùng chức danh để cấp quyền) |
| `tenant-system/organization/company-profile` | Hồ sơ pháp lý công ty, logo, địa chỉ, thông tin xuất chứng từ | Cấu hình vận hành (`work-policies`) |

Nguyên tắc chung:

- Chỉ hai role `EMPLOYEE`/`MANAGER`; chức danh và cấp bậc là **thuộc tính**, không phải điều kiện phân quyền (BR-PER-02).
- Mọi liên kết sang Employee/Department/Team/Project dùng scalar ID; không foreign key xuyên namespace.
- Không hard-delete dữ liệu đã phát sinh; ngừng hoạt động bằng trạng thái và lưu lịch sử.
- Mọi thay đổi ảnh hưởng tính công, tính công suất hoặc cấp bậc phải ghi audit.

## 2. Shifts và schedules

### 2.1 Phạm vi

- **ShiftTemplate:** tên, giờ bắt đầu/kết thúc, nghỉ giữa ca, số giờ công tính, cờ ca đêm, ngày hiệu lực.
- **ScheduleAssignment:** employee, ngày, shift, nguồn gán (`MANUAL` | `PATTERN`), người gán.
- **SchedulePattern:** mẫu lặp theo tuần (thứ → ca) để gán hàng loạt.

Quy tắc:

- Giờ làm chuẩn, ngày nghỉ chung và hạn mức phép vẫn thuộc `tenant-system/organization/work-policies`; ca chỉ chia nhỏ khung giờ đã cấu hình.
- Tổng giờ công của một ca không vượt giờ làm chuẩn/ngày trừ khi policy cho phép; vượt phải có lý do.
- Không gán ca chồng lấn cho cùng một nhân viên trong cùng ngày.
- Ca đã có check-in/check-out không được sửa giờ theo cách làm sai lệch dữ liệu điểm danh đã ghi; điều chỉnh đi qua đơn giải trình.
- Gán ca trùng ngày nghỉ phép đã duyệt phải cảnh báo; không tự hủy ca nhưng chặn duyệt ca mới trùng.
- Ngày nghỉ chung không sinh ca mặc định; nếu cần làm ngày lễ phải gán tường minh và ghi lý do.
- Ca đêm tính theo giờ địa phương `Asia/Ho_Chi_Minh`.
- Không xóa ca đã có dữ liệu chấm công; chuyển sang ngừng áp dụng.

### 2.2 UI/UX

- Lịch tuần theo nhân viên/team: cột là ngày, ô là ca; kéo-thả chỉ khi không phá ràng buộc, ngược lại trả lỗi rõ.
- Cảnh báo trước khi gán hàng loạt: số nhân viên, số ngày, xung đột phép/nghỉ lễ.
- Chế độ xem của Employee chỉ thấy lịch của mình và team được phép xem.
- Trạng thái: không có ca, ca đã qua, ca bị hủy, xung đột — luôn có nhãn text.

### 2.3 Acceptance tối thiểu

1. Không tạo được hai ca chồng lấn cho cùng nhân viên/ngày.
2. Ca trùng ngày nghỉ phép đã duyệt bị chặn kèm lý do.
3. Sửa ca đã có chấm công không làm thay đổi dữ liệu điểm danh lịch sử.
4. Employee không xem/sửa được lịch của người ngoài scope.

## 3. Resource capacity

### 3.1 Phạm vi

- **CapacityPeriod:** employee, khoảng ngày, số giờ khả dụng, số giờ đã phân bổ, mức sử dụng.
- **ProjectAllocation:** employee, project, tỷ lệ hoặc số giờ cam kết trong khoảng ngày.

Quy tắc:

- Công suất **tính**, không nhập tay: giờ chuẩn theo policy − ngày lễ − phép đã duyệt − phần không làm việc theo lịch.
- Allocation do Manager đặt trong phạm vi dự án; không vượt 100% công suất khả dụng mà không có cảnh báo và lý do.
- Cảnh báo quá tải hiển thị trên màn hình gán việc và trước khi gán task; không tự chặn gán việc (quyết định cuối thuộc Manager).
- Công suất không phải dữ liệu lương, không dùng để tính lương.
- Dữ liệu timesheet chỉ đối chiếu tham chiếu; không ghi ngược vào allocation.
- Khi nhân viên nghỉ việc/bị khóa, allocation tương lai chuyển trạng thái cần xử lý và báo Manager dự án.

### 3.2 UI/UX

- Bảng công suất theo team và kỳ: tổng giờ, đã phân bổ, còn lại, mức sử dụng; quá tải có text + màu.
- Biểu đồ chỉ là phụ; luôn có bảng số liệu tương đương cho screen reader.
- Nêu rõ kỳ tính, nguồn dữ liệu phép/lễ và thời điểm tính lại.

### 3.3 Acceptance tối thiểu

1. Công suất giảm đúng khi có phép đã duyệt hoặc ngày lễ trong kỳ.
2. Không đọc/ghi allocation của người ngoài scope.
3. Cảnh báo quá tải xuất hiện trước khi gán task, nhưng Manager vẫn có thể quyết định.
4. Số liệu hiển thị khớp phép tính server.

## 4. Positions và grades

### 4.1 Phạm vi

- **Position (chức danh):** tên, mô tả, trạng thái; dùng để lọc, tìm và chỉ định người làm/người kiểm tra.
- **Grade (cấp bậc):** mã, tên, thứ tự; có thể gắn với Position.
- **EmployeeAssignment:** employee ↔ position/grade theo thời gian hiệu lực.

Quy tắc:

- Chức danh/cấp bậc **không** xuất hiện trong bất kỳ điều kiện cấp quyền nào.
- Một nhân viên có một chức danh chính tại một thời điểm; lịch sử giữ nguyên.
- Ngừng dùng Position/Grade không làm mất dữ liệu nhân viên đang gắn; chỉ chặn gán mới.
- Không xóa Position/Grade đã được dùng.
- Thay đổi chức danh/cấp bậc ghi audit và không tự đổi role hay phạm vi quản lý.

### 4.2 UI/UX

- Danh mục có tìm kiếm, trạng thái, số nhân viên đang gắn.
- Trang nhân viên hiển thị chức danh/cấp bậc hiện tại và lịch sử.
- Không hiển thị chức danh như một nhãn quyền hạn.

### 4.3 Acceptance tối thiểu

1. Đổi chức danh không thay đổi quyền truy cập.
2. Không xóa được Position/Grade đang được gắn.
3. Lịch sử gán chức danh giữ nguyên sau khi đổi.

## 5. Company profile

### 5.1 Phạm vi

Thông tin pháp lý và nhận diện dùng chung: tên pháp lý, tên thương mại, mã số thuế, địa chỉ, người đại diện, logo, thông tin liên hệ, thông tin xuất hiện trên chứng từ/báo giá/hợp đồng.

Quy tắc:

- Chỉ `MANAGER` có quyền quản trị (hoặc System Admin) được sửa; Employee chỉ đọc phần được phép.
- Có một hồ sơ công ty active tại một thời điểm; thay đổi quan trọng giữ version.
- Logo và tệp đính kèm kiểm tra loại/kích thước; không nhận SVG có script.
- Thông tin công ty là nguồn duy nhất cho header chứng từ; CRM/Project đọc qua public contract, không lưu bản sao.
- Không lưu thông tin nhạy cảm không cần thiết (số tài khoản, giấy tờ tùy thân).

### 5.2 UI/UX

- Form nhóm theo mục: Định danh / Liên hệ / Nhận diện / Chứng từ.
- Xem trước logo và header chứng từ trước khi lưu.
- Cảnh báo khi thiếu trường bắt buộc cho xuất chứng từ.

### 5.3 Acceptance tối thiểu

1. Employee không sửa được hồ sơ công ty.
2. Thay đổi giữ version và audit.
3. Chứng từ hiển thị đúng thông tin active tại thời điểm phát hành.
4. Tệp logo sai loại/quá kích thước bị từ chối.

## 6. Quyết định mở cần phê duyệt

1. **Ca làm:** chỉ cần một khung giờ chuẩn/ngày (đề xuất), hay nhiều ca/ngày và ca đêm?
2. **Gán ca:** theo mẫu tuần, theo tháng, hay chỉ gán tay từng ngày?
3. **Công thức công suất:** giờ chuẩn − lễ − phép (đề xuất) hay có thêm hệ số năng suất/chức danh?
4. **Allocation:** theo % hay theo giờ? Cho phép nhiều dự án cùng lúc với tổng ≤100%?
5. **Quá tải:** chỉ cảnh báo (đề xuất) hay chặn gán task khi vượt ngưỡng?
6. **Grade:** có dùng cho lộ trình thăng tiến/lương không, hay chỉ phân loại hiển thị?
7. **Company profile:** một pháp nhân duy nhất (đề xuất) hay nhiều pháp nhân/chi nhánh?
8. **Chứng từ:** hồ sơ công ty có bắt buộc xuất hiện trên quotation/contract/receivable không?

Đã phê duyệt ngày 30/10/2026: một khung giờ chuẩn/ngày; gán ca theo mẫu tuần; công suất = giờ chuẩn − lễ − phép; allocation theo % với tổng ≤100%; quá tải chỉ cảnh báo; grade chỉ phân loại hiển thị; một pháp nhân duy nhất; hồ sơ công ty bắt buộc xuất hiện trên quotation/contract/receivable. Bốn nhánh được mở khóa.
