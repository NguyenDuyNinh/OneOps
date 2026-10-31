# Specification Knowledge và SOP — APPROVED

**Trạng thái:** APPROVED ngày 30/10/2026. Người dùng chấp nhận toàn bộ phương án đánh dấu “(đề xuất)” làm quyết định triển khai. Thay đổi sau phê duyệt phải cập nhật version, acceptance mapping và test.

## 1. Hiện trạng cần tôn trọng

`knowledge-sop` đã được đăng ký trong `modules.json` với model `WorkNote` và namespace `work_notes` (route `notes`, web route `/work-management/knowledge-sop`). Đây là implementation đã có, **không phải** nhánh trống.

Vì vậy mọi thay đổi phải theo hướng mở rộng tương thích:

- Không đổi tên model `WorkNote`, không đổi namespace `work_notes`, không đổi route/webRoute trong cùng một migration.
- Chỉ thêm bảng/cột/index hoặc thêm model mới trong cùng namespace, theo trình tự expand → backfill → verify → contract tại `docs/IMPLEMENTATION-CONTRACTS.md`.
- Dữ liệu note hiện có phải đọc được sau khi mở rộng; không yêu cầu nhập lại.

## 2. Mục tiêu

Biến ghi chú nội bộ hiện có thành kho tri thức vận hành có vòng đời rõ ràng: bài viết/SOP có phiên bản, người soạn, người duyệt, phạm vi hiển thị, tìm kiếm và lưu trữ.

### 2.1 Hai loại nội dung

| Loại | Mục đích | Vòng đời |
| --- | --- | --- |
| `NOTE` | Ghi chú nhanh trong ngữ cảnh công việc, có thể gắn Task/Project | Tạo → sửa → lưu trữ |
| `ARTICLE` / `SOP` | Hướng dẫn/quy trình chuẩn cần duyệt và tra cứu lâu dài | DRAFT → IN_REVIEW → PUBLISHED → ARCHIVED |

Phân biệt bằng trường `kind` trên thực thể, không tạo hai feature.

## 3. Thực thể đề xuất

- **KnowledgeItem** (mở rộng từ `WorkNote`): `kind`, `title`, `slug?`, `summary`, `body`, `status`, `visibilityScope`, `ownerId`, `departmentId?`, `teamId?`, `version`, `publishedAt`, `archivedAt`.
- **KnowledgeVersion:** snapshot bất biến của nội dung khi publish; giữ `versionNo`, người tạo, thời điểm, khác biệt tóm tắt.
- **KnowledgeAttachment:** file/link đính kèm; allowlist loại file, giới hạn 50 MB.
- **KnowledgeLink:** liên kết tới Task/Project/Department (scalar ID) để truy xuất nguồn gốc.
- **KnowledgeReview:** người review, quyết định `APPROVED` | `CHANGES_REQUESTED`, lý do.

Quan hệ với các feature khác chỉ bằng scalar ID; không đọc bảng của Tasks/Projects.

## 4. Quy tắc nghiệp vụ

- `visibilityScope` thuộc một trong: `PRIVATE`, `TEAM`, `DEPARTMENT`, `COMPANY`. Mặc định `TEAM`.
- Người đọc chỉ thấy item có scope bao phủ quan hệ của mình; kiểm tra ở service, không chỉ ở UI.
- Chỉ `MANAGER` (trong scope) hoặc System Admin publish/archive `ARTICLE`/`SOP`.
- Không tự duyệt bài do chính mình soạn nếu policy yêu cầu hai người; xem quyết định mở.
- `PUBLISHED` tạo `KnowledgeVersion` bất biến. Sửa nội dung sau publish tạo bản `DRAFT` mới, không sửa version đã publish.
- `ARCHIVED` vẫn đọc được với người có quyền nhưng không xuất hiện trong kết quả tìm kiếm mặc định.
- Không hard-delete item đã publish hoặc đã có version; chỉ archive.
- Xóa cứng chỉ cho `NOTE` ở trạng thái nháp, chưa chia sẻ, chưa có liên kết.
- Mọi publish/archive/đổi scope ghi audit: ai, khi nào, scope trước/sau.
- Nội dung body lưu dạng văn bản an toàn; render phải chống XSS, không cho nhúng script/iframe tùy ý.
- Tìm kiếm chỉ trả item trong scope; không rò rỉ tiêu đề của item ngoài quyền qua gợi ý tìm kiếm.
- Liên kết tới Task/Project không cấp quyền đọc Task/Project; người đọc bài vẫn phải có quyền mở đích.

