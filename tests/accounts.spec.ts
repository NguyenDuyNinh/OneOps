import { test, expect, admin } from "./fixtures";
const suffix = () => String(Date.now()).slice(-6);
test("accounts keep the last manager, history and password reset usable", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const tag = suffix();
  const managerName = `Phạm Quản Lý ${tag}`;
  const employeeName = `Đỗ Nhân Viên ${tag}`;

  await page.goto("/tenant-system/accounts");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Tài khoản và phân quyền",
  );

  const adminRow = page.getByRole("row").filter({ hasText: admin.displayName });
  await expect(adminRow).toContainText("Quản lý");
  await expect(adminRow).toContainText("Quản trị");
  await expect(adminRow).toContainText("Đang hoạt động");

  // The seeded account is the only manager, so demoting it must be refused.
  await adminRow
    .getByRole("button", { name: `Phân quyền ${admin.username}` })
    .click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Vai trò", { exact: true }).selectOption("EMPLOYEE");
  await dialog.getByRole("button", { name: "Lưu quyền truy cập" }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "Không thể bớt Quản lý cuối cùng của hệ thống.",
  );
  await dialog.getByRole("button", { name: "Hủy" }).click();
  await expect(dialog).toHaveCount(0);

  const create = async (
    username: string,
    displayName: string,
    role: string,
    systemAdmin: boolean,
  ) => {
    await page
      .locator("main")
      .getByRole("button", { name: "Thêm tài khoản", exact: true })
      .first()
      .click();
    const form = page.getByRole("dialog");
    await form.getByLabel("Tên đăng nhập").fill(username);
    await form.getByLabel("Tên hiển thị").fill(displayName);
    await form.getByLabel("Email").fill(`${username}@oneops.vn`);
    await form.getByLabel("Mật khẩu ban đầu").fill("mat-khau-01");
    await form.getByLabel("Vai trò", { exact: true }).selectOption(role);
    if (systemAdmin)
      await form.getByRole("checkbox", { name: /Quản trị hệ thống/ }).check();
    await form.getByRole("button", { name: "Tạo tài khoản" }).click();
    await expect(form).toHaveCount(0);
  };

  await create(`quan.ly.${tag}`, managerName, "MANAGER", false);
  let managerRow = page.getByRole("row").filter({ hasText: managerName });
  await expect(managerRow).toContainText("Quản lý");
  await expect(managerRow).toContainText("Đang hoạt động");
  await expect(managerRow).not.toContainText("Quản trị");

  await create(`nhan.vien.${tag}`, employeeName, "EMPLOYEE", false);
  let employeeRow = page.getByRole("row").filter({ hasText: employeeName });
  await expect(employeeRow).toContainText("Nhân viên");

  await employeeRow
    .getByRole("button", { name: `Phân quyền nhan.vien.${tag}` })
    .click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Vai trò", { exact: true }).selectOption("MANAGER");
  await dialog.getByRole("checkbox", { name: /Quản trị hệ thống/ }).check();
  await dialog.getByRole("button", { name: "Lưu quyền truy cập" }).click();
  await expect(dialog).toHaveCount(0);
  employeeRow = page.getByRole("row").filter({ hasText: employeeName });
  await expect(employeeRow).toContainText("Quản lý");
  await expect(employeeRow).toContainText("Quản trị");

  await managerRow
    .getByRole("button", { name: `Phân quyền quan.ly.${tag}` })
    .click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Vai trò", { exact: true }).selectOption("EMPLOYEE");
  await dialog.getByRole("button", { name: "Lưu quyền truy cập" }).click();
  await expect(dialog).toHaveCount(0);
  managerRow = page.getByRole("row").filter({ hasText: managerName });
  await expect(managerRow).toContainText("Nhân viên");

  await managerRow
    .getByRole("button", { name: `Lịch sử quyền quan.ly.${tag}` })
    .click();
  dialog = page.getByRole("dialog");
  const entries = dialog.getByRole("listitem");
  await expect(entries).toHaveCount(2);
  await expect(
    entries.filter({ hasText: "Vai trò: MANAGER → EMPLOYEE" }),
  ).toHaveCount(1);
  await expect(entries.filter({ hasText: "Tạo tài khoản" })).toHaveCount(1);
  await dialog.getByRole("button", { name: "Đóng", exact: true }).click();
  await expect(dialog).toHaveCount(0);

  await page
    .getByRole("row")
    .filter({ hasText: employeeName })
    .getByRole("button", { name: `Đặt lại mật khẩu nhan.vien.${tag}` })
    .click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Mật khẩu mới cho nhan.vien." + tag)
    .fill("mat-khau-02");
  await dialog.getByRole("button", { name: "Đặt lại mật khẩu" }).click();
  await expect(dialog).toHaveCount(0);

  await page.reload();
  await expect(
    page.getByRole("row").filter({ hasText: employeeName }),
  ).toContainText("Quản lý");

  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/tenant-system/accounts");
  await expect(page.locator("main h1")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.getByRole("button", { name: "Mở điều hướng" }).click();
  await expect(
    page
      .getByRole("navigation", { name: "Phân hệ", exact: true })
      .locator('a[aria-current="page"]'),
  ).toHaveCount(1);
  expect(errors).toEqual([]);
});
