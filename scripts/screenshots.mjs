// Captures viewport screenshots of public sites. Run: npm run screenshots
import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";

const outDir = fileURLToPath(new URL("../src/assets/screenshots/", import.meta.url));
mkdirSync(outDir, { recursive: true });

const targets = [
  { file: "typing-com.png", urls: ["https://www.typing.com/"] },
  { file: "stjude-cloud.png", urls: ["https://www.stjude.cloud/"] },
  { file: "sprocket-docs.png", urls: ["https://stjudecloud.github.io/sprocket/", "https://sprocket.bio/"] },
  { file: "learngenomics.png", urls: ["https://learngenomics.dev/"] },
  { file: "vsc-ai-utilities.png", urls: ["https://github.com/sgarcia-dev/vsc-ai-utilities"] },
];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: "light",
});

const results = [];
for (const { file, urls } of targets) {
  let done = false;
  for (const url of urls) {
    const page = await context.newPage();
    try {
      const res = await page.goto(url, { waitUntil: "load", timeout: 45000 });
      const status = res?.status() ?? 0;
      if (status !== 200) {
        results.push(`SKIP ${url} (status ${status})`);
        continue;
      }
      await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(1500);
      await page.screenshot({ path: outDir + file, fullPage: false });
      results.push(`OK   ${url} -> ${file}`);
      done = true;
      break;
    } catch (err) {
      results.push(`FAIL ${url} (${err.message.split("\n")[0]})`);
    } finally {
      await page.close();
    }
  }
  if (!done) results.push(`NONE ${file}`);
}
await browser.close();
console.log(results.join("\n"));
