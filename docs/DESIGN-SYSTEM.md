# OneOps UI — Tailwind Design System

## Phạm vi

Bộ UI/UX hiện tại được giữ khi chuyển sang hệ thống quản lý công việc OneOps. Ví dụ nội dung đã được đổi sang công việc, dự án và đội nhóm. Thư viện hoạt động tại `/design-system`, có **56 mục nền tảng, thành phần và mẫu nghiệp vụ** trong 8 nhóm. Con số này là số mục trong catalog, không phải 56 component React độc lập.

| Nhóm | Nội dung |
| --- | --- |
| Nền tảng | Brand palette 50–900, màu ngữ nghĩa, Inter, spacing, radius, elevation, icon |
| Thao tác | Button 6 biến thể / 4 kích thước, loading, disabled, icon button, badge, avatar, tooltip |
| Biểu mẫu | Input, textarea, select, date, Field, search, combobox, multi-select, checkbox, radio, switch, slider, chọn tệp |
| Điều hướng | Breadcrumb, tabs bàn phím, accordion, pagination, stepper, timeline |
| Phản hồi | 4 loại alert, toast, progress, spinner, skeleton, empty và error state |
| Lớp tương tác | Dialog, xác nhận, sheet, dropdown, popover |
| Dữ liệu | Bảng generic: tìm kiếm, sắp xếp, chọn hàng, ẩn cột, phân trang, xuất CSV; stat card |
| Mẫu nghiệp vụ | Form có validation, chi tiết bên phải, bộ lọc, luồng phê duyệt thử và nhật ký |

## Kiến trúc

- **Tailwind CSS 4** qua `@tailwindcss/postcss`, chỉ quét `src/`; dùng `@theme inline` và biến CSS ngữ nghĩa.
- **Radix Primitives** cung cấp hành vi keyboard/focus cho dialog, sheet, dropdown, popover, checkbox, tabs, switch, radio, slider, tooltip và progress.
- `class-variance-authority` quản lý biến thể Button/Badge; `clsx` và `tailwind-merge` ghép và xử lý class override.
- `apps/web/src/features/<main>/<group>/<feature>/components/primitives/`: primitive riêng của module đang cần dùng; import trực tiếp, không có barrel UI dùng chung.
- Shell có primitive riêng trong `core/ui/primitives/`; catalog có bản riêng tại `core/ui/design-system/ui/primitives/`.
- `apps/web/src/core/ui/design-system/ui/`: màn catalog và các ví dụ tương tác.
- `apps/web/src/core/ui/design-system/schema/catalog.ts`: danh mục và số lượng mục được tính tự động.
- `apps/web/src/features/<main>/<group>/<feature>/constants.ts`: cấu trúc cột/danh mục đã quan sát từ nguồn trực tiếp.
- CSS layout của bản chuyển đổi nằm trong `@layer components`; utility Tailwind có thể override. Các control, modal, bảng và dashboard mới dùng token CSS toàn ứng dụng và component do từng module sở hữu.
- Dùng bundler Webpack được Next.js hỗ trợ cho dev/build; tránh lỗi mở cổng worker của Turbopack/PostCSS trong môi trường sandbox.

## Design tokens

| Vai trò | Light | Dark |
| --- | --- | --- |
| Brand 500 | `#f06000` | Giữ palette |
| Action | `#bd4600` | `#ffad6b` |
| Action text | `#ffffff` | `#39200b` |
| Surface | `#ffffff` | `#141f30` |
| Canvas | `#f6f8fb` | `#0d1522` |
| Foreground | `#00204d` | `#e8eef8` |
| Muted text | `#52647d` | `#abbcd2` |
| Border | `#dfe5ee` | `#2a3a51` |

Màu thương hiệu vẫn dùng ở header, logo và nút tạo. Action trên nền sáng dùng cam đậm hơn nhằm tăng độ tương phản của chữ trắng. Màu trạng thái luôn có nhãn, không chỉ dựa vào màu.

