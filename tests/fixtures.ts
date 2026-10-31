import { test as base, expect } from "@playwright/test";
import { cleanDatabase } from "../apps/api/test/database.mjs";

// Every spec runs against a signed-in tenant: the first account bootstraps the
// system, then changes its own password so the forced-change gate is cleared.
export const admin = {
  username: "quan.tri.goc",
  displayName: "Quản Trị Gốc",
  password: "mat-khau-goc-1",
  changed: "mat-khau-goc-2",
  employeeCode: "EMP-00",
  email: "quan.tri.goc@oneops.vn",
};

export const test = base.extend<{ databaseClean: void }>({
  databaseClean: [
    async ({ page }, use) => {
      await cleanDatabase();
      const created = await page.request.post("/api/v1/accounts", {
        data: {
          username: admin.username,
          displayName: admin.displayName,
          email: admin.email,
          employeeCode: admin.employeeCode,
          role: "MANAGER",
          isSystemAdmin: true,
          password: admin.password,
          actorName: admin.displayName,
        },
      });
      if (!created.ok())
        throw new Error(
          `Không tạo được tài khoản quản trị cho kiểm thử: ${await created.text()}`,
        );
      const signed = await page.request.post("/api/v1/auth/login", {
        data: { username: admin.username, password: admin.password },
      });
      if (!signed.ok())
        throw new Error(
          `Không đăng nhập được cho kiểm thử: ${await signed.text()}`,
        );
      const changed = await page.request.post("/api/v1/auth/password", {
        data: {
          currentPassword: admin.password,
          newPassword: admin.changed,
        },
      });
      if (!changed.ok())
        throw new Error(
          `Không đổi được mật khẩu ban đầu: ${await changed.text()}`,
        );
      await use();
    },
    { auto: true },
  ],
});
export { expect };
