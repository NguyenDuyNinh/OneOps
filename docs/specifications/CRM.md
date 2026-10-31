# Specification CRM — APPROVED

**Trạng thái:** APPROVED ngày 30/10/2026. Người dùng chấp nhận toàn bộ phương án đánh dấu “(đề xuất)” làm quyết định triển khai. Thay đổi sau phê duyệt phải cập nhật version, acceptance mapping và test.

## 1. Mục tiêu và phạm vi

Quản lý vòng đời từ Lead/Customer → Discovery → Báo giá/SOW → Hợp đồng → Dự án → Phải thu → Chăm sóc sau bán. CRM sở hữu dữ liệu khách hàng và thương mại; Work/Project chỉ nhận reference qua scalar ID và public contract.

Bảy nhánh:

| Nhánh | Sở hữu |
| --- | --- |
| `leads-customers` | Lead, Customer, contact, owner, conversion, lịch sử |
| `discovery-briefs` | Brief nhu cầu, stakeholder, scope, version |
| `quotations-sow` | Line item, báo giá, SOW, revision, acceptance |
| `contracts` | Contract, phụ lục, hiệu lực, file, liên kết Project |
| `receivables` | Công nợ, due date, thanh toán ghi nhận thủ công |
| `customer-portal` | Lối truy cập giới hạn cho khách hàng |
| `after-sales` | Ticket/hỗ trợ sau bán, SLA, phản hồi |

## 2. Nguyên tắc chung

- Chỉ hai role nền tảng `EMPLOYEE`/`MANAGER`; chức danh Sales/Account không cấp quyền.
- Trong phạm vi được cấp, `MANAGER` quản lý pipeline và phê duyệt; `EMPLOYEE` thao tác trên record được giao. `is_system_admin` có quyền ngoài scope nhưng mọi override phải audit.
- Mọi bảng có `version`, `createdAt`, `updatedAt`, lịch sử bất biến cho thay đổi quan trọng.
- Không hard-delete. Chỉ hủy/đóng record và lưu lý do.
- Số chứng từ sinh server-side, không cho client sửa: `LEAD-YYYY-NNNNNN`, `QT-YYYY-NNNNNN`, `CTR-YYYY-NNNNNN`, `INV-YYYY-NNNNNN`, `AS-YYYY-NNNNNN`.
- Tiền dùng `decimal`, tiền tệ mặc định `VND`, làm tròn tại line item theo quy tắc được duyệt; không dùng floating point.
- Mọi mutation nhạy cảm có Idempotency-Key và version; file có type/size/authorization check.

## 3. Luồng trạng thái đề xuất

### Lead

`NEW → CONTACTED → QUALIFIED → CONVERTED`

`NEW|CONTACTED|QUALIFIED → DISQUALIFIED` bắt buộc lý do.

- Convert tạo Customer và liên kết Lead gốc; không xóa Lead.
- Chỉ một Customer active cho một mã số thuế/định danh doanh nghiệp nếu quyết định dedupe được duyệt.
- Reopen chỉ từ `DISQUALIFIED` về `NEW` bởi Manager, có lý do và history.

### Customer

`PROSPECT → ACTIVE → INACTIVE`; `ACTIVE → BLOCKED` khi có tranh chấp/công nợ nghiêm trọng.

- `BLOCKED/INACTIVE` không cho tạo hợp đồng mới nhưng giữ dữ liệu cũ.

### Discovery Brief

`DRAFT → IN_REVIEW → APPROVED → SUPERSEDED`; `IN_REVIEW → CHANGES_REQUESTED → DRAFT`.

- Nội dung tối thiểu: vấn đề, mục tiêu, scope in/out, stakeholder, ràng buộc, tiêu chí thành công.
- Khi Approved, tạo version bất biến. Sửa tiếp tạo revision mới, không sửa bản đã duyệt.

### Quotation/SOW

`DRAFT → SUBMITTED → ACCEPTED | REJECTED | EXPIRED`; `SUBMITTED → REVISED → SUBMITTED`.

- `SUBMITTED` khóa line item/version; revision tạo bản mới có số revision.
- Tổng = subtotal line item − discount + tax theo cấu hình; lưu snapshot công thức/giá trị tại thời điểm submit.
- SOW có thể cùng quotation hoặc tài liệu riêng; một SOW approved có thể dẫn tới nhiều Contract? **Cần chốt.**

### Contract

`DRAFT → PENDING_SIGNATURE → ACTIVE → COMPLETED`; `ACTIVE → TERMINATED`; `DRAFT|PENDING_SIGNATURE → CANCELLED`.

- Chỉ contract `ACTIVE` mới được liên kết/tạo Project.
- Một Project có thể tham chiếu tối đa một contract chính và nhiều phụ lục; liên kết là reference một chiều, không copy dữ liệu.
- Gia hạn/sửa đổi tạo phụ lục hoặc contract version mới, giữ bản cũ.

### Receivable

`DRAFT → ISSUED → PARTIALLY_PAID → PAID`; quá hạn là trạng thái tính toán `OVERDUE`, không ghi đè trạng thái thanh toán.

- Ghi nhận thanh toán thủ công trong phạm vi spec này; tích hợp kế toán/payment gateway là quyết định riêng.
- Không sửa/xóa payment đã ghi; sai sót dùng reversal có lý do và audit.
- Số tiền còn lại = issued amount − tổng payment hợp lệ.

### After-sales

`OPEN → IN_PROGRESS → WAITING_CUSTOMER → RESOLVED → CLOSED`; `OPEN|IN_PROGRESS|WAITING_CUSTOMER → ESCALATED`.

