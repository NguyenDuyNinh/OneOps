## Mô tả

<!-- Ngắn gọn: màn hình/module nào, giải quyết việc gì -->

## Phạm vi (chọn đúng 1)

- [ ] `features/admin/<module>` — màn hình quản trị
- [ ] `features/employee/<module>` — màn hình nhân viên
- [ ] `apps/api/src/modules/<module>` + `prisma/schema/<module>.prisma`
- [ ] Hạ tầng dùng chung (`features/auth`, `admin/app-shell`, `platform`, `database`) — **cần owner review**

## Checklist

- [ ] PR chỉ chạm module của tôi (không sửa file của module khác)
- [ ] `pnpm verify` xanh (nav:gen + ranh giới + typecheck)
- [ ] Không sửa `features/*/navigation/generated.ts` / `dist` / `.next`
- [ ] Không format lại file không liên quan
- [ ] Nếu thêm màn hình: đã thêm `features/<surface>/<module>/nav.tsx` (không sửa file nav chung)
- [ ] Nếu cần component UI: đã **copy** từ `features/_template/ui/` vào `<module>/ui/` (không import UI của module khác)
- [ ] Nếu đổi contract API: đã sửa **cả** `types.ts` của bề mặt admin **và** employee đang dùng endpoint đó
- [ ] Nếu thêm bảng: chỉ sửa đúng `prisma/schema/<module>.prisma` và đã chạy `pnpm db:generate`

## Ảnh chụp màn hình (nếu là UI)