Token nằm ở `apps/web/src/app/styles/tokens.css`. Ví dụ utility: `bg-surface`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`, `border-border`, `rounded-control`, `rounded-panel`.

Mật độ **thoáng**: control 40px, hàng bảng 56px, panel padding 24px. Mật độ **gọn**: control 34px, hàng bảng 44px, panel padding 16px. Nút nhỏ và icon giữ kích thước riêng phù hợp ngữ cảnh.

Sáng/tối và mật độ lưu ở `localStorage["etctha.ui-preferences.v1"]`, áp dụng xuyên suốt ứng dụng. Có thể đổi trong thanh điều khiển thư viện hoặc menu tài khoản. Nút xuất tokens tải JSON theo theme/density hiện tại.

## Ví dụ tái sử dụng

```tsx
import { Button, Field, Input, Badge } from "@/components/ui";

<Field label="Số quyết định" required error={error}>
  {(props) => <Input {...props} name="code" required />}
</Field>
<Button loading={saving} type="submit">Lưu hồ sơ</Button>
<Badge variant="success" dot>Thi hành xong</Badge>
```

```tsx
<MultiSelect
  options={caseKinds}
  value={selectedKinds}
  onValueChange={setSelectedKinds}
  placeholder="Chọn loại án"
/>
```

Form danh mục dùng ID tự sinh để liên kết label, hint và lỗi với input. Multi-select có tìm kiếm, chọn nhiều, chip xóa từng giá trị, bỏ chọn tất cả; danh sách hỗ trợ phím lên/xuống/Home/End. Dialog khóa focus, Escape đóng; modal mở bằng state trả focus về phần tử trước đó.

## Bảng và bộ lọc nghiệp vụ

- Hồ sơ: giữ 28 trường dữ liệu nguồn + STT = **29 cột nghiệp vụ**. Checkbox và hành động là cột UI bổ sung.
- Chế độ xem: Tổng quan, Tiền & tài sản, Bản án & quyết định, tất cả; có tùy chọn từng cột.
- Vùng bảng cuộn riêng; header, checkbox và hành động được giữ cố định.
- Bộ lọc hồ sơ: chọn nhiều loại quyết định, loại án, giai đoạn THA, tình trạng THA; ba khoảng ngày độc lập và trường chấp hành viên bổ sung.
- Form cục bộ bổ sung trường theo schema; phần nhóm dùng `details` để giảm tải thị giác. Các trường chưa nhập hiển thị “—”, không tự tạo thông tin.
- Chi tiết theo 3 tab; tiền định dạng `vi-VN`. “Còn lại” của dữ liệu thử nghiệm tính từ Phải thu − Đã thu khi hai giá trị có mặt và không nhập giá trị còn lại riêng. Không coi đây là công thức nghiệp vụ đầy đủ của hệ thống gốc.
- Tài liệu, sổ, ủy thác, trục liên thông, VNeID, thông tin đương sự có schema riêng đã quan sát. Những màn nguồn không trả nội dung được ghi rõ trong audit.

## Giới hạn

Các ví dụ thư viện dùng dữ liệu minh họa. Chọn tệp chỉ đọc metadata cục bộ, chưa upload. Luồng phê duyệt, toast và retry là minh họa tương tác, không tác động hồ sơ thật. Các thao tác nghiệp vụ nay đi qua API NestJS và PostgreSQL; xem `ARCHITECTURE.md`. Chưa nối SSO/phân quyền server.

Thiết kế hướng tới tương phản và khả năng dùng bàn phím; chưa tuyên bố chứng nhận WCAG cho toàn sản phẩm. Font Inter và tài nguyên nhận diện được giữ từ ZIP.

Tài liệu tham chiếu: [Tailwind + Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs), [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction), cùng guide CSS và CLI trong package Next.js đang cài.
