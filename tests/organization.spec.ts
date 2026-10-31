import { test, expect } from "./fixtures";
const suffix = () => String(Date.now()).slice(-6);
test("organization keeps departments, teams and job titles usable on desktop and mobile", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const tag = suffix();
  const department = `Phòng Nhân sự ${tag}`;
  const team = `Nhóm Tuyển dụng ${tag}`;
  const position = `Chuyên viên ${tag}`;
  const grade = `Bậc 2 ${tag}`;

  await page.goto("/hr-management/organization");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Cơ cấu tổ chức",
  );
  await page
    .locator("main")
    .getByRole("button", { name: "Tạo phòng ban", exact: true })
    .first()
    .click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Mã phòng ban").fill(`HR-${tag}`);
  await dialog.getByLabel("Tên phòng ban").fill(department);
  await dialog.getByLabel("Trưởng phòng").fill("Nguyễn An");
  await dialog.getByRole("button", { name: "Tạo phòng ban" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: new RegExp(department) }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Tạo nhóm", exact: true })
    .first()
    .click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Mã nhóm").fill(`TEAM-${tag}`);
  await dialog.getByLabel("Tên nhóm").fill(team);
  await dialog.getByRole("button", { name: "Tạo nhóm" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText(team, { exact: true })).toBeVisible();

  const departmentCard = page
    .locator("li")
    .filter({ hasText: department })
    .first();
  await expect(departmentCard).toContainText("1 nhóm");
  await departmentCard.getByRole("button", { name: "Ngừng" }).click();
  dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("nhóm đang hoạt động");
  await expect(
    dialog.getByRole("button", { name: "Ngừng hoạt động" }),
  ).toBeDisabled();
  await dialog.getByRole("button", { name: "Hủy" }).click();

  const teamCard = page.locator("li").filter({ hasText: team }).first();
  await teamCard.getByRole("button", { name: "Ngừng" }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Ngừng hoạt động" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(teamCard).toContainText("Ngừng hoạt động");

  await departmentCard.getByRole("button", { name: "Ngừng" }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Ngừng hoạt động" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(departmentCard).toContainText("Ngừng hoạt động");

  await page.goto("/hr-management/positions");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Chức danh & cấp bậc",
  );
  await page
    .locator("main")
    .getByRole("button", { name: "Tạo chức danh", exact: true })
    .first()
    .click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Mã chức danh").fill(`POS-${tag}`);
  await dialog.getByLabel("Tên chức danh").fill(position);
  await dialog.getByRole("button", { name: "Tạo chức danh" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: new RegExp(position) }),
  ).toBeVisible();

  await page
    .locator("main")
    .getByRole("button", { name: "Tạo cấp bậc", exact: true })
    .first()
    .click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Mã cấp bậc").fill(`GRADE-${tag}`);
  await dialog.getByLabel("Tên cấp bậc").fill(grade);
  await dialog.getByLabel("Thứ tự").fill("2");
  await dialog.getByLabel("Chức danh").selectOption({ label: position });
  await dialog.getByRole("button", { name: "Tạo cấp bậc" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText(grade, { exact: true })).toBeVisible();
  await expect(page.getByText("Bậc 2", { exact: true })).toBeVisible();

  const currentModuleLink = page
    .getByRole("navigation", { name: "Phân hệ", exact: true })
    .locator('a[aria-current="page"]');
  for (const route of [
    "/hr-management/organization",
    "/hr-management/positions",
  ]) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(currentModuleLink).toHaveCount(1);

    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    await page.getByRole("button", { name: "Mở điều hướng" }).click();
    await expect(currentModuleLink).toHaveCount(1);
    await page.keyboard.press("Escape");
  }
  expect(errors).toEqual([]);
});
