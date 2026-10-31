# Xác minh hệ thống OneOps

Tài liệu ghi nhận kết quả kiểm định chất lượng qua các mốc phát triển.

---

## 1. Mốc xác minh toàn diện — 31/10/2026

- **Ranh giới phân hệ & Cấu trúc (`architecture:check`):**
  - **4 nhóm chính, 39 thư mục đối xứng FE/BE**.
  - **20 chức năng dữ liệu hoàn chỉnh** (9 Record APIs, 11 Resource APIs).
  - **30 owned Prisma models** được liên kết hợp lệ thông qua multi-schema database federation.
  - Các phần chưa triển khai (`crm`, `attendance`, `leaves`, `work-policies`, `company-profile`, `automation-hub`) tiếp tục được giữ trống sạch sẽ.
- **Phân tích mã nguồn mồ côi (`unused:check`):**
  - Toàn bộ **540 source files** đều có thể truy vết hợp lệ từ application entrypoints.
- **Hệ thống Design Tokens (`tokens:check` & `test:tokens`):**
  - **187 semantic design tokens** được kiểm định nghiêm ngặt qua 10 tệp dẫn xuất; đảm bảo tỷ lệ tương phản màu sắc và cấu trúc token.
- **Kiểm tra kiểu dữ liệu tĩnh (`typecheck`):**
  - Đạt **0 lỗi** (TypeScript clean) trên toàn bộ monorepo (`@oneops/api`, `@oneops/web`, `@oneops/database`).
- **Quy chuẩn mã nguồn (`lint`):**
  - Đạt **0 lỗi** ESLint trên toàn bộ các workspace.
- **Kiểm thử tích hợp API (`test:api`):**
  - **22/22 test suites đạt**, bao gồm: xác thực phiên, tạo tài khoản, phân quyền RBAC, nhật ký kiểm toán, sơ đồ tổ chức phòng ban, chức danh, nhân sự, máy trạng thái công việc (TR-02..TR-09), bình luận, mốc tiến độ & cổng QA Gate, chấm công 15 phút, và trung tâm thông báo thời gian thực SSE kèm cơ chế xóa mềm.
- **Production Build (`build`):**
  - Biên dịch thành công gói backend `@oneops/api` và frontend `@oneops/web` (23 Next.js routes).

---

## 2. Các mốc xác minh trước đó

### Mốc 30/10/2026 — Xóa code company-profile và bỏ audit-backups

- Còn 39 chức năng cấu trúc và 8 implementation dữ liệu. `company-profile` và `departments-teams` không có file implementation ở cả FE/BE; `departments-teams` được xác định là quản lý phòng ban.
- `audit-backups` đã bị gỡ và không được `structure:prepare` tạo lại. Menu, form, API `/teams`, route `/tenant-system/company-profile` và redirect `/teams` đã gỡ.
- Test API xác nhận `/teams` trả 404; browser test kiểm tra cả `/teams` và `/tenant-system/company-profile` trả 404.

### Mốc 29/10/2026 — Phân bổ theo file cấu trúc ban đầu

- Chuyển đổi mã nguồn sang 4 main groups và 39 thư mục chức năng con đối xứng FE/BE.
- Di chuyển các tính năng công việc cũ sang cấu trúc mới, thiết lập Design System và bộ kiểm tra ranh giới ban đầu.
