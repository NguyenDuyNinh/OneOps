# Baseline triển khai — Phase 0

Cập nhật ngày 30/10/2026 từ `feature-structure.json`, cây source `apps/web/src/features`, `apps/api/src/features`, `modules.json` và các artifact thực tế. Tài liệu này là baseline kỹ thuật cho kế hoạch hoàn thiện OneOps; không phải tuyên bố tiến độ nghiệp vụ.

## 1. Kết quả đối chiếu 39 nhánh

| Trạng thái source | Số nhánh | Ý nghĩa                                                                                      |
| ----------------- | -------: | -------------------------------------------------------------------------------------------- |
| FE + BE           |        7 | Có source cả hai phía; vẫn có thể thiếu quy tắc, quyền, dữ liệu chuẩn hóa và kiểm thử        |
| FE-only           |        2 | `task-comments`, `kanban`; là view/integration qua public export, không sở hữu vòng đời Task |
| BE-only           |        0 | Không có implementation giả                                                                  |
| Trống             |       30 | Chưa có source; không tính là hoàn thành chỉ vì thư mục tồn tại                              |

Hai implementation lồng dưới `workspace-today` là `calendar` và `reports`, không cộng thêm vào 39 nhánh. `modules.json` hiện có 9 record dữ liệu.

### Nhánh đã có source

| Nhánh                                            |      FE |      BE | Khoảng trống chính                                                                                                                          |
| ------------------------------------------------ | ------: | ------: | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `work-management/work/tasks`                     | 17 file |  7 file | Bốn trạng thái tiếng Việt, assignee/reviewer là chuỗi, comments/checklist trong JSON, chưa có state machine đủ 7 trạng thái và 9 transition |
| `work-management/coordination/notifications`     | 13 file |  8 file | Có persistence, REST và SSE; fan-out đang in-process, chưa có outbox bền vững, replay và định danh người nhận theo ID                       |
| `work-management/coordination/internal-chat`     | 17 file |  7 file | CRUD chủ đề/bình luận; chưa có thành viên, quyền quản trị nhóm, chat trực tiếp và realtime                                                  |
| `work-management/coordination/workspace-today`   | 51 file | 21 file | Dashboard tổng hợp, Calendar và Reports; Reports còn dùng trường tiến độ/giá trị nhập tay                                                   |
| `work-management/coordination/tickets-approvals` | 17 file |  7 file | CRUD và đổi status; chưa có luồng phê duyệt; category Nghỉ phép đang sai phạm vi                                                            |
| `work-management/coordination/knowledge-sop`     | 17 file |  7 file | Ghi chú cơ bản; chưa có SOP phiên bản/review/publish                                                                                        |
| `work-management/projects/project-spaces`        | 17 file |  7 file | CRUD project/member/progress nhập tay; chưa có Backlog, Sprint, Story Points, rollover                                                      |

### Nhánh FE-only

| Nhánh                                | Vai trò                                 | Ràng buộc                                                         |
| ------------------------------------ | --------------------------------------- | ----------------------------------------------------------------- |
| `work-management/work/kanban`        | Hiển thị/thao tác Task qua callback     | Không có API, model hay repository riêng                          |
| `work-management/work/task-comments` | Hiển thị/soạn comment trong Task detail | Dữ liệu hiện nằm trong JSON của Task, chưa có persistence độc lập |

Hai ngoại lệ này đã được checker cho phép qua public `index.ts`. Không mở rộng thành import nội bộ hoặc thêm nguồn dữ liệu Task thứ hai.

## 2. Baseline định danh và dữ liệu

- `WorkTask` và `WorkProject` dùng `assignee` dạng chuỗi, `scope` dạng chuỗi và `fields` JSON. Không được suy đoán Account/Team/Project ID từ chuỗi hiển thị.
- `WorkTask` đang lưu comment, checklist, người kiểm tra và metadata khác trong `fields`. Chuyển đổi phải theo expand → backfill → verify → contract, giữ dữ liệu gốc đến khi kiểm tra số lượng và API/E2E đạt.
- Chưa có model Account, Employee, Department, Team, Attendance, Leave, CRM, Sprint, Outbox hoặc Job. Không có migration mới nào được tạo trong Phase 0.
- `packages/database/prisma/schema/features` là symlink tới `apps/api/src/features`; không thay bằng bản sao.
- Các namespace hiện có chỉ thuộc Work. `base.prisma` phải được mở rộng cùng lúc với model mới và registry, không chứa model nghiệp vụ.

## 3. Baseline realtime và side effect

- `NotificationEvents` dùng RxJS `Subject` trong một process. Comment nguồn đã ghi rõ giới hạn khi API chạy nhiều instance.
- `NotificationStream` lọc theo `recipient` chuỗi và gửi heartbeat 25 giây.
- Task, Calendar và Internal Chat phát notification sau thao tác nghiệp vụ nhưng chưa có transactional outbox, retry, dead-letter hoặc replay bằng `Last-Event-ID`.
- Chưa có scheduler bền vững cho reminder, auto-close, digest hoặc Sprint alert.

## 4. Baseline giao diện

