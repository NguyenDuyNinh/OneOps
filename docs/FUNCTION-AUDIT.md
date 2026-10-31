# Rà soát chức năng và quyền sở hữu module

Đánh giá từ mã nguồn thực tế, không suy ra mức hoàn thiện từ tên thư mục. Báo cáo được đối chiếu lại toàn bộ 39 nhánh ngày 31/10/2026 sau khi hoàn thiện toàn diện các phân hệ: Tenant Access Control & Audit, HR Organization & Employees, Work Workflow, Milestones/QA, Timesheets và Real-time Notifications.

---

## 1. Mức độ triển khai chi tiết

| Chức năng                                            |    FE     |    BE     | Hiện trạng & Đánh giá nghiệp vụ                                                                                 |
| ---------------------------------------------------- | :-------: | :-------: | --------------------------------------------------------------------------------------------------------------- |
| `tenant-system/organization/company-profile`         |   Trống   |   Trống   | Thư mục cấu trúc chuẩn; dành cho hồ sơ doanh nghiệp khi mở rộng.                                                |
| `tenant-system/organization/work-policies`           |   Trống   |   Trống   | Chưa triển khai, được để trống theo yêu cầu kiến trúc.                                                          |
| `tenant-system/access-control/tenant-auth`           | **Có mã** | **Có mã** | Xác thực phiên đăng nhập trượt (sliding session), thiết lập First Admin an toàn, cookie phiên & `SessionGuard`. |
| `tenant-system/access-control/roles-permissions`     | **Có mã** | **Có mã** | Quản lý vai trò (Role), gán quyền (RoleBinding), bộ catalog quyền hạn và `PermissionGuard`.                     |
| `tenant-system/access-control/accounts`              | **Có mã** | **Có mã** | Vòng đời tài khoản người dùng, đổi mật khẩu, kích hoạt/tạm khóa tài khoản.                                      |
| `tenant-system/automation-hub/external-integrations` |   Trống   |   Trống   | Chưa triển khai, được để trống theo yêu cầu kiến trúc.                                                          |
| `tenant-system/automation-hub/workflow-rules`        |   Trống   |   Trống   | Chưa triển khai, được để trống theo yêu cầu kiến trúc.                                                          |
| `tenant-system/automation-hub/ai-copilot`            |   Trống   |   Trống   | Chưa triển khai, được để trống theo yêu cầu kiến trúc.                                                          |
| `tenant-system/checklog`                             | **Có mã** | **Có mã** | Nhật ký kiểm toán bất biến (append-only), lưu vết truy vết thao tác và dữ liệu trước/sau thay đổi.              |
| `work-management/work/tasks`                         | **Có mã** | **Có mã** | CRUD công việc, checklist, người phụ trách, liên kết dự án; trạng thái chuyển tiếp qua workflow.                |
| `work-management/work/task-workflow`                 | **Có mã** | **Có mã** | Máy trạng thái TR-02…TR-09, phân quyền thao tác theo actor, đề xuất hoãn/hủy/gia hạn chờ Quản lý duyệt.         |
| `work-management/work/task-comments`                 | **Có mã** | **Có mã** | API riêng `/task-comments`; bình luận người dùng và bình luận hệ thống (SYSTEM log), đính kèm liên kết.         |
| `work-management/work/kanban`                        | **Có mã** | _View FE_ | Giao diện Kanban trực quan kéo thả thẻ công việc, tích hợp trực tiếp với máy trạng thái task-workflow.          |
| `work-management/coordination/notifications`         | **Có mã** | **Có mã** | Kênh Server-Sent Events (SSE) thời gian thực, đếm badge unread, cơ chế xóa mềm (Soft Delete `deletedAt`).       |
| `work-management/coordination/internal-chat`         | **Có mã** | **Có mã** | Kênh trao đổi nội bộ theo chủ đề và tin nhắn thành viên trong không gian làm việc.                              |
| `work-management/coordination/workspace-today`       | **Có mã** | **Có mã** | Dashboard tổng quan ngày, tích hợp tiện ích làm việc, sự kiện lịch (`calendar`) và chỉ số báo cáo (`reports`).  |
| `work-management/coordination/tickets-approvals`     | **Có mã** | **Có mã** | Tạo phiếu đề xuất nội bộ và quy trình xét duyệt/từ chối kèm lý do phản hồi.                                     |
| `work-management/coordination/knowledge-sop`         | **Có mã** | **Có mã** | Soạn thảo, lưu trữ và tra cứu quy trình vận hành tiêu chuẩn (SOP), ghi chú nghiệp vụ.                           |
| `work-management/projects/project-spaces`            | **Có mã** | **Có mã** | Quản lý không gian dự án, phân loại danh mục, theo dõi tỷ lệ % hoàn thành và thành viên.                        |
| `work-management/projects/milestones-qa`             | **Có mã** | **Có mã** | Mốc tiến độ dự án, cổng kiểm định chất lượng (QA Gate) bắt buộc ký duyệt trước khi đóng mốc/hoàn tất việc.      |
| `work-management/projects/timesheets`                | **Có mã** | **Có mã** | Bảng chấm công tuần, ghi nhận giờ làm bước 15 phút, cơ chế duyệt bảng công của quản lý.                         |
| `hr-management/attendance/daily-checkin`             |   Trống   |   Trống   | Chưa triển khai, được để trống theo yêu cầu kiến trúc.                                                          |
| `hr-management/attendance/workforce-board`           |   Trống   |   Trống   | Chưa triển khai, được để trống theo yêu cầu kiến trúc.                                                          |
| `hr-management/attendance/checkin-explanations`      |   Trống   |   Trống   | Chưa triển khai, được để trống theo yêu cầu kiến trúc.                                                          |
| `hr-management/attendance/shifts-schedules`          |   Trống   |   Trống   | Chưa triển khai, được để trống theo yêu cầu kiến trúc.                                                          |
| `hr-management/attendance/attendance-reports`        |   Trống   |   Trống   | Chưa triển khai, được để trống theo yêu cầu kiến trúc.                                                          |
| `hr-management/leaves/leave-requests`                |   Trống   |   Trống   | Chưa triển khai, được để trống theo yêu cầu kiến trúc.                                                          |
| `hr-management/leaves/leave-approvals`               |   Trống   |   Trống   | Chưa triển khai, được để trống theo yêu cầu kiến trúc.                                                          |
| `hr-management/employees/employee-directory`         | **Có mã** | **Có mã** | Danh bạ nhân sự toàn công ty, thông tin nhân viên, chức vụ, phòng ban và liên kết tài khoản hệ thống.           |
| `hr-management/employees/resource-capacity`          |   Trống   |   Trống   | Chưa triển khai, được để trống theo yêu cầu kiến trúc.                                                          |
| `hr-management/organization/departments-teams`       | **Có mã** | **Có mã** | Sơ đồ phòng ban hình cây không chu trình (BR-ORG-10), phân bổ Trưởng phòng/Trưởng nhóm quản lý.                 |
| `hr-management/organization/positions-grades`        | **Có mã** | **Có mã** | Danh mục vị trí công việc, chức danh nghề nghiệp và ngạch bậc chuyên môn.                                       |
| `crm/presales/leads-customers`                       |   Trống   |   Trống   | Chưa triển khai, được để trống theo yêu cầu kiến trúc.                                                          |
| `crm/presales/discovery-briefs`                      |   Trống   |   Trống   | Chưa triển khai, được để trống theo yêu cầu kiến trúc.                                                          |
| `crm/commercial/quotations-sow`                      |   Trống   |   Trống   | Chưa triển khai, được để trống theo yêu cầu kiến trúc.                                                          |
| `crm/commercial/contracts`                           |   Trống   |   Trống   | Chưa triển khai, được để trống theo yêu cầu kiến trúc.                                                          |
| `crm/customer-success/receivables`                   |   Trống   |   Trống   | Chưa triển khai, được để trống theo yêu cầu kiến trúc.                                                          |
| `crm/customer-success/customer-portal`               |   Trống   |   Trống   | Chưa triển khai, được để trống theo yêu cầu kiến trúc.                                                          |
| `crm/customer-success/after-sales`                   |   Trống   |   Trống   | Chưa triển khai, được để trống theo yêu cầu kiến trúc.                                                          |

