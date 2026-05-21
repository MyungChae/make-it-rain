import { expect, test } from "@playwright/test";

test("home page loads with Make It Rain title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Make It Rain/);
});

test("menu screen shows start button", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "시작" })).toBeVisible();
});
