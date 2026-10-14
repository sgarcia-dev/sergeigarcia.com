/**
 * The LinkedIn image cards on the unlisted lab page /lab/cards/.
 * One list, so the page, the labels and scripts/cards.mjs all read the same facts.
 * To add a card: add a row here, then draw it in the matching set component in
 * src/components/cards/ using <CardEntry id="...">.
 */
export type CardSet = "a" | "b" | "c";
/** posted = it went out on LinkedIn. candidate = still in the running. rejected = decided against. */
export type CardStatus = "posted" | "candidate" | "rejected";

export interface Card {
  /** Lowercase, no dashes: a1, b8, b8sq, c4b. Also the element id, so /lab/cards/?raw#b8 jumps to it. */
  id: string;
  set: CardSet;
  /** Label shown above the card. */
  name: string;
  /** Used in the PNG file name: <id>-<slug>.png */
  slug: string;
  status: CardStatus;
  /** Slug of the post the card promotes. */
  post: string;
  /** One line on the idea. */
  note: string;
  /** Pixel size of the card. Most are 1080x1350. */
  w: number;
  h: number;
  /** Debug outline (?safe on the page): the area that must hold everything important if LinkedIn crops the image. */
  safe?: { top: number; height: number };
}

export const CARD_SETS: { id: CardSet; title: string; blurb: string }[] = [
  { id: "a", title: "A. Text-led", blurb: "Big type only. No picture." },
  { id: "b", title: "B. Article preview", blurb: "Looks like the top of the post: title band, TL;DR box, cover art." },
  { id: "c", title: "C. Collage", blurb: "Paper, stickers and pen marks, like a marked-up draft." },
];

const POST = "ai-raises-the-floor";
const base = { post: POST, w: 1080, h: 1350 } as const;

export const CARDS: Card[] = [
  { ...base, id: "a1", set: "a", name: "A-1 Cobalt hook", slug: "cobalt-hook", status: "candidate", note: "Cobalt, big white hook, the answer on a yellow block." },
  { ...base, id: "a2", set: "a", name: "A-2 Strike on paper", slug: "strike-paper", status: "candidate", note: "“AI made me worthless” crossed out, the fix highlighted." },
  { ...base, id: "a3", set: "a", name: "A-3 Strike on black", slug: "strike-black", status: "candidate", note: "Same idea as A-2 in black and yellow." },
  { ...base, id: "a4", set: "a", name: "A-4 Slop on yellow", slug: "slop-yellow", status: "candidate", note: "A different line from the post: slop is a communication problem." },

  { ...base, id: "b1", set: "b", name: "B-1 Magazine cover", slug: "magazine-cover", status: "candidate", note: "Cobalt title band with the cover art tilted below it." },
  { ...base, id: "b1b", set: "b", name: "B-1b Magazine cover, pick-one art", slug: "magazine-cover-p7", status: "candidate", note: "B-1 with the “pick one” picture as the art." },
  { ...base, id: "b2", set: "b", name: "B-2 TL;DR", slug: "tldr", status: "candidate", note: "Title band, a TL;DR box, only a peek of the cover." },
  { ...base, id: "b3", set: "b", name: "B-3 Pull quote", slug: "pullquote", status: "candidate", note: "Title and one yellow pull quote. No picture." },
  { ...base, id: "b4", set: "b", name: "B-4 Yellow cover", slug: "yellow-cover", status: "candidate", note: "B-1 in yellow." },
  { ...base, id: "b5", set: "b", name: "B-5 Cobalt, all four", slug: "all-four-cobalt", status: "candidate", note: "Title, yellow answer line, TL;DR box and pick-one art together." },
  { ...base, id: "b6", set: "b", name: "B-6 No TL;DR box", slug: "no-tldr-box", status: "candidate", note: "B-5 without the TL;DR. The answer sits in a tilted yellow box." },
  { ...base, id: "b7", set: "b", name: "B-7 Yellow, all four", slug: "all-four-yellow", status: "candidate", note: "B-5 in yellow." },
  { ...base, id: "b8", set: "b", name: "B-8 Cobalt TL;DR", slug: "cobalt-tldr", status: "candidate", note: "B-5 with the longer TL;DR (adds the know-how line). Portrait 4:5.", safe: { top: 135, height: 1080 } },
  { ...base, id: "b8sq", set: "b", name: "B-8sq Cobalt TL;DR, square", slug: "cobalt-tldr-square", status: "posted", note: "B-8 redrawn at 1:1 so a LinkedIn crop cannot cut text. Safe box 1080x900.", h: 1080, safe: { top: 90, height: 900 } },
  { ...base, id: "b8p", set: "b", name: "B-8p Cobalt TL;DR, slightly portrait", slug: "cobalt-tldr-portrait", status: "candidate", note: "Same as B-8sq on a 1080x1200 canvas. Safe box 1080x900.", h: 1200, safe: { top: 150, height: 900 } },

  { ...base, id: "c1", set: "c", name: "C-1 Marked-up draft", slug: "marked-up-draft", status: "candidate", note: "Old lines struck out on a taped page, the answer on top. Cobalt desk." },
  { ...base, id: "c2", set: "c", name: "C-2 Options stack", slug: "options-stack", status: "candidate", note: "Title over a stack of swatch options, most crossed out, one circled." },
  { ...base, id: "c3", set: "c", name: "C-3 Decision sticker", slug: "decision-sticker", status: "candidate", note: "A big sticker, “Every decision was mine”, over a pile of rejected options." },
  { ...base, id: "c4", set: "c", name: "C-4 Decision sticker, orange and black", slug: "decision-sticker-orange-black", status: "candidate", note: "C-3 in orange, black and paper." },
  { ...base, id: "c4b", set: "c", name: "C-4b Marked-up draft, orange and black", slug: "marked-up-draft-orange-black", status: "candidate", note: "C-1 in orange and black." },
];

export const cardById = (id: string): Card => {
  const card = CARDS.find((c) => c.id === id);
  if (!card) throw new Error(`Unknown card id: ${id}`);
  return card;
};