---

## 2. Thống kê tổng hợp

- **Tổng số nhánh đăng ký theo cấu trúc:** 39 nhánh đối xứng FE/BE.
- **Số chức năng dữ liệu hoàn chỉnh:** **20 chức năng** (gồm 9 Record APIs và 11 Resource APIs đã được kiểm định đầy đủ).
- **Số model Prisma thuộc quyền sở hữu:** **30 models** phân tán trong các thư mục `prisma/` của từng chức năng.
- **Mã nguồn hợp lệ:** **540 source files** có thể truy vết đầy đủ từ application entrypoints (`npm run unused:check` đạt 100%).

---

## 3. Ranh giới sở hữu nghiệp vụ đã được chuẩn hóa

| Cặp phân hệ                                    | Ranh giới sở hữu chuẩn                                                                                                                                                    |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **accounts / tenant-auth / roles-permissions** | `accounts` quản lý vòng đời tài khoản người dùng; `tenant-auth` xác thực phiên/cookie và actor context; `roles-permissions` quản lý chính sách vai trò và quyền truy cập. |
| **positions-grades / roles-permissions**       | Chức danh chuyên môn nhân sự thuộc HR; vai trò phân quyền phần mềm thuộc Tenant System. Không gán tự động quyền chỉ từ tên chức danh.                                     |
| **departments-teams / project-spaces**         | Phòng ban/đội nhóm phản ánh cơ cấu tổ chức doanh nghiệp lâu dài; dự án là không gian làm việc theo mục tiêu có thời hạn.                                                  |
| **task-comments / internal-chat**              | Bình luận task phục vụ trao đổi tiến độ theo từng công việc; chat nội bộ phục vụ trao đổi theo kênh chủ đề chung.                                                         |
| **notifications / checklog**                   | Thông báo phục vụ cập nhật tương tác thời gian thực cho người dùng cá nhân (có xóa mềm); nhật ký kiểm toán phục vụ truy vết bằng chứng pháp lý (bất biến).                |
| **tasks / task-workflow / kanban**             | Task sở hữu thực thể dữ liệu; workflow thực thi quy tắc chuyển trạng thái hữu hạn; Kanban cung cấp giao diện trực quan thao tác kéo thả.                                  |

---

## 4. Các khoảng trống thiết kế dành cho giai đoạn tiếp theo

1. **Tenant System:** Bổ sung cấu hình chính sách làm việc (`work-policies`), hồ sơ doanh nghiệp (`company-profile`), và trung tâm tích hợp ngoài (`automation-hub`).
2. **HR Management:** Bổ sung phân hệ Chấm công điểm danh (`attendance`), Quản lý nghỉ phép (`leaves`) và Bảng công suất định biên (`resource-capacity`).
3. **CRM:** Bổ sung trọn vẹn quy trình bán hàng, hợp đồng thương mại và cổng chăm sóc khách hàng.
