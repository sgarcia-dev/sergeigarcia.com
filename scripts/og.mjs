// Makes the social share images (og:image and twitter:image) for every page and saves them to
// public/og/<key>.png, 1200x630. Run it after adding a post, or retitling a post or page:
//
//   npm run og                          build the site, draw every image, prune stale ones
//   npm run og -- about writing/my-post only these keys (the path under public/og, no .png)
//   npm run og -- http://localhost:4382 use a running preview instead of building (it must be
//                                       a build of the current code, with /og-render/ in it)
//
// Commit the images and scripts/og-manifest.json. Deploys never need a browser, and
// tests/og.spec.ts fails if a page has no image or its copy changed since the image was made.
//
// How it works: the list of pages, their design and their copy come from the site itself
// (src/lib/ogTargets.ts, published as /og-render/targets.json). Each page is drawn at
// /og-render/<key>/ and screenshotted at exactly 1200x630. Designs: articles a1t1, home hx3,
// everything else p1 (see src/lib/social.ts and the lab at /lab/social/). Needs Node 22.12+.
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const outRoot = join(root, "public", "og");
const manifestPath = join(root, "scripts", "og-manifest.json");
const MAX_BYTES = 300 * 1024;

const args = process.argv.slice(2);
const given = args.find((a) => /^https?:\/\//.test(a));
const wanted = args.filter((a) => a !== given).map((a) => a.replace(/^\/+|\/+$|\.png$/g, ""));

let base = given?.replace(/\/$/, "");
let server;
let buildDir;
if (!base) {
  buildDir = mkdtempSync(join(tmpdir(), "og-build-"));
  console.log("Building the site...");
  const r = spawnSync("npx", ["astro", "build", "--outDir", buildDir], { cwd: root, stdio: ["ignore", "ignore", "inherit"], env: { ...process.env, OG_BUILD: "1" } });
  if (r.status !== 0) {
    console.error("The build failed, so no images were made.");
    process.exit(1);
  }
  server = await serve(buildDir);
  base = `http://127.0.0.1:${server.address().port}`;
}

try {
  const res = await fetch(`${base}/og-render/targets.json`);
  if (!res.ok) throw new Error(`${base}/og-render/targets.json answered ${res.status}. Is this a current build?`);
  const all = await res.json();
  const unknown = wanted.filter((k) => !all.some((t) => t.key === k));
  if (unknown.length) throw new Error(`Unknown key: ${unknown.join(", ")}. Known: ${all.map((t) => t.key).join(" ")}`);
  const targets = wanted.length ? all.filter((t) => wanted.includes(t.key)) : all;

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
  let total = 0;
  let tooBig = 0;

  for (const t of targets) {
    const r = await page.goto(`${base}/og-render/${t.key}/`, { waitUntil: "networkidle" });
    if (!r || r.status() !== 200) throw new Error(`Could not load /og-render/${t.key}/ (status ${r?.status() ?? "none"})`);
    // Fonts and pictures must be ready, or the image is captured half drawn.
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
    });
    const shot = await page.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 630 } });
    // Mostly flat colors, so a palette PNG is far smaller than a true-color one.
    const png = await sharp(shot).png({ palette: true, quality: 95, effort: 10, dither: 0.6 }).toBuffer();
    const file = join(outRoot, `${t.key}.png`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, png);
    manifest[t.key] = t.hash;
    total += png.length;
    const kb = Math.round(png.length / 1024);
    if (png.length > MAX_BYTES) tooBig++;
    console.log(`${t.design.padEnd(5)} ${String(kb).padStart(4)} KB  public/og/${t.key}.png${png.length > MAX_BYTES ? "  (over 300 KB)" : ""}`);
  }
  await browser.close();

  if (!wanted.length) {
    // A full run also removes images and manifest entries for pages that no longer exist.
    const keys = new Set(all.map((t) => t.key));
    for (const k of Object.keys(manifest)) if (!keys.has(k)) delete manifest[k];
    for (const f of walk(outRoot)) {
      const key = f.slice(outRoot.length + 1).replace(/\.png$/, "");
      if (f.endsWith(".png") && !keys.has(key)) {
        rmSync(f);
        console.log(`removed stale public/og/${key}.png`);
      }
    }
  }
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(manifestPath, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`\n${targets.length} images, ${Math.round(total / 1024)} KB in total.${tooBig ? ` ${tooBig} over 300 KB.` : ""}`);
  if (tooBig) process.exitCode = 1;
} catch (err) {
  console.error(String(err.message ?? err));
  process.exitCode = 1;
} finally {
  server?.close();
  if (buildDir) rmSync(buildDir, { recursive: true, force: true });
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

// A tiny static file server for a built site, so the script needs no preview process.
function serve(dir) {
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif" };
  return new Promise((resolve) => {
    const s = createServer((req, res) => {
      let p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
      if (p.endsWith("/")) p += "index.html";
      const f = join(dir, p);
      if (!f.startsWith(dir) || !existsSync(f) || statSync(f).isDirectory()) {
        res.writeHead(404).end("not found");
        return;
      }
      res.writeHead(200, { "Content-Type": types[extname(f)] ?? "application/octet-stream" }).end(readFileSync(f));
    });
    s.listen(0, "127.0.0.1", () => resolve(s));
  });
}
