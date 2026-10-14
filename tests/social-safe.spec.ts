import { test, expect } from "@playwright/test";

// The social image lab (/lab/social/) draws each design at 1200x630. Whatever a platform crops
// (a center square thumbnail, a 2:1 card), the title and the owner's name must stay whole.
// Safe box: x 285 to 915 (square crop) and y 15 to 615 (2:1 crop). See SAFE in src/lib/social.ts.
const DESIGNS = ["s1", "s2", "s3", "s4", "s5"];
const SAMPLES = ["post", "home", "page"];
const SAFE = { left: 285, right: 915, top: 15, bottom: 615 };

for (const d of DESIGNS) {
  for (const s of SAMPLES) {
    test(`social ${d} ${s}: title and name stay in the safe box`, async ({ page }) => {
      await page.goto(`/lab/social/?raw&d=${d}&s=${s}`);
      await page.waitForSelector("html[data-ready]");
      await page.evaluate(() => document.fonts.ready);

      const box = await page.locator(".og").boundingBox();
      expect(box?.width).toBe(1200);
      expect(box?.height).toBe(630);

      // Text is measured from the text itself (a Range), not from its wider container.
      const found = await page.evaluate(() => {
        const og = document.querySelector(".og")!.getBoundingClientRect();
        const out: { role: string; left: number; right: number; top: number; bottom: number }[] = [];
        for (const el of document.querySelectorAll<HTMLElement>(".og [data-t]")) {
          const role = el.dataset.t!;
          if (role === "art") continue;
          let r: DOMRect;
          if (el instanceof HTMLImageElement) r = el.getBoundingClientRect();
          else {
            const range = document.createRange();
            range.selectNodeContents(el);
            r = range.getBoundingClientRect();
          }
          out.push({ role, left: r.left - og.left, right: r.right - og.left, top: r.top - og.top, bottom: r.bottom - og.top });
        }
        return out;
      });

      const roles = found.map((f) => f.role);
      expect(roles, "title is drawn").toContain("title");
      // On the home page the title is the name, so a separate name element is only expected elsewhere.
      if (s !== "home") expect(roles, "name is drawn").toContain("name");
      for (const f of found) {
        expect(f.left, `${f.role} left`).toBeGreaterThanOrEqual(SAFE.left);
        expect(f.right, `${f.role} right`).toBeLessThanOrEqual(SAFE.right);
        expect(f.top, `${f.role} top`).toBeGreaterThanOrEqual(SAFE.top);
        expect(f.bottom, `${f.role} bottom`).toBeLessThanOrEqual(SAFE.bottom);
      }
    });
  }
}
