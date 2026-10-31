# Rà soát chức năng và quyền sở hữu module

Đánh giá từ mã nguồn thực tế, không suy ra mức hoàn thiện từ tên thư mục. Báo cáo được đối chiếu lại toàn bộ 39 nhánh ngày 30/10/2026; riêng các nhánh Work được cập nhật ngày 31/10/2026 sau khi hoàn thiện workflow, mốc & QA và timesheets. Trạng thái “có mã” chỉ xác nhận artifact tồn tại, không xác nhận đủ nghiệp vụ hay tiêu chí nghiệm thu.

## Mức độ triển khai

| Chức năng | FE | BE | Nhận xét |
| --- | --- | --- | --- |
| tenant-system/organization/company-profile | Trống | Trống | Code đội nhóm đã gỡ; dành cho hồ sơ doanh nghiệp. |
| tenant-system/organization/work-policies | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| tenant-system/access-control/tenant-auth | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| tenant-system/access-control/roles-permissions | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| tenant-system/access-control/accounts | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| tenant-system/automation-hub/external-integrations | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| tenant-system/automation-hub/workflow-rules | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| tenant-system/automation-hub/ai-copilot | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| tenant-system/checklog | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| work-management/work/tasks | Có mã | Có mã | CRUD, checklist trong `fields`; trạng thái chỉ đổi qua workflow TR-02…TR-09, không nhận status khi tạo/PATCH. Người thực hiện/người kiểm tra vẫn là chuỗi. |
| work-management/work/task-workflow | Có mã | Có mã | Bảng chuyển trạng thái TR-02…TR-09, quyền theo actor (assignee/reviewer/manager), lịch sử kèm lý do; đề xuất HOLD/CANCEL/DEADLINE chờ Quản lý khác quyết. |
| work-management/work/task-comments | Có mã | Có mã | API riêng `/task-comments`; bình luận COMMENT và SYSTEM (lý do workflow), @nhắc tên, đính kèm dạng liên kết. |
| work-management/work/kanban | Có mã | Không cần | View đọc tasks và danh sách chuyển trạng thái được phép từ workflow; không có dữ liệu task thứ hai. |
| work-management/coordination/notifications | Có mã | Có mã | Danh sách/chi tiết/đã đọc/xóa mềm, lưu PostgreSQL và SSE có heartbeat; phát sự kiện hiện chạy trong một tiến trình, chưa có outbox/retry/liên kết danh tính. |
| work-management/coordination/internal-chat | Có mã | Có mã | Chủ đề và bình luận lưu qua API; chưa có chat realtime/identity. |
| work-management/coordination/workspace-today | Có mã | Có mã | Dashboard và tiện ích; có thêm calendar/reports để giữ chức năng cũ. |
| work-management/coordination/tickets-approvals | Có mã | Có mã | CRUD và đổi status; chưa có quy trình phê duyệt được phân quyền; category Nghỉ phép sai phạm vi. |
| work-management/coordination/knowledge-sop | Có mã | Có mã | Ghi chú/tri thức cơ bản; chưa có SOP có phiên bản/phê duyệt. |
| work-management/projects/project-spaces | Có mã | Có mã | CRUD dự án, thành viên và tiến độ nhập tay; chưa có liên kết task/nhân sự. |
| work-management/projects/milestones-qa | Có mã | Có mã | Mốc gắn dự án/hợp đồng, liên kết task, tiêu chí chấp nhận có cờ bắt buộc; cổng QA chặn TR-04 và Quản lý override phải ghi lý do. |
| work-management/projects/timesheets | Có mã | Có mã | Tuần bắt đầu thứ Hai, bước 15 phút, ngưỡng ngày 480 phút và tuần 2400 phút; gửi dưới ngưỡng tự duyệt, Quản lý không tự duyệt tuần của mình, điều chỉnh chỉ sau khi duyệt. |
| hr-management/attendance/daily-checkin | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| hr-management/attendance/workforce-board | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| hr-management/attendance/checkin-explanations | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| hr-management/attendance/shifts-schedules | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| hr-management/attendance/attendance-reports | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| hr-management/leaves/leave-requests | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| hr-management/leaves/leave-approvals | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| hr-management/employees/employee-directory | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| hr-management/employees/resource-capacity | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| hr-management/organization/departments-teams | Trống | Trống | Module quản lý phòng ban; chưa triển khai và không nhận code đội nhóm cũ. |
| hr-management/organization/positions-grades | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| crm/presales/leads-customers | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| crm/presales/discovery-briefs | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| crm/commercial/quotations-sow | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| crm/commercial/contracts | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| crm/customer-success/receivables | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| crm/customer-success/customer-portal | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |
| crm/customer-success/after-sales | Trống | Trống | Chưa triển khai, được để trống theo yêu cầu trước đó. |

