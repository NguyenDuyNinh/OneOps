# Specification Automation Hub — APPROVED

**Trạng thái:** APPROVED ngày 30/10/2026. Người dùng chấp nhận toàn bộ phương án đánh dấu “(đề xuất)” làm quyết định triển khai. Thay đổi sau phê duyệt phải cập nhật version, acceptance mapping và test.

## 1. Mục tiêu và phạm vi

Hai nhánh thuộc `tenant-system/automation-hub`:

| Nhánh | Sở hữu | Không sở hữu |
| --- | --- | --- |
| `workflow-rules` | Định nghĩa rule, version rule, lần chạy, log hành động, trạng thái bật/tắt | Nghiệp vụ Task/Leave/Project; rule chỉ gọi public service |
| `ai-copilot` | Cấu hình provider, hội thoại, tool invocation, log/chi phí, chính sách dữ liệu | Không ghi trực tiếp dữ liệu feature khác; không thay quyết định của người dùng |

Nguyên tắc nền: automation là **người gọi**, không phải **chủ dữ liệu**. Rule và Copilot chỉ tác động qua public service đã có permission check; mọi hành động ghi đều chịu cùng authorization như thao tác tay của actor.

## 2. Workflow rules

### 2.1 Thành phần

- **Trigger:** một event trong catalog `docs/IMPLEMENTATION-CONTRACTS.md` (ví dụ `work.task.status-changed`, `hr.leave.approved`) hoặc lịch chạy theo giờ.
- **Condition:** biểu thức khai báo trên payload event + dữ liệu đọc được qua public service; không truy vấn bảng của feature khác.
- **Action:** một mục trong action catalog được allowlist; không thực thi mã tùy ý, không script, không SQL do người dùng nhập.
- **Rule version:** sửa rule tạo version mới; run đang chạy giữ version đã pin.
- **Run log:** `WorkflowRun` ghi trigger event, version, kết quả từng action, thời lượng, lỗi.

### 2.2 Action catalog khởi tạo

| Action | Gọi tới | Ghi chú |
| --- | --- | --- |
| `notification.send` | Notifications public service | Chỉ template đã đăng ký |
| `task.assign` / `task.set-deadline` | Tasks public service | Phải qua permission + version như thao tác tay |
| `task.add-comment` | Task Comments public service | Không giả danh người dùng; ghi `actorType=SYSTEM` |
| `request.create` | Tickets/Approvals public service | Dùng cho luồng duyệt phát sinh |
| `webhook.emit` | External Integrations | Payload allowlist, có chữ ký, timeout |

Thêm action phải cập nhật bảng này, test contract và mô tả permission tương ứng.

### 2.3 Chống lặp và an toàn

- Một rule chạy tối đa một lần cho mỗi `(eventId, ruleVersionId)` — idempotent theo khóa duy nhất.
- Giới hạn chuỗi: event do rule sinh ra mang `causationDepth`; vượt ngưỡng cấu hình thì dừng và ghi cảnh báo, không chạy tiếp.
- Rule có thể `DRY_RUN`: chỉ ghi log dự kiến, không gọi action ghi.
- Tắt rule phải có hiệu lực ngay với run chưa bắt đầu; run đang chạy kết thúc an toàn.
- Mọi thay đổi rule (bật/tắt/sửa) ghi audit: ai, khi nào, khác biệt nội dung.
- Rule không được cấp quyền nhiều hơn actor tạo rule; khi actor mất quyền, rule do actor đó sở hữu bị tạm dừng và báo chủ sở hữu mới.
- Không cho phép rule tự duyệt đơn/đề xuất của chính người tạo rule.

### 2.4 UI/UX

- Danh sách rule: tên, trigger, trạng thái, version đang dùng, lần chạy gần nhất, tỷ lệ lỗi.
- Form rule: chọn trigger từ catalog, builder condition có validate, chọn action từ allowlist; không có ô nhập mã.
- Trang chi tiết: tab Định nghĩa / Lịch sử version / Lần chạy / Audit.
- Chạy thử (dry-run) hiển thị input, kết quả dự kiến và cảnh báo trước khi lưu.
- Trạng thái lỗi phải nêu rule, action lỗi, mã lỗi và cách khắc phục; không chỉ “chạy thất bại”.

## 3. AI Copilot

### 3.1 Phạm vi chức năng được đề xuất

- Trả lời câu hỏi về dữ liệu người dùng **được phép xem** (task, dự án, công nợ, tài liệu SOP) qua tool đọc.
- Tóm tắt task/bình luận/tài liệu trong ngữ cảnh đang mở.
- Soạn nháp nội dung (bình luận, mô tả task, email) để người dùng sửa và tự gửi.
- Đề xuất hành động nhưng **không tự thực thi** hành động ghi.

