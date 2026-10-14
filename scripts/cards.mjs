// Screenshots the LinkedIn cards from the unlisted lab page /lab/cards/.
// It builds nothing: start a preview first (npm run build && npm run preview, or npm run dev).
//
//   npm run cards                          every card, from http://localhost:4321
//   npm run cards -- http://localhost:4381 every card, from another address
//   npm run cards -- b8sq b8p              only these ids (see src/lib/cards.ts)
//   npm run cards -- --safe b8sq           also draw the crop-safe box (files get a -safe-outline suffix)
//   npm run cards -- --out ~/Desktop/x     write somewhere else
//
// Writes <id>-<slug>.png at the card's own size (1080x1350 for most) with deviceScaleFactor 1 to
// ~/Downloads/sergeigarcia-linkedin-cards/. The page runs in its native view (?raw) with reduced
// motion, so the cards are drawn exactly as designed.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { CARDS } from "../src/lib/cards.ts";

const args = process.argv.slice(2);
let outDir = join(homedir(), "Downloads", "sergeigarcia-linkedin-cards");
let safe = false;
let base = "http://localhost:4321";
const wanted = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--safe") safe = true;
  else if (a === "--out") outDir = args[++i].replace(/^~(?=\/)/, homedir());
  else if (/^https?:\/\//.test(a)) base = a.replace(/\/$/, "");
  else wanted.push(a.toLowerCase());
}
const cards = wanted.length ? CARDS.filter((c) => wanted.includes(c.id)) : CARDS;
const unknown = wanted.filter((id) => !CARDS.some((c) => c.id === id));
if (unknown.length) {
  console.error(`Unknown card id: ${unknown.join(", ")}. Known: ${CARDS.map((c) => c.id).join(" ")}`);
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 1400 },
  deviceScaleFactor: 1,
  colorScheme: "light",
  reducedMotion: "reduce",
});
const page = await context.newPage();
const url = `${base}/lab/cards/?raw${safe ? "&safe" : ""}`;
const res = await page.goto(url, { waitUntil: "networkidle" });
if (!res || res.status() !== 200) {
  console.error(`Could not load ${url} (status ${res?.status() ?? "none"}). Is the preview running?`);
  await browser.close();
  process.exit(1);
}
// Fonts and every picture must be ready, or a card is captured half drawn.
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
});
await page.waitForTimeout(300);

for (const card of cards) {
  // Pin the card to the top-left corner of the viewport so it lands on whole pixels
  // (an element screenshot of a card at a fractional page offset comes out 1px too tall and soft).
  await page.evaluate((id) => {
    const s = document.getElementById(id).style;
    Object.assign(s, { position: "fixed", left: "0", top: "0", margin: "0", zIndex: "99999" });
  }, card.id);
  const file = join(outDir, `${card.id}-${card.slug}${safe ? "-safe-outline" : ""}.png`);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: card.w, height: card.h } });
  await page.evaluate((id) => {
    const s = document.getElementById(id).style;
    Object.assign(s, { position: "", left: "", top: "", margin: "", zIndex: "" });
  }, card.id);
  console.log(`${card.w}x${card.h}  ${file}`);
}
await browser.close();
