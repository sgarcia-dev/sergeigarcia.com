import { SITE, type Availability } from "./site";

/**
 * Words for the end-of-post author card. Each line is split in three so the card can put the
 * highlighter on the middle part. Joined, `before + mark + after` is the exact sentence.
 * "off" has no copy: the card renders nothing at all.
 */
type Line = { before: string; mark: string; after: string };

const LINES: Record<Exclude<Availability, "off">, Line> = {
  looking: {
    before: "If this post resonated and your team is hiring, ",
    mark: "let's talk",
    after: ". I'm currently looking for my next role.",
  },
  open: {
    before: "Always happy to hear about ",
    mark: "interesting work",
    after: " in developer tools and AI.",
  },
};

export function authorLine(mode: Availability): Line | null {
  return mode === "off" ? null : LINES[mode];
}

/** Reused from the home hero (src/pages/index.astro). */
export const AUTHOR = {
  name: SITE.name,
  role: "Software Engineer",
  tagline: "Designer by eye, teacher by habit, engineer by trade.",
  // The home page is the strongest About section, so "More about me" goes there.
  moreHref: "/",
  mailHref: `mailto:${SITE.email}`,
  linkedin: SITE.links.linkedin,
} as const;
