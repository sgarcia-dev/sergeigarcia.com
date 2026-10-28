import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { SKINS } from "../src/lib/themes";

// "Hack this site": every ready-made look must pass the same axe checks as the default site, on the
// pages people land on first. The default run (a11y.spec.ts) only sees the site with no theme.
const ROUTES = ["/", "/writing/ai-raises-the-floor/", "/hack/"];
const link = (theme: unknown) => `/?theme=${Buffer.from(JSON.stringify(theme)).toString("base64url")}`;
const attrs = (page: Page) => page.evaluate(() => ({ ...document.documentElement.dataset }));

test("the default site carries no theme", async ({ page }) => {
  await page.goto("/");
  const a = await attrs(page);
  expect(a.theme).toBeUndefined();
  await expect(page.locator(".th-bar")).toBeHidden();
  await expect(page.locator('footer a[href="/hack/"]')).toBeVisible();
});

for (const skin of SKINS.filter((s) => s.id !== "original")) {
  test(`the ${skin.label} look passes a11y on key pages`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(link(skin.theme));
    const failures: string[] = [];
    for (const route of ROUTES) {
      await page.goto(route);
      const a = await attrs(page);
      expect(a.palette, `${route} keeps the theme`).toBe(skin.theme.palette);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      for (const v of results.violations) {
        failures.push(`${route} axe ${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
      }
    }
    expect(failures, `\n${failures.join("\n")}\n`).toEqual([]);
  });
}

test("a shared link is checked, kept across pages, and ?theme=off resets it", async ({ page }) => {
  await page.goto(link({ palette: "evil", type: "mono", shape: "round", shadow: "huge", fx: "full", colors: ["red", "#00ff00", "#123"] }));
  let a = await attrs(page);
  expect(a.palette).toBe("original"); // unknown value dropped
  expect(a.type).toBe("mono");
  expect(await page.evaluate(() => document.documentElement.style.getPropertyValue("--color-yellow"))).toBe(""); // bad colors dropped

  await page.goto("/work/");
  a = await attrs(page);
  expect(a.type).toBe("mono");
  await expect(page.locator(".th-bar")).toBeVisible();

  await page.locator('.th-bar a[href="?theme=off"]').click();
  await page.waitForURL(/theme=off/);
  a = await attrs(page);
  expect(a.theme).toBeUndefined();
  await page.goto("/");
  expect((await attrs(page)).theme).toBeUndefined();
});

test("the editor applies a look, own colors and CSS, and the link never carries the CSS", async ({ page }) => {
  await page.goto("/hack/");
  await page.locator('[data-skin="terminal"]').click();
  expect((await attrs(page)).palette).toBe("terminal");

  await page.locator("[data-th-own]").check();
  const fill = await page.evaluate(() => document.documentElement.style.getPropertyValue("--color-yellow"));
  expect(fill).toMatch(/^#[0-9a-f]{6}$/);

  await page.locator("[data-th-css]").fill(".font-display { text-transform: uppercase; }");
  await page.locator("[data-th-apply-css]").click();
  await expect(page.locator("#sg-theme-css")).toHaveCount(1);
  const shared = await page.locator("[data-th-link]").inputValue();
  const decoded = JSON.parse(Buffer.from(new URL(shared).searchParams.get("theme")!, "base64url").toString());
  expect(decoded.css).toBeUndefined();
  expect(decoded.palette).toBe("terminal");

  await page.goto("/writing/");
  await expect(page.locator("#sg-theme-css")).toHaveCount(1);

  await page.goto("/hack/");
  await page.locator("[data-th-reset]").click();
  expect((await attrs(page)).theme).toBeUndefined();
  await expect(page.locator("#sg-theme-css")).toHaveCount(0);
});

test("the Writing bands are black, with a texture layer, on the index, a post and home", async ({ page }) => {
  for (const route of ["/writing/", "/writing/ai-raises-the-floor/", "/"]) {
    await page.goto(route);
    const band = page.locator('[data-section="writing"]').first();
    expect(await band.evaluate((el) => getComputedStyle(el).backgroundColor), route).toBe("rgb(10, 10, 10)");
    await expect(band.locator(":scope > .tex"), `${route} texture`).toHaveCount(1);
  }
  await expect(page.locator("footer > .tex"), "the footer stays plain").toHaveCount(0);
});
