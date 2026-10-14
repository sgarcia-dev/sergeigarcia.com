/**
 * The social link-preview image lab at /lab/social/ (unlisted, noindex).
 * One place for the facts the page, the labels and the later PNG export all read:
 * the designs, the samples' copy rules, the platform frames and a few small helpers.
 * Plain TypeScript with no asset imports, so a Node script can read it too.
 * The drawings are in src/components/social/.
 */
import type { ImageMetadata } from "astro";

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
  /** a1 to a4 for articles, h1 to h4 for the homepage, p1 for generic pages. Also the `d` value in /lab/social/?raw&d=a2&s=<sample id> */
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
}

export const DESIGNS: Design[] = [
  {
    id: "a1",
    name: "A-1 Black poster",
    kind: "post",
    note: "Round 1's type-only design with the site's personality: faint hatch, a yellow highlighter block, avatar and name, a tilted cover sticker on the edge.",
    safe: "pass",
    safeNote: "Title and name are centered. The cover sticker is on the edge and is cut by a square crop.",
    uses: "short title, highlights on",
  },
  {
    id: "a2",
    name: "A-2 Magazine cover",
    kind: "post",
    note: "The article page in miniature: cobalt hatch band with the title, then the cover art tilted below it, like card set B.",
    safe: "pass",
    safeNote: "Title, name and cover all sit in the middle column. Square crops keep everything.",
    uses: "short title, highlights on",
  },
  {
    id: "a3",
    name: "A-3 TL;DR card",
    kind: "post",
    note: "Cobalt hatch, title, and the post's TL;DR box with its yellow label and hard shadow. The cover peeks in from the right.",
    safe: "pass",
    safeNote: "Title, name and TL;DR sit in the middle column. The peeking cover is cut by a square crop.",
    uses: "short title, short TL;DR, highlights on",
  },
  {
    id: "a4",
    name: "A-4 Yellow sticker",
    kind: "post",
    note: "Yellow dots like the homepage, black title with a cobalt highlighter block, a tilted Writing label and the cover on the edge.",
    safe: "pass",
    safeNote: "Title and name are centered. The label and the cover sit on the edges and can be cut.",
    uses: "short title, highlights on",
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
    id: "h2",
    name: "H-2 Cobalt hero",
    kind: "home",
    note: "The cobalt half of the hero, full size: giant white name, tiny avatar with the Dublin tag, tagline with a highlighter mark.",
    safe: "pass",
    safeNote: "Everything is in the middle column. A yellow 13+ years sticker sits on the edge and can be cut.",
    uses: "tagline, highlight on",
  },
  {
    id: "h3",
    name: "H-3 Yellow with ticker",
    kind: "home",
    note: "The yellow half of the hero, full size: giant black name, tagline with a cobalt block, and the black ticker strip from under the hero.",
    safe: "pass",
    safeNote: "Name and tagline are in the middle column. The ticker is decoration, so a crop only shortens it.",
    uses: "tagline, highlight on",
  },
  {
    id: "h4",
    name: "H-4 Stacked bands",
    kind: "home",
    note: "A yellow band with the giant name over a cobalt band with the role, the tiny avatar and the tagline.",
    safe: "pass",
    safeNote: "Both bands run full width and the text sits in the middle column.",
    uses: "tagline, highlight on",
  },
  {
    id: "p1",
    name: "P-1 Page band",
    kind: "page",
    note: "One cheap design for Projects, Writing and About: cobalt hatch, the page name in a yellow block, the page description in a TL;DR style box.",
    safe: "pass",
    safeNote: "Everything is in the middle column.",
    uses: "page title, page description",
  },
];

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
 * and the ticker). The tagline's highlight is a design choice for this lab, not on the live page.
 */
export const HOME = {
  name: "Sergei Garcia",
  tagline: "Designer by eye, teacher by habit, ==engineer by trade.==",
  role: "Software Engineer · 13+ years",
  location: "Dublin, IE",
  ticker: ["Developer tools", "Accessibility", "Web performance", "AI agent workflows", "Writer", "UX and motion", "Mentor", "Speaker", "Full stack"],
  title: "Sergei Garcia · Designer by eye, teacher by habit, engineer by trade",
  description: "Sergei Garcia, software engineer. Designer by eye, teacher by habit, engineer by trade: fast, accessible websites, developer tools and AI workflows.",
} as const;

/** Generic pages: title and description as in each page's <Base> props. */
export const PAGES = [
  { id: "projects", title: "Projects", description: "Case studies from Sergei Garcia: tools, products and systems he designed and built." },
  { id: "writing", title: "Writing", description: "Notes from Sergei Garcia on building software, working with AI coding agents and shipping front ends." },
  { id: "about", title: "About", description: "About Sergei Garcia, a software engineer from Mexico living in Dublin, Ireland. 13+ years building web products, a designer's eye, and a love of teaching." },
] as const;

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
