import { test, expect } from "./fixtures";

test("UI catalog renders eight groups and searches components", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/design-system");
  await expect(page.locator('section[id^="ui-"]')).toHaveCount(8);
  await expect(
    page
      .locator("#ui-forms")
      .getByRole("heading", { name: "Chọn có tìm kiếm" }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/tailwind-library-light.png",
  });
  await page
    .getByRole("textbox", { name: "Tìm thành phần UI", exact: true })
    .fill("dropdown");
  await expect(page.locator('section[id^="ui-"]')).toHaveCount(1);
  await expect(page.locator("#ui-overlays")).toBeVisible();
  await page
    .getByRole("textbox", { name: "Tìm thành phần UI", exact: true })
    .fill("zz-no-component");
  await expect(
    page.getByRole("heading", {
      name: "Không tìm thấy thành phần",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Xem tất cả", exact: true }).click();
  await expect(page.locator('section[id^="ui-"]')).toHaveCount(8);
  expect(errors).toEqual([]);
});

test("theme and density persist and the library stays within mobile width", async ({
  page,
}) => {
  await page.goto("/design-system");
  await page
    .getByRole("button", { name: "Đổi giao diện sáng tối", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("button", { name: "Đổi mật độ hiển thị", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-density", "compact");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.screenshot({ path: "docs/screenshots/tailwind-library-dark.png" });
  await page.goto("/home");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.goto("/design-system");
  await page.mouse.move(0, 0);
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(
        () =>
          page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
        { message: `document ${width}` },
      )
      .toBe(false);
    await expect
      .poll(
        () =>
          page
            .locator("main")
            .evaluate((el) => el.scrollWidth > el.clientWidth),
        { message: `main ${width}` },
      )
      .toBe(false);
  }

  await page.screenshot({
    path: "docs/screenshots/tailwind-library-mobile.png",
  });
});

test("dialogs, confirmation, multi-select and tables work with keyboard", async ({
  page,
}) => {
  await page.goto("/design-system");
  const overlays = page.locator("#ui-overlays");
  const trigger = overlays.getByRole("button", {
    name: "Mở hộp thoại",
    exact: true,
  });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await overlays
    .getByRole("button", { name: "Xác nhận xóa", exact: true })
    .click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Hủy", exact: true })
    .click();
  const forms = page.locator("#ui-forms");
  await forms
    .getByRole("combobox", { name: "Nhóm công việc minh họa", exact: true })
    .click();
  await page.getByRole("option", { name: "Sản phẩm", exact: true }).click();
  await page.getByRole("option", { name: "Vận hành", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(
    forms.getByRole("button", { name: "Bỏ chọn Sản phẩm", exact: true }),
  ).toBeVisible();
  await forms
    .getByRole("button", { name: "Bỏ chọn Sản phẩm", exact: true })
    .click();
  await expect(
    forms.getByRole("button", { name: "Bỏ chọn Sản phẩm", exact: true }),
  ).toHaveCount(0);
  const data = page.locator("#ui-data");
  await data.getByLabel("Tìm kiếm trong bảng").fill("CV-MH-003");
  await expect(data.getByRole("row")).toHaveCount(2);
  await data.getByRole("button", { name: "CV-MH-003", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  const download = page.waitForEvent("download");
  await data.getByRole("button", { name: "Xuất CSV", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("bang-du-lieu.csv");
});
