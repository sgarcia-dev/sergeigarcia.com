import { test, expect } from "@playwright/test";

// Guards scroll-driven effects against the production CSS minifier, which once
// dropped an `animation` shorthand followed by `animation-timeline` (only the
// built site showed it). Runs against the built preview like the other tests.
test("shrunk page band shows its title, and the reading bar grows", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto("/projects/");
  await page.evaluate(() => window.scrollTo(0, 900));
  await expect
    .poll(async () => Number(await page.locator(".ph-mini").evaluate((el) => getComputedStyle(el).opacity)))
    .toBeGreaterThan(0.9);

  await page.goto("/writing/agents-workspace-tour/");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
  await expect
    .poll(async () =>
      page.locator(".read-progress > i").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a),
    )
    .toBeGreaterThan(0.2);
});
