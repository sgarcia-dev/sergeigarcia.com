import { test, expect } from "@playwright/test";

// /lab/social/ shows one design for one sample at a time, picked by ?d= and ?s=.
test("the lab opens on the chosen article design and the switcher lists every design", async ({ page }) => {
  await page.goto("/lab/social/");
  await expect(page.locator(".nat:visible")).toHaveCount(1);
  await expect(page.locator("html")).toHaveAttribute("data-d", "a1t1");
  await expect(page.locator("a.sw-d")).toHaveCount(9);
  await expect(page.locator('a.sw-d[aria-current="page"]')).toHaveCount(1);
  // Three picks are marked as chosen, in the switcher.
  await expect(page.locator("a.sw-d .chosen")).toHaveCount(3);
});

test("?d and ?s pick the design and the page, and a wrong page falls back", async ({ page }) => {
  await page.goto("/lab/social/?d=hx3&s=home");
  await expect(page.locator(".nat:visible")).toHaveCount(1);
  await expect(page.locator('.nat:visible .og')).toHaveAttribute("data-d", "hx3");
  await page.goto("/lab/social/?d=a1t2&s=agents-workspace-tour");
  await expect(page.locator('.nat:visible .og')).toHaveAttribute("data-s", "agents-workspace-tour");
  // A homepage sample does not fit an article design, so the first (newest) article is used.
  // Not pinned to one slug, so a new post does not break this test.
  await page.goto("/lab/social/?d=a1&s=home");
  await expect(page.locator('.nat:visible .og')).toHaveAttribute("data-s", /^(?!home$).+/);
});

test("?raw draws only the one image at native size", async ({ page }) => {
  await page.goto("/lab/social/?raw&d=hx3&s=home");
  await page.waitForSelector("html[data-ready]");
  await expect(page.locator(".og")).toHaveCount(1);
  const box = await page.locator(".og").boundingBox();
  expect([box?.width, box?.height]).toEqual([1200, 630]);
});

test("the Dublin tag comes from SITE.locationTag and shows on the homepage designs", async ({ page }) => {
  await page.goto("/lab/social/?raw&d=hx3&s=home");
  await page.waitForSelector("html[data-ready]");
  await expect(page.locator(".og .tag")).toHaveText("Dublin, IE");
});
