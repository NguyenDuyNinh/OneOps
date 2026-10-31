import { test, expect } from "./fixtures";
const suffix = () => String(Date.now()).slice(-6);
test("employee directory keeps profile fields when status and name change", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const tag = suffix();
  const name = `Nguyễn An ${tag}`;
  const renamed = `Nguyễn An Bình ${tag}`;

  await page.goto("/hr-management/employees");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Danh bạ nhân sự",
  );
  await page
    .locator("main")
    .getByRole("button", { name: "Thêm nhân viên", exact: true })
    .first()
    .click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Mã nhân viên").fill(`EMP-${tag}`);
  await dialog.getByLabel("Họ và tên").fill(name);
  await dialog.getByLabel("Email").fill(`an.${tag}@oneops.vn`);
  await dialog.getByLabel("Chức danh").fill("Developer");
  await dialog.getByLabel("Phòng ban").fill("Phòng Nhân sự");
  await dialog.getByLabel("Nhóm").fill("Nhóm Tuyển dụng");
  await dialog.getByLabel("Ngày vào làm").fill("2026-01-15");
  await dialog.getByRole("button", { name: "Thêm nhân viên" }).click();
  await expect(dialog).toHaveCount(0);

  const row = page.getByRole("row").filter({ hasText: name });
  await expect(row).toContainText("Đang làm việc");
  await expect(row).toContainText("Phòng Nhân sự");

  await row.getByRole("button", { name: "Sửa", exact: true }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Họ và tên").fill(renamed);
  await dialog.getByRole("button", { name: "Lưu thay đổi" }).click();
  await expect(dialog).toHaveCount(0);

  const renamedRow = page.getByRole("row").filter({ hasText: renamed });
  await expect(renamedRow).toContainText("Developer");
  await expect(renamedRow).toContainText("Nhóm Tuyển dụng");
  await expect(renamedRow).toContainText("Vào làm 15/01/2026");

  await page.getByLabel("Lọc trạng thái").selectOption("INACTIVE");
  await expect(page.getByRole("row").filter({ hasText: renamed })).toHaveCount(
    0,
  );
  await page.getByLabel("Lọc trạng thái").selectOption("ALL");

  await renamedRow.getByRole("button", { name: "Cho nghỉ" }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Cho nghỉ việc" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("row").filter({ hasText: renamed }),
  ).toContainText("Đã nghỉ việc");

  await page.reload();
  await expect(
    page.getByRole("row").filter({ hasText: renamed }),
  ).toContainText("Đã nghỉ việc");

  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/hr-management/employees");
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
