import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const SITE = "https://sergeigarcia.com";
const NOT_FOUND = "/404.html";

// Read at test time (not at file load) so it sees the sitemap from the build
// that the webServer command just ran.
function routesFromSitemap(): string[] {
  const xml = readFileSync("dist/sitemap-0.xml", "utf8");
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, "") || "/");
  return [...new Set([...paths, NOT_FOUND])];
}

test("every route passes a11y and basic SEO checks", async ({ page }) => {
  const routes = routesFromSitemap();
  expect(routes.length, "routes found in sitemap").toBeGreaterThan(1);
  const failures: string[] = [];

  for (const route of routes) {
    const response = await page.goto(route);
    const problems: string[] = [];

    if (route !== NOT_FOUND && (response?.status() ?? 0) >= 400) {
      problems.push(`status ${response?.status()}`);
    }
    const h1 = await page.locator("h1").count();
    if (h1 !== 1) problems.push(`expected 1 <h1>, found ${h1}`);
    const canonical = await page.locator('link[rel="canonical"]').count();
    if (canonical !== 1) problems.push(`expected 1 canonical link, found ${canonical}`);
    const description = await page.locator('meta[name="description"]').first().getAttribute("content");
    if (!description?.trim()) problems.push("missing or empty meta description");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    for (const v of results.violations) {
      problems.push(`axe ${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
    }

    if (problems.length) failures.push(`${route}\n  - ${problems.join("\n  - ")}`);
  }

  expect(failures, `\n${failures.join("\n")}\n`).toEqual([]);
});
