# Specifications đã phê duyệt

Năm specification dưới đây đã được **phê duyệt ngày 30/10/2026**. Người dùng chấp nhận toàn bộ phương án được đánh dấu “(đề xuất)”, nên các package tương ứng được mở khóa theo thứ tự phụ thuộc tại `docs/IMPLEMENTATION-CONTRACTS.md`.

| Specification | Nhánh liên quan | Trạng thái | Quyết định đã chốt |
| --- | --- | --- | --- |
| [CRM](CRM.md) | 7 nhánh `crm/*` | Approved 30/10/2026 | Employee thấy record được giao; receivables cần permission riêng; portal magic-link scoped; mã số thuế duy nhất; VND-only; Manager duyệt quotation; Project tạo qua xác nhận |
| [Automation và AI Copilot](AUTOMATION.md) | `workflow-rules`, `ai-copilot` | Approved 30/10/2026 | Trigger theo event; chỉ Manager tạo rule; rule được đổi assignee/deadline có audit; Copilot chỉ đọc + soạn nháp |
| [Work extensions](WORK-EXTENSIONS.md) | `timesheets`, `milestones-qa` | Approved 30/10/2026 | Kỳ tuần bắt đầu thứ Hai; phút và làm tròn 15; chỉ cờ billable; milestone gắn hợp đồng; QA là checklist gắn Task |
| [HR extensions](HR-EXTENSIONS.md) | `shifts-schedules`, `resource-capacity`, `positions-grades`, `company-profile` | Approved 30/10/2026 | Một khung giờ chuẩn/ngày; công suất = giờ chuẩn − lễ − phép; allocation theo %; quá tải chỉ cảnh báo; một pháp nhân |
| [Knowledge và SOP](KNOWLEDGE-SOP.md) | `knowledge-sop` | Approved 30/10/2026 | Mở rộng `WorkNote` bằng `kind`; bốn mức hiển thị; hai người duyệt; full-text và version đầy đủ |

## Quy ước phê duyệt

- Phê duyệt có hiệu lực cho đúng phạm vi đã ghi trong từng specification; không mở rộng sang package khác.
- Thay đổi sau phê duyệt phải cập nhật version, acceptance mapping và test liên quan.
- Nếu tài liệu gốc đã đủ rõ, specification chỉ ghi phần bổ sung cần thiết; không viết lại toàn bộ quy tắc nguồn.
- Không dùng specification này để thay đổi quy tắc đã chốt trong `docs/IMPLEMENTATION-CONTRACTS.md` mà không có quyết định riêng.
