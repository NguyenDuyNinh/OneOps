import { test, expect } from "./fixtures";
const routes = [
  "home",
  "tasks",
  "projects",
  "calendar",
  "requests",
  "messages",
  "notes",
  "reports",
];
test("all work modules render, former modules return 404 and UI fits mobile", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of routes) {
    expect((await page.goto("/" + route))?.status()).toBe(200);
    await expect(page.locator("main h1")).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator("img")
          .evaluateAll((images) =>
            (images as HTMLImageElement[])
              .filter((image) => !image.complete || image.naturalWidth === 0)
              .map((image) => image.src),
          ),
      )
      .toEqual([]);
    await expect(
      page
        .getByRole("navigation", { name: "Phân hệ", exact: true })
        .locator('a[aria-current="page"]'),
    ).toHaveCount(1);
  }
  for (const route of [
    "teams",
    "tenant-system/company-profile",
    "tenant-system/access-control/audit-backups",
    "manage-information",
    "book",
    "manage-receipt",
    "hr-management/attendance",
    "crm",
    "tenant-system/tenant-auth",
  ]) {
    expect((await page.goto("/" + route))?.status()).toBe(404);
  }
  await page.goto("/home");
  await page.screenshot({ path: "docs/screenshots/workspace-desktop.png" });
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/tasks");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  }
  await page.screenshot({ path: "docs/screenshots/workspace-mobile.png" });
  expect(errors).toEqual([]);
});
test("tasks create, move in Kanban, track checklist/comments, edit and delete", async ({
  page,
}) => {
  await page.goto("/work-management/kanban");
  await page
    .locator("main")
    .getByRole("button", { name: "Tạo mới", exact: true })
    .first()
    .click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Mã", { exact: true }).fill("TASK-UI-01");
  await dialog
    .getByLabel("Tiêu đề", { exact: true })
    .fill("Hoàn thiện workspace");
  await dialog.getByLabel("Người thực hiện", { exact: true }).fill("An");
  await dialog.getByLabel("Dự án", { exact: true }).fill("OneOps");
  await dialog.getByLabel("Mức ưu tiên").selectOption("Cao");
  await dialog.getByRole("button", { name: "Tạo mới", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Hoàn thiện workspace", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Trạng thái TASK-UI-01", { exact: true })
    .selectOption("Đang thực hiện");
  await expect(page.getByRole("status")).toContainText(
    "Đã cập nhật thành công",
  );
  await page.screenshot({ path: "docs/screenshots/tasks-kanban.png" });
  await page.reload();
  await expect(
    page.getByLabel("Trạng thái TASK-UI-01", { exact: true }),
  ).toHaveValue("Đang thực hiện");
  await page
    .getByRole("button", { name: "Hoàn thiện workspace", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Thêm đầu việc").fill("Kiểm tra luồng tạo mới");
  await dialog.getByRole("button", { name: "Thêm checklist" }).click();
  await expect(
    dialog.getByRole("checkbox", { name: "Kiểm tra luồng tạo mới" }),
  ).toBeVisible();
  await dialog
    .getByRole("checkbox", { name: "Kiểm tra luồng tạo mới" })
    .check();
  await dialog.getByLabel("Nội dung trao đổi").fill("Đã kiểm tra thành công");
  await dialog.getByRole("button", { name: "Gửi trao đổi" }).click();
  await expect(
    dialog.getByText("Đã kiểm tra thành công", { exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Đóng", exact: true }).click();
  await page.getByRole("button", { name: "Danh sách", exact: true }).click();
  await page.getByRole("button", { name: "Sửa", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Tiêu đề", { exact: true })
    .fill("Workspace hoàn chỉnh");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Lưu thay đổi" })
    .click();
  await expect(
    page.getByRole("button", { name: "Workspace hoàn chỉnh", exact: true }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Xuất CSV", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("tasks.csv");
  await page.getByRole("button", { name: "Xóa", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Xóa", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Workspace hoàn chỉnh", exact: true }),
  ).toHaveCount(0);
});
test("global creation switches module without leaking form state; calendar renders its event", async ({
  page,
}) => {
  await page.goto("/projects");
  await page
    .getByRole("button", { name: "Tạo mới", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Mã", { exact: true }).fill("RESET-ME");
  await dialog
    .getByRole("combobox", { name: "Phân hệ", exact: true })
    .selectOption("work-management/calendar");
  await expect(dialog.getByLabel("Mã", { exact: true })).toHaveValue("");
  await dialog.getByLabel("Mã", { exact: true }).fill("MEET-01");
  await dialog.getByLabel("Tiêu đề", { exact: true }).fill("Họp kế hoạch tuần");
  await dialog.getByLabel("Bắt đầu", { exact: true }).fill("09:00");
  await dialog.getByLabel("Kết thúc", { exact: true }).fill("10:00");
  await dialog.getByRole("button", { name: "Tạo mới", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("Đã tạo thành công");
  await page.goto("/calendar");
  await expect(
    page.getByRole("button", { name: "09:00 Họp kế hoạch tuần", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "09:00 Họp kế hoạch tuần", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Họp kế hoạch tuần");
  await page.keyboard.press("Escape");
  await page.goto("/projects");
  await expect(
    page.getByRole("button", { name: "Họp kế hoạch tuần", exact: true }),
  ).toHaveCount(0);
});
