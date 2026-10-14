import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { test, expect } from "@playwright/test";

// Every page has its own social share image (og:image and twitter:image), made by `npm run og`.
// These checks read the built site in dist/ and the committed images in public/og/.
// They do not depend on light or dark mode, so they run once.
test.skip(({ colorScheme }) => colorScheme !== "light", "same result in both color schemes");

const SITE = "https://sergeigarcia.com";
const DIST = "dist";
// No image of their own: the 404 page and unlisted pages keep the default card.
const NO_IMAGE = (route: string) => route === "/404.html" || route.startsWith("/lab/") || route.startsWith("/og-render/");

function builtRoutes(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith(".html")) {
        const rel = "/" + relative(DIST, p).replace(/\\/g, "/");
        out.push(rel.endsWith("/index.html") ? rel.slice(0, -"index.html".length) : rel);
      }
    }
  };
  walk(DIST);
  return out.sort();
}

function metaContent(html: string, attr: "property" | "name", key: string): string | undefined {
  const tag = html.match(new RegExp(`<meta[^>]*\\b${attr}="${key}"[^>]*>`))?.[0];
  return tag?.match(/\bcontent="([^"]*)"/)?.[1];
}

/** Width and height of a PNG, read from its header. */
function pngSize(file: string): { w: number; h: number } | undefined {
  const b = readFileSync(file);
  if (b.length < 24 || b.readUInt32BE(0) !== 0x89504e47) return undefined;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

test("every built page points og:image and twitter:image at its own 1200x630 file", () => {
  const routes = builtRoutes().filter((r) => !NO_IMAGE(r));
  expect(routes.length, "pages found in dist (did the build run?)").toBeGreaterThan(10);
  const problems: string[] = [];

  for (const route of routes) {
    const file = route.endsWith("/") ? `${route}index.html` : route;
    const html = readFileSync(join(DIST, file), "utf8");
    const og = metaContent(html, "property", "og:image");
    const tw = metaContent(html, "name", "twitter:image");
    const bad: string[] = [];
    if (!og) bad.push("no og:image");
    else {
      if (!og.startsWith(`${SITE}/og/`)) bad.push(`og:image is ${og}, not an image under ${SITE}/og/ (run: npm run og)`);
      const path = join(DIST, og.replace(SITE, ""));
      if (!existsSync(path)) bad.push(`${og} is not in dist`);
      else {
        const size = pngSize(path);
        if (size?.w !== 1200 || size?.h !== 630) bad.push(`${og} is ${size?.w}x${size?.h}, not 1200x630`);
      }
    }
    if (tw !== og) bad.push(`twitter:image (${tw}) differs from og:image (${og})`);
    if (metaContent(html, "property", "og:image:width") !== "1200") bad.push("og:image:width is not 1200");
    if (metaContent(html, "property", "og:image:height") !== "630") bad.push("og:image:height is not 630");
    if (!metaContent(html, "property", "og:image:alt")?.trim()) bad.push("og:image:alt is empty");
    if (metaContent(html, "name", "twitter:card") !== "summary_large_image") bad.push("twitter:card is not summary_large_image");
    if (bad.length) problems.push(`${route}\n  - ${bad.join("\n  - ")}`);
  }
  expect(problems, `\n${problems.join("\n")}\n`).toEqual([]);
});

test("the 404 and lab pages keep the default card", () => {
  for (const file of ["404.html", "lab/social/index.html", "lab/cards/index.html"]) {
    const html = readFileSync(join(DIST, file), "utf8");
    expect(metaContent(html, "property", "og:image"), file).toBe(`${SITE}/og-default.png`);
  }
});

test("every page and post has an up-to-date image in public/og (after adding or retitling a post, run: npm run og)", async ({ request }) => {
  const res = await request.get("/og-render/targets.json");
  expect(res.ok(), "/og-render/targets.json").toBe(true);
  const targets: { key: string; path: string; design: string; hash: string }[] = await res.json();
  expect(targets.length).toBeGreaterThan(10);

  const manifest: Record<string, string> = JSON.parse(readFileSync("scripts/og-manifest.json", "utf8"));
  const missing: string[] = [];
  const stale: string[] = [];
  for (const t of targets) {
    const file = join("public", "og", `${t.key}.png`);
    if (!existsSync(file)) missing.push(`${t.path}  (public/og/${t.key}.png)`);
    else if (manifest[t.key] !== t.hash) stale.push(`${t.path}  (its title, summary or cover changed since the image was made)`);
  }
  const fix = "Run `npm run og` and commit public/og/ and scripts/og-manifest.json.";
  expect(missing, `No social image for:\n${missing.join("\n")}\n${fix}`).toEqual([]);
  expect(stale, `Out-of-date social image for:\n${stale.join("\n")}\n${fix}`).toEqual([]);
});
