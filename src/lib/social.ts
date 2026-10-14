/**
 * The social link-preview image lab at /lab/social/ (unlisted, noindex).
 * One place for the facts the page, the labels and the later PNG export all read:
 * the designs, the samples' copy rules, the platform frames and a few small helpers.
 * Plain TypeScript with no asset imports, so a Node script can read it too.
 * The drawings are in src/components/social/.
 */
import type { ImageMetadata } from "astro";
import { SITE } from "./site";
import { PAGE_META } from "./pageMeta";

export const OG_W = 1200;
export const OG_H = 630;

/**
 * What survives the crops, measured on the 1200x630 image:
 *   square thumbnail (center crop): x 285 to 915, full height
 *   X large card (2:1, 1200x600):   y 15 to 615, full width
 * Everything important goes in the overlap: x 285 to 915, y 15 to 615.
 */
export const SAFE = { x: 285, w: 630, y: 15, h: 600 } as const;

export type Kind = "post" | "home" | "page";
export type SafeStatus = "pass" | "degrades";

export interface Design {
  /** a1 and a1t1 to a1t3 for articles, h1 and hx1 to hx3 for the homepage, p1 for generic pages. Also the `d` value in /lab/social/?raw&d=a1t1&s=<sample id> */
  id: string;
  /** Which kind of page the design is for. */
  kind: Kind;
  name: string;
  /** One line on the idea. */
  note: string;
  safe: SafeStatus;
  /** What the crops do to this design, in plain words. */
  safeNote: string;
  /** Which copy the design draws, so the page can say it. */
  uses: string;
  /** The owner's pick for this kind of page. The others stay as alternates. */
  chosen?: boolean;
}

export const DESIGNS: Design[] = [
  {
    id: "a1",
    name: "A-1 Black poster",
    kind: "post",
    note: "Black poster with the site's hatch. Full title on top, avatar and name bottom left, the cover big at the bottom right with a yellow hard shadow.",
    safe: "degrades",
    safeNote: "Title and name fill the middle square. The cover runs off the right edge, so a square crop shows its left 60%, which still has the robot and the grid.",
    uses: "title (full unless it does not fit), highlights on",
  },
  {
    id: "a1t1",
    chosen: true,
    name: "A-1 T1 TL;DR under the title",
    kind: "post",
    note: "A-1 with the long TL;DR box right under the title. Avatar and name on a row below it, the cover tucked under the box corner at the bottom right.",
    safe: "degrades",
    safeNote: "Title, TL;DR and name fill the middle square. A square crop shows about the left half of the cover.",
    uses: "title (full unless it does not fit), long TL;DR, highlights on",
  },
  {
    id: "a1t2",
    name: "A-1 T2 TL;DR beside the cover",
    kind: "post",
    note: "A-1 with the short TL;DR box on the left and the cover on the right of it, under the title. Avatar and name under the box.",
    safe: "degrades",
    safeNote: "Title, TL;DR and name are inside the square. A square crop shows about half of the cover.",
    uses: "title (full unless it does not fit), short TL;DR, highlights on",
  },
  {
    id: "a1t3",
    name: "A-1 T3 TL;DR on the cover corner",
    kind: "post",
    note: "A-1 with the short TL;DR as a tilted card laid over the lower left corner of the cover. Avatar column as in A-1.",
    safe: "degrades",
    safeNote: "Title, name and the TL;DR card are inside the square. The cover's right side is cut by a square crop.",
    uses: "title (full unless it does not fit), short TL;DR, highlights on",
  },
  {
    id: "h1",
    name: "H-1 Hero split",
    kind: "home",
    note: "The homepage hero as an image: yellow and cobalt halves with dots, the giant name changes color where it crosses the seam. Tiny avatar, tagline on a black label.",
    safe: "pass",
    safeNote: "The name and tagline sit in the middle 600px. The split seam is exactly in the middle, so any crop keeps it.",
    uses: "tagline, highlight on",
  },
  {
    id: "hx1",
    name: "H-X1 Hero split + sticker",
    kind: "home",
    note: "H-1 with the yellow 13+ years sticker from H-2 on the right edge.",
    safe: "pass",
    safeNote: "Same as H-1. The sticker is on the edge and is cut by a square crop, which is fine.",
    uses: "tagline, highlight on",
  },
  {
    id: "hx2",
    name: "H-X2 Hero split + ticker",
    kind: "home",
    note: "H-1 with a static black strip along the bottom: three phrases, centered, same square separator as the homepage ticker. The tiny avatar moves to the right of the name.",
    safe: "pass",
    safeNote: "Name, tagline, avatar and the three ticker phrases all sit in the middle square. A square crop only shortens the black strip.",
    uses: "tagline, highlight on",
  },
  {
    id: "hx3",
    chosen: true,
    name: "H-X3 Hero split + sticker + ticker",
    kind: "home",
    note: "Both: the 13+ years sticker and the three-phrase strip on H-1.",
    safe: "pass",
    safeNote: "Same as H-X2: the strip text is inside the square. The sticker is on the edge and can be cut.",
    uses: "tagline, highlight on",
  },
  {
    id: "p1",
    chosen: true,
    name: "P-1 Page band",
    kind: "page",
    note: "One cheap design for Projects, Writing and About: cobalt hatch, the page name in a yellow block, the page description in a TL;DR style box.",
    safe: "pass",
    safeNote: "Everything is in the middle column.",
    uses: "page title, page description",
  },
];

