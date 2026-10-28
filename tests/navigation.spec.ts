import { test, expect, type Page } from "@playwright/test";

// Page-to-page navigation guards. Three bugs lived here:
//   1. The right-hand nav jumped sideways between pages (a scrollbar on long pages only, and the
//      "minutes left" chip holding room in the header of article pages until a script moved it).
//   2. The list <-> detail morph only played some of the time (Chrome dropped the transition when the
//      new page was revealed before its stylesheet carried the opt-in rule).
//   3. The Writing page band was shorter than the Work and Projects bands.
// Everything runs against the built preview, like the other specs.

// Classic (always visible) scrollbars, so a page with and without a scrollbar differs in width.
// Headless Chrome hides scrollbars by default, which would hide bug 1.
test.use({
  launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"], args: ["--disable-features=OverlayScrollbar"] },
});

const DESKTOP = { width: 1280, height: 2000 };

/** First link in a list on a page, e.g. the newest post. */
async function firstDetailHref(page: Page, listPath: string) {
  await page.goto(listPath);
  const href = await page.locator("main a.row-link").first().getAttribute("href");
  expect(href, `a title link on ${listPath}`).toBeTruthy();
  return href as string;
}

async function transitionNames(page: Page) {
  return page.evaluate(() => {
    const names: string[] = [];
    for (const el of document.querySelectorAll("body, body *")) {
      const name = getComputedStyle(el).viewTransitionName;
      if (name && name !== "none") names.push(name);
    }
    return names;
  });
}

const navLefts = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll(".site-nav a")].map((a) => Math.round(a.getBoundingClientRect().left * 10) / 10),
  );

test("no page uses the same view-transition-name twice", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  const article = await firstDetailHref(page, "/writing/");
  const project = await firstDetailHref(page, "/projects/");
  const role = await firstDetailHref(page, "/work/");
  const failures: string[] = [];
  for (const path of ["/", "/writing/", "/projects/", "/work/", article, project, role]) {
    await page.goto(path);
    const names = await transitionNames(page);
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    if (dupes.length) failures.push(`${path}: ${[...new Set(dupes)].join(", ")}`);
  }
  expect(failures, "duplicate names make Chrome skip the whole transition").toEqual([]);
});

test("list titles and detail headings use the same name", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  for (const list of ["/writing/", "/projects/", "/work/"]) {
    const href = await firstDetailHref(page, list);
    const listed = await page.locator("main a.row-link").first().evaluate((el) => getComputedStyle(el).viewTransitionName);
    expect(listed, `${list} first title has a name`).not.toBe("none");
    await page.goto(href);
    const heading = await page.locator("h1.page-head-title").evaluate((el) => getComputedStyle(el).viewTransitionName);
    expect(heading, `${href} heading matches the list title`).toBe(listed);
  }
});

test("nav links sit at the same x on a short page and a long page", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  const article = await firstDetailHref(page, "/writing/");

  await page.goto("/404.html");
  const shortFits = await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight);
  expect(shortFits, "the 404 page must fit the viewport (no scrollbar) for this test to mean anything").toBe(true);
  const short = await navLefts(page);

  for (const path of [article, "/", "/projects/", "/about/"]) {
    await page.goto(path);
    const scrolls = await page.evaluate(() => document.documentElement.scrollHeight > innerHeight);
    expect(scrolls, `${path} must scroll (scrollbar on) for this test to mean anything`).toBe(true);
    expect(await navLefts(page), `nav x on ${path} vs the short page`).toEqual(short);
  }
});

test("nav does not move while an article loads", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  const article = await firstDetailHref(page, "/writing/");
  // Record the nav's x on every frame from the first one. The "minutes left" chip used to hold
  // header room until a script moved it, which pushed the nav about 270px left for a few frames.
  await page.addInitScript(() => {
    const samples: number[] = [];
    (window as unknown as { __navX: number[] }).__navX = samples;
    const start = performance.now();
    const tick = () => {
      const a = document.querySelector(".site-nav a");
      if (a) samples.push(a.getBoundingClientRect().left);
      if (performance.now() - start < 800) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.goto(article);
  await page.waitForTimeout(1000);
  const samples = await page.evaluate(() => (window as unknown as { __navX: number[] }).__navX);
  expect(samples.length, "frames sampled").toBeGreaterThan(3);
  // 2px allows for the tiny width difference when the mono font finishes loading (about 1px with the
  // five nav labels since "Hack this site" joined). The bug this guards against moved the nav ~270px.
  expect(Math.max(...samples) - Math.min(...samples), `nav x range over ${samples.length} frames`).toBeLessThan(2);
});

test("list to detail and back plays a view transition every time", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  // Remember, per page load, whether the browser started a transition for it.
  await page.addInitScript(() => {
    addEventListener("pagereveal", (e) => {
      const log: string[] = JSON.parse(sessionStorage.getItem("vt-log") ?? "[]");
      log.push(`${location.pathname} ${(e as Event & { viewTransition?: unknown }).viewTransition ? "vt" : "none"}`);
      sessionStorage.setItem("vt-log", JSON.stringify(log));
    });
  });
  for (const [listPath, navHref] of [
    ["/writing/", "/writing/"],
    ["/projects/", "/projects/"],
  ] as const) {
    const detail = await firstDetailHref(page, listPath);
    await page.goto(listPath);
    await page.evaluate(() => sessionStorage.removeItem("vt-log"));
    const loaded = () => page.evaluate(() => (JSON.parse(sessionStorage.getItem("vt-log") ?? "[]") as string[]).length);
    let expected = 0;
    // Wait for each new page to report its reveal before clicking again, so one navigation never
    // interrupts the one before it.
    const clickAndSettle = async (locator: ReturnType<Page["locator"]>) => {
      await locator.click();
      expected += 1;
      await expect.poll(loaded, { message: "page reveal logged" }).toBe(expected);
      // A click while the previous transition is still playing would cancel it. That is normal
      // browser behaviour (and not what this test is about), so let it finish first.
      await page.waitForFunction(() => !(document as Document & { activeViewTransition?: unknown }).activeViewTransition);
    };
    for (let i = 0; i < 4; i++) {
      await clickAndSettle(page.locator(`main a.row-link[href="${detail}"]`));
      await clickAndSettle(page.locator(`.site-nav a[href="${navHref}"]`));
    }
    const log: string[] = await page.evaluate(() => JSON.parse(sessionStorage.getItem("vt-log") ?? "[]"));
    expect(log.length, `${listPath} page loads logged`).toBe(8);
    expect(log.filter((l) => l.endsWith(" none")), `${listPath} loads that got no transition`).toEqual([]);
  }
});

test("Writing, Projects and Work page bands are the same height", async ({ page }) => {
  // 1280 and 1024 are the desktop layouts, 768 the tablet one, 375 a phone. (Between 400 and 430 the
  // Projects sentence wraps one line earlier than the others; that is plain text wrapping.)
  for (const width of [1280, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    const heights: Record<string, number> = {};
    for (const path of ["/writing/", "/projects/", "/work/"]) {
      await page.goto(path);
      heights[path] = await page.locator("main .page-head").evaluate((el) => Math.round(el.getBoundingClientRect().height * 10) / 10);
    }
    expect(heights["/writing/"], `Writing vs Projects band at ${width}px (${JSON.stringify(heights)})`).toBe(heights["/projects/"]);
    expect(heights["/writing/"], `Writing vs Work band at ${width}px (${JSON.stringify(heights)})`).toBe(heights["/work/"]);
  }
});