### 3.2 Ranh giới bắt buộc

- Copilot dùng đúng `ActorContext` của phiên; tool đọc/ghi tái sử dụng public service, không có đường tắt quyền.
- Không đưa dữ liệu ngoài scope vào prompt; kết quả tool được lọc theo permission trước khi gửi model.
- Không gửi secret, mật khẩu, token, dữ liệu thanh toán, nội dung file ngoài allowlist vào provider.
- Hành động ghi chỉ diễn ra sau xác nhận rõ ràng của người dùng; hiển thị chính xác thay đổi trước khi áp dụng.
- Không dùng Copilot để duyệt đơn, đổi role, mở khóa tài khoản, ghi nhận thanh toán hoặc kích hoạt hợp đồng.
- Mọi tool call ghi log: actor, tool, tham số đã lọc, kết quả tóm tắt, thời lượng, chi phí; nội dung nhạy cảm được che.
- Provider lỗi/timeout phải trả trạng thái thất bại rõ; không trả câu trả lời bịa khi không có dữ liệu.

### 3.3 Cấu hình

- Provider là adapter trong `external-integrations`, cấu hình khóa/endpoint qua biến môi trường, không lưu trong source.
- Có thể tắt Copilot toàn hệ thống hoặc theo Department bằng cấu hình; khi tắt, UI ẩn entry và API trả `403`.
- Giới hạn số lượt/ngày theo actor và theo tenant; vượt hạn mức trả lỗi nghiệp vụ rõ ràng.
- Lưu hội thoại theo thời hạn cấu hình; người dùng xóa được hội thoại của mình.

### 3.4 UI/UX

- Panel Copilot tách khỏi nội dung chính, mở/đóng được, không che hành động chính.
- Hiển thị rõ nguồn: câu trả lời dựa trên record nào; link tới record nếu người dùng có quyền.
- Phân biệt nội dung do AI tạo và nội dung do người dùng viết.
- Trạng thái: đang xử lý, bị giới hạn, provider không khả dụng, thiếu quyền, không đủ dữ liệu.
- Không tự gửi nội dung, không tự tạo record; nút hành động luôn do người dùng bấm.

## 4. Acceptance tối thiểu

1. Rule không thực thi mã tùy ý và từ chối action ngoài allowlist.
2. Cùng `eventId` và rule không tạo hai lần chạy/hai side effect.
3. Rule do actor mất quyền sở hữu bị tạm dừng và báo chủ sở hữu.
4. Hành động của rule chịu cùng kiểm tra permission/version như thao tác tay; thất bại ghi log, không nuốt lỗi.
5. Copilot không trả dữ liệu ngoài scope của actor, kể cả khi actor hỏi trực tiếp bằng ID.
6. Copilot không thực thi hành động ghi khi chưa có xác nhận.
7. Provider lỗi không làm hỏng luồng nghiệp vụ chính và không tạo dữ liệu một nửa.
8. Log Copilot và rule không chứa secret; có thể kiểm tra bằng test.

## 5. Quyết định mở cần phê duyệt

1. **Phạm vi rule:** chỉ dùng cho trigger nội bộ (event) trong giai đoạn đầu, hay cần cả lịch chạy định kỳ?
2. **Người tạo rule:** chỉ Manager/System Admin, hay Employee cũng tạo được rule cá nhân?
3. **Action ghi:** cho phép rule đổi assignee/deadline tự động (đề xuất: có, kèm audit và giới hạn), hay chỉ thông báo/tạo comment?
4. **Phê duyệt rule:** rule ảnh hưởng nhiều người có cần Manager thứ hai duyệt trước khi bật?
5. **AI provider:** dùng provider ngoài (cần cam kết không lưu dữ liệu) hay model nội bộ? Có yêu cầu chạy offline không?
6. **Dữ liệu gửi model:** cho phép gửi nội dung task/comment/tài liệu hay chỉ metadata?
7. **Hành động Copilot:** chỉ đọc + soạn nháp (đề xuất), hay cho phép thực thi sau xác nhận?
8. **Lưu hội thoại:** thời hạn bao lâu và ai được xem lại (chỉ chủ hội thoại hay cả Manager)?

Đã phê duyệt ngày 30/10/2026: trigger nội bộ theo event; chỉ Manager/System Admin tạo rule; rule được đổi assignee/deadline kèm audit; rule ảnh hưởng nhiều người cần Manager thứ hai duyệt; ưu tiên provider ngoài có cam kết không lưu dữ liệu; chỉ gửi metadata và nội dung trong scope; Copilot chỉ đọc + soạn nháp; lưu hội thoại theo thời hạn cấu hình, chỉ chủ hội thoại xem lại. Phase 9 được mở khóa.
