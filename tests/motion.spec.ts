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

// Read time: a static line for everyone, plus a live "minutes left" chip that scripts add.
test.describe("read time", () => {
  const post = "/writing/ai-raises-the-floor/";

  test("static line exists and the chip reaches done at the bottom", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(post);
    await expect(page.locator("main p.label", { hasText: /^\d+ min read$/ })).toBeAttached();
    const chip = page.locator(".rt-chip");
    await expect(chip).toHaveAttribute("aria-hidden", "true");
    await expect(chip).toContainText("min");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(chip).toHaveAttribute("data-state", "done");
    await expect(chip).toContainText("You made it");

    // The quiet wording says plain "Done".
    await page.goto(`${post}?rtcopy=quiet&rtswap=plain`);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(page.locator(".rt-chip")).toContainText("Done");
  });

  test("emoji bounces on a change and the chip never changes the header height", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(post);
    const header = page.locator(".site-header");
    const before = (await header.boundingBox())!.height;
    const names = await page.evaluate(async () => {
      const body = document.querySelector("[data-rt-body]")!;
      const top = body.getBoundingClientRect().top + scrollY;
      window.scrollTo(0, top + body.getBoundingClientRect().height * 0.4);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return document.querySelector(".rt-emoji")!.getAnimations().map((a) => (a as CSSAnimation).animationName);
    });
    expect(names).toContain("rt-bounce");
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(async () => (await header.boundingBox())!.height).toBe(before);
  });

  test("chip is one line, emoji last, and phones get the short text in the strip or the corner", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(post);
    await expect(page.locator(".rt-chip > :last-child")).toHaveClass(/rt-emoji/);
    await expect(page.locator(".rt-chip .rt-main").first()).toContainText(/^\d+ min left$/);

    // Phone, default: inside the shrunk strip, minutes only. The header keeps its two rows (139px).
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(post);
    await expect(page.locator(".ph-mini-in > .rt-chip")).toHaveCount(1);
    await expect(page.locator(".rt-chip .rt-main").first()).toHaveText(/^\d+ min$/);
    expect((await page.locator(".site-header").boundingBox())!.height).toBe(139);

    // Phone, corner: shows after the page head shrinks, hides again over the footer.
    await page.goto(`${post}?rtm=corner`);
    const chip = page.locator('.rt-chip[data-pos="corner"]');
    await expect(chip).not.toHaveAttribute("data-show", "");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.4));
    await expect(chip).toHaveAttribute("data-show", "");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(chip).not.toHaveAttribute("data-show", "");
  });

  test("no chip on pages that are not posts or case studies", async ({ page }) => {
    await page.goto("/work/");
    await expect(page.locator(".rt-chip")).toHaveCount(0);
    await page.goto("/");
    await expect(page.locator(".rt-chip")).toHaveCount(0);
  });
});

// Pull quote: hidden and untilted until it is on screen, then pops in once and settles on its
// normal look. Without JS it is just there.
test.describe("pull quote reveal", () => {
  const settled = "matrix(0.999848, -0.0174524, 0.0174524, 0.999848, 0, 0)"; // rotate(-1deg)

  test("waits below the fold, pops in once when scrolled to, then stays settled", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/about/");
    const pq = page.locator(".pq");
    await expect(pq).toHaveAttribute("data-pq", "pending");
    expect(await pq.evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
    const top = await pq.evaluate((el) => (el as HTMLElement).offsetTop);

    await pq.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect(pq).toHaveAttribute("data-pq", "in");
    expect(await pq.evaluate((el) => el.getAnimations().map((a) => (a as CSSAnimation).animationName))).toContain(
      "pq-pop",
    );
    // Settled: fully visible, the usual tilt, no animation left, and nothing around it moved.
    await expect.poll(async () => pq.evaluate((el) => el.getAnimations().length), { timeout: 3000 }).toBe(0);
    expect(await pq.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    expect(await pq.evaluate((el) => getComputedStyle(el).transform)).toBe(settled);
    expect(await pq.evaluate((el) => (el as HTMLElement).offsetTop)).toBe(top);

    // Scrolling away and back does not replay it.
    await page.evaluate(() => window.scrollTo(0, 0));
    await pq.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(150);
    expect(await pq.evaluate((el) => el.getAnimations().length)).toBe(0);
  });

  test("shows at once without scripts", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/about/");
    const pq = page.locator(".pq");
    expect(await pq.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    expect(await pq.evaluate((el) => getComputedStyle(el).transform)).toBe(settled);
    await ctx.close();
  });

  test("reduced motion shows it at once, flat", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/about/");
    const pq = page.locator(".pq");
    expect(await pq.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    expect(await pq.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
    await ctx.close();
  });
});