/** The design each kind of page opens on in the lab, and its first sample. */
export const DEFAULT_DESIGN: Record<Kind, string> = { post: "a1t1", home: "hx3", page: "p1" };

export interface Sample {
  /** Post slug, or home, projects, writing, about. Also the `s` value in the raw view. */
  id: string;
  kind: Kind;
  /** Label above each group of previews. */
  label: string;
  /** Full title, may carry ==highlight== markers. */
  title: string;
  /** Short title (3 to 6 words reads best when small), may carry markers. */
  titleShort: string;
  /** TL;DR or description, may carry markers. */
  summary: string;
  summaryShort: string;
  cover?: ImageMetadata;
  /** What the platform cards show next to the image (the page's og:title and description, no markers). */
  pageTitle: string;
  description: string;
}

/** The same fallbacks the posts schema documents (src/content.config.ts). */
export function ogFields(d: { title: string; summary: string; ogTitle?: string; ogTitleShort?: string; ogSummary?: string; ogSummaryShort?: string }) {
  const title = d.ogTitle ?? d.title;
  const titleShort = d.ogTitleShort ?? title;
  const summary = d.ogSummary ?? d.summary;
  const summaryShort = d.ogSummaryShort ?? summary;
  return { title, titleShort, summary, summaryShort };
}

/**
 * Homepage copy that is not in a content file. Keep in sync with src/pages/index.astro (the hero
 * only). The tagline's highlight is a design choice for this lab, not on the live page.
 */
export const HOME = {
  name: "Sergei Garcia",
  tagline: "Designer by eye, teacher by habit, ==engineer by trade.==",
  role: "Software Engineer · 13+ years",
  /** The tag next to the tiny avatar. One value, in SITE.locationTag; empty hides it. */
  location: SITE.locationTag as string,
  /** The three phrases on the static strip along the bottom of H-X2 and H-X3. Keep it to 3 short items: they are centered, never cut, and must fit the middle 630px. Swap them here. */
  ticker: ["AI agent workflows", "Accessibility", "Developer tools"],
  title: SITE.title,
  description: SITE.description,
} as const;

/** The generic pages the lab draws: title and description come from src/lib/pageMeta.ts, the same values the pages use. */
export const PAGES = (["projects", "writing", "about"] as const).map((id) => ({ id, ...PAGE_META[id] }));

const MARK = /==(?=\S)(.+?)(?<=\S)==/g;
/** Text without the == markers. */
export function plain(text: string): string {
  return text.replace(MARK, "$1");
}
/** Text cut into plain and highlighted runs. */
export function segments(text: string): { text: string; mark: boolean }[] {
  const out: { text: string; mark: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(MARK)) {
    if (m.index! > last) out.push({ text: text.slice(last, m.index!), mark: false });
    out.push({ text: m[1], mark: true });
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), mark: false });
  return out;
}

export type FrameKind =
  | "linkedin"
  | "x-large"
  | "x-summary"
  | "facebook"
  | "slack"
  | "discord"
  | "imessage"
  | "whatsapp"
  | "mastodon";

export interface Frame {
  id: string;
  name: string;
  kind: FrameKind;
  /** Pixel size of the image slot inside the platform card. The 1200x630 art is scaled to cover it and centered, like object-fit: cover. */
  img: { w: number; h: number };
  /** Total card width in px. */
  w: number;
  /** What the platform does, in one line. */
  note: string;
}

