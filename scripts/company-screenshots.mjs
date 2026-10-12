// Captures desktop screenshots of employers' public home pages.
// Run: npm run screenshots:companies [slug ...]   (no args = all)
import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";

const outDir = fileURLToPath(new URL("../src/assets/screenshots/companies/", import.meta.url));
mkdirSync(outDir, { recursive: true });

const targets = [
  { slug: "reddit", url: "https://www.redditinc.com" },
  { slug: "toptal", url: "https://www.toptal.com" },
  { slug: "teaching-com", url: "https://www.typing.com" },
  { slug: "karat", url: "https://karat.com" },
  { slug: "deviget", url: "https://www.deviget.com" },
  { slug: "thinkful", url: "https://www.thinkful.com" },
  { slug: "digitalonus", url: "https://digitalonus.com" },
  { slug: "luxoft", url: "https://www.luxoft.com" },
  { slug: "desafio-latam", url: "https://desafiolatam.com" },
  { slug: "inflection-point", url: "https://www.inflectionpoint-systems.com" },
  { slug: "accenture", url: "https://www.accenture.com/us-en" },
];

const hideCss = `
#onetrust-consent-sdk, #onetrust-banner-sdk, .cookie, [id*=cookie i], [class*=cookie i],
[id*=consent i], [class*=consent i], #CybotCookiebotDialog, .truste_box_overlay,
#intercom-container, .intercom-lightweight-app, #hubspot-messages-iframe-container,
iframe[title*=chat i], #drift-widget, .drift-frame-controller, #launcher,
[id*=chat-widget i] { display: none !important; }
`;

const only = process.argv.slice(2);
const list = only.length ? targets.filter((t) => only.includes(t.slug)) : targets;

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: "light",
});

for (const { slug, url } of list) {
  const page = await context.newPage();
  try {
    const res = await page.goto(url, { waitUntil: "load", timeout: 45000 });
    await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
    await page.addStyleTag({ content: hideCss });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: outDir + slug + ".png", fullPage: false });
    console.log(`SHOT ${slug} status=${res?.status()} final=${page.url()}`);
  } catch (err) {
    console.log(`FAIL ${slug} (${err.message.split("\n")[0]})`);
  } finally {
    await page.close();
  }
}
await browser.close();
