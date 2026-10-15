import { test, expect } from "@playwright/test";

// The social image lab (/lab/social/) draws each design at 1200x630. Whatever a platform crops
// (a center square thumbnail, a 2:1 card), the TEXT (title, TL;DR, tagline, name) must stay whole.
// Pictures are exempt: the cover art (data-t="art") may be cropped freely. The small avatar is
// still checked, because it is part of the name line. Each case also reports a rough "fill": the share of the center square (x 285 to 915, full
// height) covered by the boxes of the title, name, summary, avatar and main art. Low fill means dead
// space in the part of the image that every crop keeps. Safe box: x 285 to 915 (square crop) and y 15 to 615 (2:1 crop). See SAFE in src/lib/social.ts.
const POSTS = ["ai-raises-the-floor", "agents-workspace-tour"];
const CASES: { d: string; s: string }[] = [
  ...["a1", "a1t1", "a1t2", "a1t3"].flatMap((d) => POSTS.map((s) => ({ d, s }))),
  ...["h1", "hx1", "hx2", "hx3"].map((d) => ({ d, s: "home" })),
  ...["projects", "writing", "about"].map((s) => ({ d: "p1", s })),
];
const SAFE = { left: 285, right: 915, top: 15, bottom: 615 };
// Fails a design that leaves most of the center square empty. Round 2 designs sat between 36% and 71%.
const MIN_FILL = 0.5;

for (const { d, s } of CASES) {
  test(`social ${d} ${s}: copy stays in the safe box`, async ({ page }) => {
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
      // Fill: paint each box (clipped to the square) on a 1px grid and count the painted share.
      const X0 = 285, X1 = 915, W = X1 - X0, H = 630;
      const grid = new Uint8Array(W * H);
      for (const el of document.querySelectorAll<HTMLElement>(".og [data-t]")) {
        let r: DOMRect;
        if (el instanceof HTMLImageElement) r = el.getBoundingClientRect();
        else {
          const range = document.createRange();
          range.selectNodeContents(el);
          r = range.getBoundingClientRect();
        }
        const l = Math.max(X0, Math.round(r.left - og.left)), rr = Math.min(X1, Math.round(r.right - og.left));
        const t = Math.max(0, Math.round(r.top - og.top)), b = Math.min(H, Math.round(r.bottom - og.top));
        for (let y = t; y < b; y++) for (let x = l; x < rr; x++) grid[y * W + (x - X0)] = 1;
      }
      let painted = 0;
      for (const v of grid) painted += v;
      const titleEl = document.querySelector<HTMLElement>('.og [data-t="title"]');
      return {
        out,
        fill: painted / (W * H),
        variant: titleEl?.dataset.variant ?? "n/a",
        titlePx: titleEl ? parseFloat(getComputedStyle(titleEl).fontSize) : 0,
      };
    });
    const { out: items, fill, variant, titlePx } = found;
    const note = `fill ${(fill * 100).toFixed(0)}%, title ${variant} ${titlePx}px`;
    test.info().annotations.push({ type: "fill", description: note });
    console.log(`social ${d} ${s}: ${note}`);
    expect(fill, `fill of the center square (${note})`).toBeGreaterThanOrEqual(MIN_FILL);

    const roles = items.map((f) => f.role);
    expect(roles, "title is drawn").toContain("title");
    // The SG mark and avatar are drawn by every design except the homepage ones (where the title is the name).
    if (d.startsWith("a") || d === "p1") {
      expect(roles, "SG mark is drawn").toContain("mark");
      expect(roles, "avatar is drawn").toContain("avatar");
    }
    // The ticker strip shows exactly the three phrases, whole (they are checked against the safe box below).
    if (d === "hx2" || d === "hx3") expect(roles.filter((r) => r === "ticker"), "ticker phrases").toHaveLength(3);
    for (const f of items) {
      expect(f.left, `${f.role} left`).toBeGreaterThanOrEqual(SAFE.left);
      expect(f.right, `${f.role} right`).toBeLessThanOrEqual(SAFE.right);
      expect(f.top, `${f.role} top`).toBeGreaterThanOrEqual(SAFE.top);
      expect(f.bottom, `${f.role} bottom`).toBeLessThanOrEqual(SAFE.bottom);
    }
  });
}