export const FRAMES: Frame[] = [
  { id: "linkedin-desktop", name: "LinkedIn feed, desktop", kind: "linkedin", img: { w: 555, h: 290 }, w: 555, note: "1.91:1 image on top, title and domain under it. About 555px wide." },
  { id: "linkedin-mobile", name: "LinkedIn feed, mobile", kind: "linkedin", img: { w: 360, h: 188 }, w: 360, note: "Same card at about 360px wide." },
  { id: "x-large", name: "X large card", kind: "x-large", img: { w: 506, h: 253 }, w: 506, note: "Cropped to 2:1. Title sits on the image, bottom left." },
  { id: "x-summary", name: "X summary, square thumb", kind: "x-summary", img: { w: 125, h: 125 }, w: 506, note: "Center square crop beside the text." },
  { id: "facebook", name: "Facebook", kind: "facebook", img: { w: 500, h: 262 }, w: 500, note: "1.91:1 image, grey text bar under it." },
  { id: "slack", name: "Slack", kind: "slack", img: { w: 360, h: 189 }, w: 400, note: "Image about 360px wide under the title and description." },
  { id: "discord", name: "Discord", kind: "discord", img: { w: 400, h: 210 }, w: 432, note: "Dark embed, image about 400px wide." },
  { id: "imessage", name: "iMessage", kind: "imessage", img: { w: 300, h: 157 }, w: 300, note: "Image on top, grey text block under it." },
  { id: "whatsapp", name: "WhatsApp, small thumb", kind: "whatsapp", img: { w: 88, h: 88 }, w: 340, note: "Small square thumbnail in a chat bubble." },
  { id: "mastodon", name: "Mastodon, 120px square", kind: "mastodon", img: { w: 120, h: 120 }, w: 420, note: "Square 120px thumbnail beside the text." },
];

/** CSS custom properties that place the 1200x630 art inside an image slot, cropped like object-fit: cover, centered. */
export function placeStyle(img: { w: number; h: number }): string {
  const s = Math.max(img.w / OG_W, img.h / OG_H);
  const tx = (img.w - OG_W * s) / 2;
  const ty = (img.h - OG_H * s) / 2;
  return `--s:${s.toFixed(5)};--tx:${tx.toFixed(2)}px;--ty:${ty.toFixed(2)}px`;
}

/**
 * Biggest font size (px, steps of 2) at which the text fits a box when wrapped word by word.
 * It guesses the width of a character as 0.5em, which suits the site's heavy serif. The
 * Playwright check in the packet's verification measures the real text, so a wrong guess shows up.
 */
export function fitSize(
  text: string,
  box: { w: number; h: number },
  opts: { max: number; min?: number; lh?: number; cw?: number } = { max: 96 },
): number {
  const { max, min = 24, lh = 1.04, cw = 0.5 } = opts;
  const words = plain(text).split(/\s+/).filter(Boolean);
  for (let size = max; size >= min; size -= 2) {
    const perLine = Math.floor(box.w / (size * cw));
    if (words.some((w) => w.length > perLine)) continue;
    let lines = 1;
    let cur = 0;
    for (const w of words) {
      const add = (cur ? 1 : 0) + w.length;
      if (cur + add > perLine) {
        lines++;
        cur = w.length;
      } else cur += add;
    }
    if (lines * size * lh <= box.h) return size;
  }
  return min;
}

/** The title box each design gives its title. chooseTitle() fits the full title into it. */
export interface TitleSpec {
  w: number;
  h: number;
  /** Biggest font size to try, in px. */
  max: number;
  /** Smallest font size that still counts as readable. Below this the full title is not used. */
  min: number;
  lh: number;
  cw?: number;
}
export const TITLE_SPECS: Record<string, TitleSpec> = {
  a1: { w: 600, h: 268, max: 96, min: 58, lh: 1 },
  a1t1: { w: 600, h: 224, max: 96, min: 58, lh: 1 },
  a1t2: { w: 600, h: 224, max: 96, min: 58, lh: 1 },
  a1t3: { w: 600, h: 250, max: 96, min: 58, lh: 1 },
};

export interface TitleChoice {
  text: string;
  size: number;
  variant: "full" | "short";
}

/** Biggest size at which the text fits the box, or null when even the smallest readable size does not fit. */
function tryFit(text: string, spec: TitleSpec): number | null {
  const words = plain(text).split(/\s+/).filter(Boolean);
  const cw = spec.cw ?? 0.45;
  for (let size = spec.max; size >= spec.min; size -= 2) {
    const perLine = Math.floor(spec.w / (size * cw));
    if (words.some((w) => w.length > perLine)) continue;
    let lines = 1;
    let cur = 0;
    for (const w of words) {
      const add = (cur ? 1 : 0) + w.length;
      if (cur + add > perLine) {
        lines++;
        cur = w.length;
      } else cur += add;
    }
    if (lines * size * spec.lh <= spec.h) return size;
  }
  return null;
}

/**
 * The full title (ogTitle) is the default. It is used when it fits the box at the readable minimum
 * or bigger. Otherwise the short title is used, at the biggest size that fits.
 */
export function chooseTitle(s: { title: string; titleShort: string }, spec: TitleSpec): TitleChoice {
  const full = tryFit(s.title, spec);
  if (full !== null) return { text: s.title, size: full, variant: "full" };
  const short = tryFit(s.titleShort, spec);
  if (short !== null) return { text: s.titleShort, size: short, variant: "short" };
  return { text: s.titleShort, size: fitSize(s.titleShort, spec, { max: spec.max, min: 24, lh: spec.lh, cw: spec.cw ?? 0.45 }), variant: "short" };
}