- SLA tính theo priority + business hours; “resolved” không đồng nghĩa “closed”.
- Ticket giữ liên kết Customer, Contract, Project và người phụ trách.

## 4. Quyền đề xuất

| Hành động | EMPLOYEE | MANAGER | Điều kiện |
| --- | --- | --- | --- |
| Xem Lead/Customer | Record được giao hoặc cùng scope cho phép | Trong Department/CRM scope | Không xem giá/contract ngoài quyền |
| Tạo Lead | Có | Có | Trong scope |
| Convert Lead | Đề xuất/không có | Có | Không trùng Customer |
| Sửa pipeline stage | Record được giao | Trong scope | History bắt buộc |
| Tạo/sửa quotation draft | Record được giao | Trong scope | Không sửa bản submitted |
| Submit quotation | Có nếu được cấp | Có | Idempotent |
| Accept/reject quotation | Không | Có | Không tự duyệt bản mình submit nếu policy yêu cầu |
| Kích hoạt Contract | Không | Có | File/hiệu lực hợp lệ |
| Xem Receivable | Không mặc định | Trong scope | **Cần chốt quyền nhân viên Sales** |
| Ghi nhận thanh toán | Không | Có | Audit + reversal |
| Customer portal access | Quản lý lời mời thuộc scope | Có | Cần chốt mô hình portal |

Không cho phép truy cập chéo customer bằng đoán ID; API kiểm tra quan hệ record + scope mỗi lần.

## 5. Dữ liệu tối thiểu

- **Lead:** tên liên hệ, company, email/phone, source, owner, stage, nhu cầu, next action, lý do lost.
- **Customer:** tên pháp lý, mã số thuế/định danh, địa chỉ, contact chính, owner, trạng thái; contact có consent/visibility.
- **Discovery:** customer/lead, version, stakeholder, pain/goal/scope, constraints, success criteria, reviewer.
- **Quotation:** customer, items (mô tả, qty, unit price, discount, tax), currency, validity, terms, version, approval.
- **Contract:** customer, quotation/SOW reference, số, ngày hiệu lực/kết thúc, giá trị, file, trạng thái, Project reference.
- **Receivable:** contract, amount, due date, payment records, notes, status derived.
- **Portal:** customer contact, scope được thấy, invitation/revocation, last access, audit.
- **After-sales:** customer, contract/project, priority, category, assignee, SLA, messages, resolution.

Không lưu số thẻ/CVV/bí mật thanh toán. File hợp đồng tối đa 50 MB theo tài liệu; loại file phải allowlist.

## 6. UI/UX bắt buộc

- Pipeline/list có filter owner/stage/overdue, bulk actions an toàn, không mất filter khi mở detail.
- Customer detail: summary, contacts, discovery, quotations, contracts, receivables, tickets, activity theo tab có deep link.
- Form quotation có line item table, tổng tính server-authoritative, cảnh báo submit lặp; mobile đọc được totals.
- Số tiền/trạng thái quá hạn luôn có text + màu; không chỉ biểu tượng.
- Portal có thông báo phạm vi dữ liệu, session ngắn, logout/revoke rõ ràng, không hiển thị dữ liệu nội bộ/người dùng khác.
- Mọi UI tuân thủ `docs/UX-DESIGN-CONTRACT.md`.

## 7. Acceptance tối thiểu

1. Convert Lead tạo đúng một Customer, giữ Lead và audit; chặn convert lặp.
2. Không thể sửa quotation `SUBMITTED`; revision tạo bản mới và totals khớp.
3. Contract chỉ `ACTIVE` mới tạo/liên kết Project; Project chỉ giữ reference, không copy dữ liệu khách hàng.
4. Employee ngoài scope nhận `403/404` phù hợp, không thấy dữ liệu qua URL/ID/API.
5. Receivable partial payment tính đúng remaining; reversal giữ lịch sử, không sửa payment gốc.
6. Portal user không truy cập được customer/record ngoài invitation scope.
7. Xóa cứng bị chặn với mọi record đã có lịch sử/giao dịch.
8. File contract/download kiểm tra quyền mỗi request, không dùng URL công khai vĩnh viễn.

## 8. Quyết định mở cần phê duyệt

1. **Sales ownership:** Employee chỉ thấy record được giao, hay thấy toàn bộ customer của Department? Đề xuất: record được giao + Manager thấy scope.
2. **Quyền xem công nợ:** Employee Sales có được xem receivables không? Đề xuất: chỉ Manager/Finance được cấp qua job assignment, nhưng quyền vẫn là permission riêng chứ không phải role thứ ba.
3. **Customer portal:** dùng magic-link scoped (đề xuất), tài khoản customer riêng, hay chỉ chia sẻ file có hạn?
4. **Dedupe customer:** dùng mã số thuế là duy nhất, hay cảnh báo mềm?
5. **Numbering:** dùng số server-side theo năm; có cần cấu hình prefix/reset kỳ không?
6. **Currency/tax:** VND-only ban đầu (đề xuất) hay đa tiền tệ? Thuế áp theo line hay toàn bộ?
7. **Quotation approval:** Manager phải duyệt trước khi gửi khách, hay submit là đủ?
8. **Contract → Project:** tạo Project tự động khi contract active, hay chỉ mở nút “Tạo dự án” và yêu cầu Manager xác nhận?

Đã phê duyệt ngày 30/10/2026: áp dụng các phương án đề xuất (Employee chỉ thấy record được giao; receivables cần permission riêng; portal magic-link scoped; mã số thuế duy nhất kèm cảnh báo mềm; số server-side theo năm; VND-only, thuế theo line; Manager duyệt trước khi gửi; tạo Project qua nút có xác nhận Manager). Phase 6 được mở khóa.