- UI dùng Next.js App Router, Tailwind 4, Radix và bộ 187 design token; có bốn profile light/dark × comfortable/compact.
- Phần lớn feature hiện tại sao chép primitive vào `components/primitives` của chính feature. Đây là convention bắt buộc, không chuyển thành shared business UI.
- `docs/DESIGN-SYSTEM.md` mô tả catalog rộng hơn mức hoàn thiện nghiệp vụ. Các màn hình hiện có chưa chứng minh đầy đủ trạng thái loading/empty/error, direct-URL denial, keyboard và mobile.
- Phase 0 chốt contract thiết kế tại `docs/UX-DESIGN-CONTRACT.md`; không sửa token hoặc generated output.

## 5. Xung đột tài liệu đã chốt

| Chủ đề      | Quyết định baseline                                                                  |
| ----------- | ------------------------------------------------------------------------------------ |
| Remote      | Nhân viên chọn `REMOTE` khi check-in; không tạo đơn Remote riêng                     |
| Tạo Project | Chỉ `MANAGER`; việc là thành viên truy cập Department không tự cấp quyền tạo Project |
| Thông báo   | Không xóa/không coi là trống; mở rộng implementation hiện có                         |
| Xóa dữ liệu | Zero hard-delete; chỉ xóa aggregate mới tạo nhầm và chưa có dữ liệu liên kết         |
| Role        | Chỉ `EMPLOYEE` và `MANAGER`; quản trị cấp cao là `MANAGER` + `is_system_admin`       |
| Job title   | Thuộc hồ sơ nhân viên, không cấp quyền                                               |

Các xung đột còn lại phải được ghi trong specification tương ứng và không được tự quyết khi triển khai.

## 6. Cách tái lập baseline

Các lệnh đã dùng là lệnh chỉ đọc hoặc kiểm tra cấu trúc:

```sh
git status --short
npm run architecture:check
npm run unused:check
npm run tokens:check
```

Kết quả kiểm tra của từng lần bàn giao phải được ghi lại cùng ngày chạy. Việc một checker đạt chỉ chứng minh cấu trúc/import hợp lệ, không chứng minh nghiệp vụ đúng hoặc đủ acceptance criteria.

## 7. Gate Phase 0 — kết quả chạy ngày 30/10/2026

| Lệnh                         | Kết quả                       | Ghi chú                                                                       |
| ---------------------------- | ----------------------------- | ----------------------------------------------------------------------------- |
| `npm run architecture:check` | Đạt                           | 4 main group, 39 nhánh, 9 implementation dữ liệu, 9 model sở hữu              |
| `npm run test:architecture`  | Đạt 11/11                     | Kiểm tra registry đa model/schema và đối chiếu `base.prisma`                  |
| `npm run unused:check`       | Đạt                           | 290 source file reachable                                                     |
| `npm run tokens:check`       | Đạt                           | 187 token, 10 file sinh                                                       |
| `npm run test:tokens`        | Đạt 5/5                       | Bốn profile và contrast 4.5                                                   |
| `npm run typecheck`          | Đạt                           | api, web, database                                                            |
| `npm run lint`               | Đạt                           | Không có lỗi                                                                  |
| `npm run build`              | Đạt                           | Next.js 16.4.3, 14 route tĩnh/động                                            |
| `npm run format:check`       | **Không đạt (tồn tại trước)** | 283 file chưa được format trong baseline; các file thay đổi ở Phase 0 đều đạt |

`format:check` là nợ định dạng có sẵn của repository, không phát sinh từ thay đổi Phase 0. Không tự format toàn repo theo `AGENTS.md`; cần một package riêng nếu muốn chuẩn hóa.

## 8. Registry đa model/schema

`scripts/module-registry.mjs` chuẩn hóa `model`/`schema` (một giá trị) và `models`/`schemas` (mảng) về cùng một danh sách sở hữu. `scripts/check-boundaries.mjs` dùng danh sách này để:

- kiểm tra mọi file schema thuộc record đều tồn tại và khai báo đúng `@@schema`;
- cho phép repository dùng delegate của bất kỳ model nào record sở hữu;
- từ chối khai báo trùng namespace, route, model, schema và cấm khai báo đồng thời dạng đơn và dạng mảng.

Không record nào trong `modules.json` được thêm model giả; tính năng chỉ được dùng khi package thực sự sở hữu nhiều model.

Từ Phase 1, mỗi record khai báo thêm `kind` để checker và test biết hình dạng API:

| `kind`               | Ý nghĩa                                               | Kiểm tra                           |
| -------------------- | ----------------------------------------------------- | ---------------------------------- |
| `records` (mặc định) | API CRUD generic trên bảng `records` của schema riêng | Test CRUD dùng chung               |
| `resource`           | API nghiệp vụ riêng, bảng theo model sở hữu           | Test integration riêng của package |

Record `resource` không cần bảng `records`. `apps/api/test/database.mjs` dọn dữ liệu bằng cách liệt kê bảng thật của các schema đã đăng ký, nên hai loại record dùng chung được một database test.

## 9. Phê duyệt và mở khoá Phase

Ngày 30/10/2026, người dùng duyệt toàn bộ phương án mặc định của năm specification và cho phép bắt đầu Phase 1. Trạng thái phê duyệt và quyết định đã chốt được ghi tại `docs/specifications/README.md`; mục 9 này chỉ còn giá trị lịch sử của Phase 0.

Phase 1 bắt đầu với hai package HR: `hr-management/organization/departments-teams` và `hr-management/organization/positions-grades`. Nhật ký bàn giao, migration và kết quả gate nằm ở mục 9 của `docs/IMPLEMENTATION-CONTRACTS.md`.
