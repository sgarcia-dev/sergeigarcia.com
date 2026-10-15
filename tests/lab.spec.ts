import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";

// /lab/ is a public but unlisted landing page: noindex, out of the sitemap, and it links to each lab page.
test("/lab/ is noindex, out of the sitemap, and links to both labs", async ({ page }) => {
  const res = await page.goto("/lab/");
  expect(res?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator("h1")).toHaveText(/lab/i);
  await expect(page.locator('main a[href="/lab/cards/"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/lab/social/"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/playground/"]')).toHaveCount(1);
  const sitemap = readFileSync("dist/sitemap-0.xml", "utf8");
  expect(sitemap).not.toContain("/lab/");
});

test("each lab page links back to /lab/", async ({ page }) => {
  for (const path of ["/lab/cards/", "/lab/social/"]) {
    await page.goto(path);
    await expect(page.locator('a[href="/lab/"]').first()).toBeVisible();
  }
});
