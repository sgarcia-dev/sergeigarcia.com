/**
 * Every page that gets its own social share image (og:image and twitter:image), and which design
 * draws it. This is the one list the render route (src/pages/og-render/), the target list the
 * export script reads (src/pages/og-render/targets.json.ts) and Base.astro (the meta tags) all use.
 * Copy comes from the content files and src/lib/pageMeta.ts, never typed again here.
 *
 *   articles (src/content/posts)        design a1t1
 *   homepage                            design hx3
 *   other pages and entries             design p1
 *   anything else (404, lab pages)      no image, Base falls back to /og-default.png
 *
 * Images are made by `npm run og` (scripts/og.mjs) and committed to public/og/<key>.png.
 * Uses astro:content, so it only runs inside Astro.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { getProjects, getWork } from "./content";
import { SITE } from "./site";
import { PAGE_META } from "./pageMeta";
import { HOME, plain, type Sample } from "./social";
import { getSamples, pageSample } from "./socialSamples";

export const OG_DESIGNS = { post: "a1t1", home: "hx3", page: "p1" } as const;

export interface OgTarget {
  /** Image path without extension, e.g. "home", "about", "writing/<slug>". File: public/og/<key>.png */
  key: string;
  /** The page's address, e.g. "/writing/<slug>/". */
  path: string;
  /** Design id from src/lib/social.ts. */
  design: string;
  sample: Sample;
  /** Alt text for og:image:alt. */
  alt: string;
  /** Fingerprint of everything the image is drawn from. Changes when the copy or the cover changes. */
  hash: string;
}

let cache: Promise<OgTarget[]> | undefined;

export function getOgTargets(): Promise<OgTarget[]> {
  cache ??= build();
  return cache;
}

function make(key: string, path: string, design: string, sample: Sample, alt: string): OgTarget {
  const input = {
    design,
    title: sample.title,
    titleShort: sample.titleShort,
    summary: sample.summary,
    summaryShort: sample.summaryShort,
    cover: sample.cover?.src,
    // Homepage-only copy that the design reads from HOME.
    ...(design.startsWith("h") ? { home: HOME } : {}),
  };
  const hash = createHash("sha1").update(JSON.stringify(input)).digest("hex").slice(0, 12);
  return { key, path, design, sample: { ...sample, id: key }, alt, hash };
}

async function build(): Promise<OgTarget[]> {
  const base = await getSamples(); // posts, home, projects, writing, about
  const out: OgTarget[] = [];

  const home = base.find((s) => s.id === "home")!;
  out.push(make("home", "/", OG_DESIGNS.home, home, plain(HOME.title)));

  // Pages with no content file. Their copy is in src/lib/pageMeta.ts.
  for (const id of Object.keys(PAGE_META) as (keyof typeof PAGE_META)[]) {
    const meta = PAGE_META[id];
    const sample = base.find((s) => s.id === id) ?? pageSample(id, meta.title, meta.description);
    out.push(make(id, `/${id}/`, OG_DESIGNS.page, sample, meta.title));
  }

  for (const s of base.filter((s) => s.kind === "post")) {
    out.push(make(`writing/${s.id}`, `/writing/${s.id}/`, OG_DESIGNS.post, s, plain(s.title)));
  }

  for (const e of await getProjects()) {
    const sample = pageSample(e.id, e.data.title, e.data.summary);
    out.push(make(`projects/${e.id}`, `/projects/${e.id}/`, OG_DESIGNS.page, sample, e.data.title));
  }

  // A work page's headline is the company, so the image uses it too.
  for (const e of await getWork()) {
    const sample = pageSample(e.id, e.data.company, e.data.summary);
    out.push(make(`work/${e.id}`, `/work/${e.id}/`, OG_DESIGNS.page, sample, e.data.company));
  }

  return out;
}

/** Site path of a target's image. */
export const ogImagePath = (key: string) => `/og/${key}.png`;

/** True when the committed image for this key is on disk (public/og/<key>.png). */
export function ogImageExists(key: string): boolean {
  return existsSync(join(process.cwd(), "public", "og", `${key}.png`));
}

/** Absolute URL of a page's own share image, or undefined when it has none yet. For JSON-LD. */
export async function ogImageUrl(pathname: string): Promise<string | undefined> {
  const t = await findOgTarget(pathname);
  return t && ogImageExists(t.key) ? new URL(ogImagePath(t.key), SITE.url).href : undefined;
}

/** The target for a page address like "/about/", or undefined for pages with no image of their own. */
export async function findOgTarget(pathname: string): Promise<OgTarget | undefined> {
  return (await getOgTargets()).find((t) => t.path === pathname);
}
