// Renders public/og-default.png (1200x630). Run: npm run og
import { chromium } from "@playwright/test";
import { pathToFileURL, fileURLToPath } from "node:url";
import { resolve, join } from "node:path";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

const root = fileURLToPath(new URL("../", import.meta.url));
const fraunces = pathToFileURL(
  resolve(root, "node_modules/@fontsource-variable/fraunces/files/fraunces-latin-opsz-normal.woff2"),
).href;
const mono = pathToFileURL(
  resolve(root, "node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2"),
).href;

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face { font-family: "Fraunces OG"; src: url("${fraunces}") format("woff2"); font-weight: 100 900; }
@font-face { font-family: "Mono OG"; src: url("${mono}") format("woff2"); font-weight: 700; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; background: #0A0A0A; }
.frame { width: 1200px; height: 630px; border: 6px solid #0A0A0A; display: flex; }
.left { width: 58.3333%; background: #FFD400; border-right: 6px solid #0A0A0A; padding: 0 0 0 56px; display: flex; align-items: center; }
.name { font-family: "Fraunces OG", serif; font-weight: 900; font-variation-settings: "opsz" 144;
  font-size: 190px; line-height: 0.92; letter-spacing: -0.02em; color: #0A0A0A; }
.right { flex: 1; background: #1F3FD1; color: #fff; padding: 56px 40px; display: flex; flex-direction: column; justify-content: space-between; }
.role { font-family: "Fraunces OG", serif; font-weight: 700; font-variation-settings: "opsz" 72; font-size: 44px; line-height: 1.1; }
.meta { font-family: "Mono OG", monospace; font-weight: 700; font-size: 22px; line-height: 1.6; }
</style></head><body><div class="frame">
<div class="left"><div class="name">Sergei<br>Garcia</div></div>
<div class="right">
<div class="role">Senior software engineer</div>
<div class="meta">Dublin, Ireland<br>sergeigarcia.com</div>
</div></div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
// Load from a file:// page so file:// font URLs are allowed (about:blank blocks them).
const tmp = mkdtempSync(join(tmpdir(), "og-"));
const htmlPath = join(tmp, "og.html");
writeFileSync(htmlPath, html);
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
await page.evaluate(() => document.fonts.load('900 20px "Fraunces OG"').then(() => document.fonts.load('700 20px "Mono OG"')));
await page.waitForTimeout(300);
await page.screenshot({ path: resolve(root, "public/og-default.png") });
const fontsOk = await page.evaluate(() => [...document.fonts].every((f) => f.status === "loaded"));
await browser.close();
rmSync(tmp, { recursive: true, force: true });
if (!fontsOk) throw new Error("OG fonts failed to load");
console.log("wrote public/og-default.png");
