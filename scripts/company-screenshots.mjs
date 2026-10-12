// Captures desktop screenshots of employers' public home pages.
// Run: node scripts/company-screenshots.mjs [slug ...]   (no args = all)
// Env: HEADED=1 for a visible browser, CHANNEL=chrome to use installed Chrome.
import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { mkdirSync, statSync } from "node:fs";

const outDir = fileURLToPath(new URL("../src/assets/screenshots/companies/", import.meta.url));
mkdirSync(outDir, { recursive: true });

const targets = [
  { slug: "reddit", url: "https://www.redditinc.com" },
  { slug: "toptal", url: "https://www.toptal.com" },
  { slug: "teaching-com", url: "https://www.typing.com" },
  { slug: "karat", url: "https://karat.com" },
  { slug: "deviget", url: "https://www.rxvantage.com/" },
  { slug: "thinkful", url: "https://www.chegg.com/skills/" },
  { slug: "digitalonus", url: "https://www.techmahindra.com/" },
  { slug: "luxoft", url: "https://www.luxoft.com/" },
  { slug: "desafio-latam", url: "https://desafiolatam.com/" },
  { slug: "inflection-point", url: "https://www.inflectionpointsystems.com/" },
  { slug: "accenture", url: "https://www.accenture.com/us-en" },
];

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

// Backup only. Cookie banners are clicked away first. Only vendor-specific
// selectors here: wildcard selectors also hid real site headers.
const hideCss = `
#onetrust-consent-sdk, #onetrust-banner-sdk, .onetrust-pc-dark-filter,
#CybotCookiebotDialog, #CybotCookiebotDialogBodyUnderlay, .truste_box_overlay,
#intercom-container, .intercom-lightweight-app, #hubspot-messages-iframe-container,
iframe[title*=chat i], #drift-widget, .drift-frame-controller { display: none !important; }
`;

// Hide leftover fixed or sticky overlays whose id/class mention cookie or consent.
async function hideLeftovers(page) {
  await page
    .evaluate(() => {
      for (const el of document.querySelectorAll("[id*=cookie i],[class*=cookie i],[id*=consent i],[class*=consent i]")) {
        const pos = getComputedStyle(el).position;
        if (pos === "fixed" || pos === "sticky") el.style.setProperty("display", "none", "important");
      }
      document.body.style.setProperty("overflow", "auto", "important");
    })
    .catch(() => {});
}

const rejectSelectors = [
  "#onetrust-reject-all-handler",
  ".ot-pc-refuse-all-handler",
  "#CybotCookiebotDialogBodyButtonDecline",
  "#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection",
  "button[id*=reject i]",
  "button[id*=decline i]",
];
const acceptSelectors = [
  "#onetrust-accept-btn-handler",
  "#CybotCookiebotDialogBodyLevelButtonAccept",
  "#CybotCookiebotDialogBodyButtonAccept",
  "button[id*=accept i]",
];
const rejectText = /^\s*(reject all|reject|decline all|decline|deny|necessary only|only necessary|use necessary cookies only|essential only|refuse)\s*$/i;
const acceptText = /^\s*(accept all|accept all cookies|accept cookies|accept|allow all|i agree|agree|got it|ok|okay)\s*$/i;

async function clickFirst(page, selectors) {
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    if (await loc.isVisible().catch(() => false)) {
      await loc.click({ timeout: 3000 }).catch(() => {});
      return sel;
    }
  }
  return null;
}

async function clickByText(page, re) {
  for (const frame of page.frames()) {
    const loc = frame.locator("button, a[role=button], [role=button]").filter({ hasText: re });
    const n = await loc.count().catch(() => 0);
    for (let i = 0; i < Math.min(n, 5); i++) {
      const el = loc.nth(i);
      if (await el.isVisible().catch(() => false)) {
        await el.click({ timeout: 3000 }).catch(() => {});
        return `text:${re}`;
      }
    }
  }
  return null;
}

async function dismissCookies(page) {
  const how =
    (await clickFirst(page, rejectSelectors)) ||
    (await clickByText(page, rejectText)) ||
    (await clickFirst(page, acceptSelectors)) ||
    (await clickByText(page, acceptText));
  if (how) await page.waitForTimeout(1000);
  return how;
}

async function waitForHero(page, maxMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const ready = await page
      .evaluate(() => {
        const vh = window.innerHeight;
        const imgs = [...document.images].filter((i) => {
          const r = i.getBoundingClientRect();
          return r.width > 40 && r.height > 40 && r.bottom > 0 && r.top < vh;
        });
        const imgsOk = imgs.every((i) => i.complete && i.naturalWidth > 0);
        const vids = [...document.querySelectorAll("video")].filter((v) => {
          const r = v.getBoundingClientRect();
          return r.bottom > 0 && r.top < vh;
        });
        const vidsOk = vids.every((v) => v.readyState >= 2);
        return imgsOk && vidsOk;
      })
      .catch(() => true);
    if (ready) return true;
    await page.waitForTimeout(500);
  }
  return false;
}

async function capture(page, slug, url, extraWait) {
  const res = await page.goto(url, { waitUntil: "load", timeout: 45000 });
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1500 + extraWait);
  const cookie = await dismissCookies(page);
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  // Scroll down about one viewport in steps, then back up in steps. Stepped
  // scrolling matters: some headers hide on scroll down and only return on
  // gradual scroll up events, not on a jump to the top.
  await page
    .evaluate(async () => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      const max = window.innerHeight;
      for (let y = 0; y <= max; y += 150) {
        window.scrollTo(0, y);
        await wait(80);
      }
      await wait(800);
      for (let y = max; y >= 0; y -= 100) {
        window.scrollTo(0, y);
        await wait(80);
      }
      window.scrollTo(0, 0);
    })
    .catch(() => {});
  await page.waitForTimeout(1000);
  await page.addStyleTag({ content: hideCss }).catch(() => {});
  await hideLeftovers(page);
  const heroOk = await waitForHero(page);
  await page.waitForTimeout(2500 + extraWait);
  // A late banner may appear after load; try once more.
  const cookie2 = await dismissCookies(page);
  await page.addStyleTag({ content: hideCss }).catch(() => {});
  await hideLeftovers(page);
  const file = outDir + slug + ".png";
  await page.screenshot({ path: file, fullPage: false });
  return { status: res?.status(), cookie: cookie || cookie2, heroOk, size: statSync(file).size };
}

const only = process.argv.slice(2);
const list = only.length ? targets.filter((t) => only.includes(t.slug)) : targets;

const browser = await chromium.launch({
  headless: process.env.HEADED ? false : true,
  channel: process.env.CHANNEL || undefined,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: "light",
  userAgent,
  locale: "en-US",
});

const BLANK_BYTES = 40 * 1024;

for (const { slug, url } of list) {
  const page = await context.newPage();
  try {
    let r = await capture(page, slug, url, 0);
    let tag = "SHOT";
    if (r.size < BLANK_BYTES) {
      console.log(`BLANK? ${slug} size=${r.size}, retrying with longer wait`);
      r = await capture(page, slug, url, 4000);
      tag = r.size < BLANK_BYTES ? "BLANK" : "SHOT-RETRY";
    }
    console.log(
      `${tag} ${slug} status=${r.status} size=${r.size} cookie=${r.cookie} heroOk=${r.heroOk} final=${page.url()}`,
    );
  } catch (err) {
    console.log(`FAIL ${slug} (${err.message.split("\n")[0]})`);
  } finally {
    await page.close();
  }
}
await browser.close();
