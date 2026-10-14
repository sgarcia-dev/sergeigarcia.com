/**
 * The social link-preview image lab at /lab/social/ (unlisted, noindex).
 * One place for the facts the page, the labels and the later PNG export all read:
 * the five designs, the three samples, the platform frames and a few small helpers.
 * Plain TypeScript with no asset imports, so a Node script can read it too.
 * The drawings are in src/components/social/.
 */
export const OG_W = 1200;
export const OG_H = 630;

/**
 * What survives the crops, measured on the 1200x630 image:
 *   square thumbnail (center crop): x 285 to 915, full height
 *   X large card (2:1, 1200x600):   y 15 to 615, full width
 * Everything important goes in the overlap: x 285 to 915, y 15 to 615.
 */
export const SAFE = { x: 285, w: 630, y: 15, h: 600 } as const;

export type SampleId = "post" | "home" | "page";
export type Kind = "post" | "home" | "page";
export type SafeStatus = "pass" | "degrades";

export interface Design {
  /** s1 to s5. Also the `d` value in /lab/social/?raw&d=s1&s=post */
  id: "s1" | "s2" | "s3" | "s4" | "s5";
  name: string;
  slug: string;
  /** One line on the idea. */
  note: string;
  /** pass = title, name and avatar all sit inside SAFE. degrades = the title and name do, the art does not. */
  safe: SafeStatus;
  /** What the crops do to this design, in plain words. */
  safeNote: string;
}

export const DESIGNS: Design[] = [
  {
    id: "s1",
    name: "S-1 Cover stage",
    slug: "cover-stage",
    note: "The article art fills the top, a cobalt band carries the title. Name chip on the art.",
    safe: "pass",
    safeNote: "Title band and name chip sit in the middle column. Square crop keeps the middle of the art only.",
  },
  {
    id: "s2",
    name: "S-2 Big highlight",
    slug: "big-highlight",
    note: "Huge black serif title on paper with a yellow highlighter swipe. Avatar and name underneath.",
    safe: "pass",
    safeNote: "Everything is centered in the middle column. The side shapes are decoration and can be cut.",
  },
  {
    id: "s3",
    name: "S-3 Split",
    slug: "split",
    note: "Framed art on the left, title and name on the right, a yellow arrow button at the edge.",
    safe: "degrades",
    safeNote: "Title and name stay whole in a square crop, but the art is cut to a sliver and the arrow disappears.",
  },
  {
    id: "s4",
    name: "S-4 Identity card",
    slug: "identity-card",
    note: "A big round headshot, the name, then the title on a black label. Made for square thumbnails.",
    safe: "pass",
    safeNote: "A centered stack. A square crop only trims the colored half-circles on the sides.",
  },
  {
    id: "s5",
    name: "S-5 Type only",
    slug: "type-only",
    note: "Black, white serif title, one yellow block on the key words. Name in small mono type. No picture.",
    safe: "pass",
    safeNote: "Centered text. No avatar by design: the name line is the identity.",
  },
];

export interface Sample {
  id: SampleId;
  /** Label above each group of previews. */
  label: string;
  kind: Kind;
  /** The short headline drawn on the image (3 to 6 words reads best when small). */
  title: string;
  /** Words inside `title` that get the highlight. */
  highlight?: string;
  summary?: string;
  /** What the platform card shows under or beside the image (the page's og:title and description). */
  pageTitle: string;
  description: string;
}

export const SAMPLES: Sample[] = [
  {
    id: "post",
    label: "Post 2: Everyone has the same AI now",
    kind: "post",
    title: "Same AI. The difference is you.",
    highlight: "is you.",
    summary: "AI didn't make you worthless. It made your judgment matter more.",
    pageTitle: "Everyone has the same AI now. The difference is you. | Sergei Garcia",
    description: "AI didn't make you worthless. It made your judgment matter more. It doesn't replace know-how, it multiplies it.",
  },
  {
    id: "home",
    label: "Homepage",
    kind: "home",
    title: "Sergei Garcia",
    highlight: "Garcia",
    summary: "Designer by eye, teacher by habit, engineer by trade.",
    pageTitle: "Sergei Garcia · Designer by eye, teacher by habit, engineer by trade",
    description: "Sergei Garcia, software engineer. Fast, accessible websites, developer tools and AI workflows.",
  },
  {
    id: "page",
    label: "Generic page: Projects",
    kind: "page",
    title: "Projects",
    highlight: "Projects",
    summary: "Tools, products and systems I designed and built.",
    pageTitle: "Projects | Sergei Garcia",
    description: "Case studies from Sergei Garcia: tools, products and systems he designed and built.",
  },
];

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

/** Splits a title around its highlighted words. If the words are not in the title, nothing is highlighted. */
export function splitTitle(title: string, highlight?: string): { before: string; mark: string; after: string } {
  const i = highlight ? title.indexOf(highlight) : -1;
  if (!highlight || i < 0) return { before: title, mark: "", after: "" };
  return { before: title.slice(0, i), mark: highlight, after: title.slice(i + highlight.length) };
}

/**
 * Biggest font size (px, steps of 2) at which the text fits a box when wrapped word by word.
 * It guesses the width of a character as 0.5em, which suits the site's heavy serif. The
 * Playwright check in the packet's verification measures the real text, so a wrong guess shows up.
 */
export function fitSize(
  text: string,
  box: { w: number; h: number },
  opts: { max: number; min?: number; lh?: number; cw?: number; highlight?: string } = { max: 96 },
): number {
  const { max, min = 24, lh = 1.04, cw = 0.5 } = opts;
  // The highlighted words never break across lines (see OgTitle), so they count as one word.
  const flat = opts.highlight && text.includes(opts.highlight) ? text.replace(opts.highlight, opts.highlight.replace(/\s+/g, "_")) : text;
  const words = flat.split(/\s+/).filter(Boolean);
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
