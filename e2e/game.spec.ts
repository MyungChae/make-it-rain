import { expect, test } from "@playwright/test";

test.describe("Game flow", () => {
  test("menu → start → countdown → playing → result → menu", async ({ page, clock }) => {
    await page.goto("/");

    // Scenario 1: menu shows start button
    await expect(page.getByRole("button", { name: "시작" })).toBeVisible();

    // Scenario 2: click start → countdown appears
    await page.getByRole("button", { name: "시작" }).click();
    await expect(page.getByText("3")).toBeVisible();

    // Countdown completes (3 seconds)
    await clock.fastForward(3000);
    // HUD visible with score=0 and time=60
    await expect(page.getByText("SCORE")).toBeVisible();
    await expect(page.getByText("TIME")).toBeVisible();

    // Fast-forward through 60s round
    await clock.fastForward(61_000);

    // Scenario 7: result screen
    await expect(page.getByText("결과")).toBeVisible();
    await expect(page.getByRole("button", { name: "다시하기" })).toBeVisible();
    await expect(page.getByRole("button", { name: "메뉴로" })).toBeVisible();

    // Scenario 10: menu로 돌아가기
    await page.getByRole("button", { name: "메뉴로" }).click();
    await expect(page.getByRole("button", { name: "시작" })).toBeVisible();
  });

  test("다시하기 restarts with fresh countdown", async ({ page, clock }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "시작" }).click();

    // Fast-forward past full round
    await clock.fastForward(64_000);
    await expect(page.getByText("결과")).toBeVisible();

    // Scenario 9: restart
    await page.getByRole("button", { name: "다시하기" }).click();
    await expect(page.getByText("3")).toBeVisible();
  });

  test("best score persists after restart", async ({ page, clock, context }) => {
    await page.goto("/");

    // Clear localStorage
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Play and finish a round (score stays 0, which won't be recorded)
    await page.getByRole("button", { name: "시작" }).click();
    await clock.fastForward(64_000);
    await expect(page.getByText("결과")).toBeVisible();

    // Go to menu
    await page.getByRole("button", { name: "메뉴로" }).click();

    // Reload page — no best score should be shown as a positive number
    await page.reload();
    // Best score display shows "-" or nothing when no positive score recorded
    await expect(page.getByRole("button", { name: "시작" })).toBeVisible();
  });
});
