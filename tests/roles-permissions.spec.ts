import { test, expect } from "./fixtures";
const SELF_KEY = "tenant-system/access-control/roles-permissions";
test("permission matrix saves an override, records history and fits mobile", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/tenant-system/roles-permissions");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Ma trận quyền theo chức năng",
  );
  const row = page
    .getByRole("table")
    .getByRole("row")
    .filter({ hasText: SELF_KEY });
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("Mặc định");
  const view = row.getByRole("checkbox", {
    name: "Xem Phân quyền của Nhân viên",
  });
  await expect(view).not.toBeChecked();
  // Quản trị hệ thống không thể tự gán quyền quản trị qua ma trận.
  await expect(row.getByRole("checkbox", { name: /Quản trị/ })).toHaveCount(0);
  await view.check();
  await expect(row).toContainText("Tùy chỉnh");
  await page.getByLabel("Lý do thay đổi").fill("Cho nhân viên xem ma trận");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await expect(
    page.getByText("Đã lưu ma trận quyền.", { exact: true }),
  ).toBeVisible();
  await expect(view).toBeChecked();
  await page.reload();
  const reloaded = page
    .getByRole("table")
    .getByRole("row")
    .filter({ hasText: SELF_KEY });
  await expect(
    reloaded.getByRole("checkbox", { name: "Xem Phân quyền của Nhân viên" }),
  ).toBeChecked();
  await expect(reloaded).toContainText("Tùy chỉnh");
  await page.locator("summary", { hasText: "Lịch sử thay đổi" }).click();
  await expect(
    page.getByText("Cho nhân viên xem ma trận", { exact: false }).first(),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/tenant-system/roles-permissions");
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
