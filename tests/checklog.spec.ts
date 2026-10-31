import { test, expect } from "./fixtures";

const SELF_KEY = "tenant-system/access-control/roles-permissions";

test("system log records a permission change, filters it and opens the detail", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  // Nothing written yet: the page explains the invariant instead of a table.
  await page.goto("/tenant-system/checklog");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Nhật ký hệ thống",
  );
  await expect(page.getByText("Chưa có bản ghi nhật ký nào.")).toBeVisible();

  // Produce one entry through the matrix page; the sink commits it with the change.
  await page.goto("/tenant-system/roles-permissions");
  const row = page
    .getByRole("table")
    .getByRole("row")
    .filter({ hasText: SELF_KEY });
  await row
    .getByRole("checkbox", { name: "Xem Phân quyền của Nhân viên" })
    .check();
  await page.getByLabel("Lý do thay đổi").fill("Cho nhân viên xem ma trận");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await expect(
    page.getByText("Đã lưu ma trận quyền.", { exact: true }),
  ).toBeVisible();

  await page.goto("/tenant-system/checklog");
  const entry = page
    .getByRole("table")
    .getByRole("row")
    .filter({ hasText: "Cập nhật quyền EMPLOYEE" });
  await expect(entry).toHaveCount(1);
  await expect(entry).toContainText(SELF_KEY);
  await expect(entry).toContainText("Quản Trị Gốc");
  await expect(entry).toContainText("Thành công");
  await expect(page.getByText("1 trên 1 bản ghi")).toBeVisible();

  await entry.getByRole("button", { name: "Xem" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Cho nhân viên xem ma trận");
  await expect(dialog).toContainText("RolePermission · EMPLOYEE");
  await expect(dialog).toContainText('"actions": []');
  await expect(dialog).toContainText('"view"');
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  // A search with no match shows the filtered empty state; reset restores it.
  await page.getByLabel("Tìm trong nhật ký").fill("khong-ton-tai");
  await expect(
    page.getByText("Không có bản ghi phù hợp với bộ lọc."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Xóa bộ lọc" }).click();
  await expect(entry).toHaveCount(1);

  // The mobile layout keeps the same rows without horizontal overflow.
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/tenant-system/checklog");
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.getByText("Cập nhật quyền EMPLOYEE").first()).toBeVisible();
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
