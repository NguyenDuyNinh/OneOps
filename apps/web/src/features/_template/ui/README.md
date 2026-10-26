# UI mẫu — copy, đừng import

Đây là **bộ UI đầy đủ** để copy vào module của bạn. Không file nào trong repo được import từ `_template`
(`scripts/check-boundaries.mjs` sẽ chặn).

```bash
# copy đúng cái bạn cần
cp apps/web/src/features/_template/ui/button/Button.tsx \
   apps/web/src/features/admin/orders/ui/Button.tsx

# hoặc copy cả nhóm form
cp -R apps/web/src/features/_template/ui/form \
      apps/web/src/features/admin/orders/ui/form
```

| Có gì | Đường dẫn |
|---|---|
| Alert, Badge | `alert/Alert.tsx`, `badge/Badge.tsx` |
| Button | `button/Button.tsx` |
| Avatar | `avatar/Avatar.tsx`, `avatar/AvatarText.tsx` |
| Dropdown | `dropdown/Dropdown.tsx`, `dropdown/DropdownItem.tsx` |
| Form | `form/` — Checkbox, InputField, Label, Select, MultiSelect, Radio, RadioSm, Switch, TextArea, FileInput, PhoneInput, Form, date-picker |
| Modal | `modal/index.tsx` (named export `Modal`) |
| Table | `table/index.tsx` (named export `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`) |
| Ảnh | `images/` |
| Video | `video/` |
| Khác | `PageBreadCrumb.tsx`, `GridShape.tsx`, `ComponentCard.tsx` |

## Vì sao copy mà không dùng chung

Một UI kit dùng chung = mọi thay đổi style đều chạm vào file của người khác → conflict + phải review chéo.
Copy thì:

- sửa `admin/users/ui/Button.tsx` **không** ảnh hưởng `auth/ui/Button.tsx` hay `employee/attendance/ui/Button.tsx`;
- 2 dev có thể cùng "sửa Button" mà không conflict;
- module tự do tiến hoá UI của mình (densities, màu, kích thước khác nhau).

**Đổi style toàn hệ thống** (màu brand, font, radius, spacing): sửa CSS variables / Tailwind tokens trong
`apps/web/src/app/globals.css` — đó là nơi duy nhất thực sự dùng chung.