Trong 39 nhánh đăng ký: 7 có mã cả FE/BE, 2 chỉ có FE, 30 chưa có implementation. Hai implementation calendar/reports nằm dưới workspace-today không tính thêm vào 39 nhánh.

## Phạm vi cần xử lý và nội dung đã cập nhật

- Đã xử lý company-profile theo yêu cầu 30/10/2026: xóa code đội nhóm và để trống; không chuyển code sang HR. departments-teams có nhiệm vụ quản lý phòng ban, chưa triển khai.
- tickets-approvals cho phép category Nghỉ phép trong cả types FE và DTO BE. Luồng nghỉ phép phải thuộc HR/leave-requests và leave-approvals. Work chỉ tổng hợp/truy cập qua hợp đồng công khai nếu cần; không tạo đơn nghỉ phép song song.

## Chồng phạm vi cần chốt trước khi triển khai

| Các nhánh | Ranh giới đề xuất |
| --- | --- |
| work-policies / shifts-schedules | Tenant giữ chính sách áp dụng toàn doanh nghiệp; HR giữ ca và phân lịch cho nhân viên. |
| accounts / tenant-auth / roles-permissions | Accounts quản lý vòng đời tài khoản; auth xác thực/token; permissions quản lý chính sách truy cập. |
| positions-grades / roles-permissions | Chức danh/cấp bậc nhân sự khác vai trò phân quyền phần mềm. Không suy ra quyền tự động chỉ từ chức danh. |
| calendar / shifts-schedules | Calendar cho họp/sự kiện/tập trung; HR cho ca và lịch lao động. |
| task-comments / internal-chat | Bình luận theo task khác trao đổi theo kênh/chủ đề. Không lưu lặp cùng nội dung vào hai nơi. |
| workspace reports / attendance-reports | Báo cáo tổng quan công việc khác báo cáo công. Có thể đọc số liệu công khai để tổng hợp. |
| tasks / task-workflow / kanban | Task sở hữu dữ liệu; workflow quyết định chuyển trạng thái; Kanban trình bày/thao tác qua hợp đồng. Không tạo ba vòng đời task riêng. |

## Các khoảng trống quan trọng

- Tenant: tài khoản, xác thực, phân quyền, chính sách, nhật ký, backup và tích hợp chưa có.
- Work: task-workflow, milestones-qa và timesheets đã có FE/BE; notifications đã có nền tảng nhưng thiếu outbox/retry/replay bền vững; tickets-approvals và knowledge-sop vẫn chỉ là CRUD cơ bản.
- HR: toàn bộ 11 nhánh chưa có implementation.
- CRM: toàn bộ 7 nhánh chưa có implementation.
- Task, thành viên, dự án và đội nhóm chưa liên kết bằng ID nghiệp vụ; nhiều trường vẫn là chuỗi nhập tự do. Độc lập mã nguồn vẫn cho phép liên kết bằng public API/ID; không cần đọc chéo repository.

## Có chức năng thừa cần xóa không?

Chưa xác định được chức năng đã triển khai nào đủ bằng chứng để xóa. Các thư mục trống là phần được yêu cầu scaffold. Những phần chồng tên hiện phần lớn chưa có code nên là nguy cơ trùng trách nhiệm, chưa phải hai implementation trùng nhau. Calendar, báo cáo, Kanban và bình luận đang có luồng sử dụng thật.

Kiểm tra architecture và unused đạt; 540 file source reachable. Đây là kiểm tra import/artifact, không chứng minh việc phân bổ nghiệp vụ đúng hoặc mọi tính năng đã hoàn thiện.