## 5. UI/UX

- Danh sách: tìm kiếm, lọc theo loại/scope/trạng thái/owner, sắp xếp theo cập nhật; kết quả nêu rõ scope đang áp dụng.
- Trang đọc: mục lục cho nội dung dài, ngày publish, phiên bản, người duyệt, nút “Xem phiên bản cũ”.
- Trình soạn: chế độ xem trước, lưu nháp tự động có chỉ báo, cảnh báo khi rời trang còn thay đổi chưa lưu.
- Luồng duyệt: hàng đợi `IN_REVIEW`, hiển thị khác biệt so với bản publish trước, nút Approve/Request changes bắt buộc lý do khi từ chối.
- Trạng thái bắt buộc theo `docs/UX-DESIGN-CONTRACT.md`, đặc biệt: filtered empty, forbidden, conflict (bản đã bị người khác publish), long content.
- Mobile: đọc tốt một cột; soạn thảo cho phép nhưng không bắt buộc đầy đủ tính năng.

## 6. Acceptance tối thiểu

1. Note cũ vẫn đọc/sửa được sau migration, không mất nội dung.
2. Publish tạo version bất biến; sửa sau publish không thay đổi version đã publish.
3. Người ngoài scope không đọc được item `PRIVATE`/`TEAM`/`DEPARTMENT` qua ID, API hay tìm kiếm.
4. Employee không publish/archive được `ARTICLE`/`SOP`.
5. Archive không xóa dữ liệu và không phá liên kết lịch sử.
6. Nội dung độc hại bị loại bỏ khi render; test XSS tương ứng đạt.
7. Không có đường đọc chéo scope qua gợi ý tìm kiếm hoặc đếm kết quả.

## 7. Quyết định mở cần phê duyệt

1. **Mô hình nội dung:** mở rộng `WorkNote` bằng `kind` (đề xuất) hay tách model `KnowledgeArticle` riêng trong cùng namespace?
2. **Phạm vi hiển thị:** bốn mức PRIVATE/TEAM/DEPARTMENT/COMPANY (đề xuất) hay chỉ PRIVATE/COMPANY?
3. **Duyệt bài:** bắt buộc hai người (soạn ≠ duyệt) hay Manager tự publish được?
4. **Ai được soạn SOP:** mọi Manager trong scope, hay chỉ người được cấp quyền soạn thảo?
5. **Liên kết công việc:** có cần gắn SOP với Task/Project và hiển thị trong Task detail không?
6. **Tìm kiếm:** full-text trên tiêu đề + nội dung (đề xuất), có cần tìm trong file đính kèm?
7. **Phiên bản:** giữ bao nhiêu phiên bản và có cần so sánh trực quan (diff)?
8. **Nháp tự động:** lưu nháp phía server hay chỉ giữ ở client đến khi bấm lưu?

Đã phê duyệt ngày 30/10/2026: mở rộng `WorkNote` bằng `kind`; bốn mức hiển thị PRIVATE/TEAM/DEPARTMENT/COMPANY; bắt buộc hai người duyệt (soạn ≠ duyệt); mọi Manager trong scope được soạn SOP; SOP gắn được với Task/Project; full-text trên tiêu đề và nội dung; giữ toàn bộ phiên bản kèm diff; lưu nháp phía server. Phần mở rộng được mở khóa.
