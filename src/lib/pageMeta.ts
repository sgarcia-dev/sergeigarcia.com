/**
 * Title and description of the top-level pages that have no content file. Each page passes these
 * to <Base>, and the social share image (src/lib/ogTargets.ts) reads the same values, so a page
 * and its image can never disagree. After changing one, run `npm run og`.
 */
export const PAGE_META = {
  projects: { title: "Projects", description: "Case studies from Sergei Garcia: tools, products and systems he designed and built." },
  writing: { title: "Writing", description: "Notes from Sergei Garcia on building software, working with AI coding agents and shipping front ends." },
  about: {
    title: "About",
    description:
      "About Sergei Garcia, a software engineer from Mexico living in Dublin, Ireland. 13+ years building web products, a designer's eye, and a love of teaching.",
  },
  work: { title: "Work", description: "Roles and engagements from Sergei Garcia: what he built, who for, and the tools he used." },
  hack: {
    title: "Hack this site",
    description: "Restyle sergeigarcia.com live: pick a look, mix colors, type and shapes, write your own CSS or ask an AI for some, and share it by link.",
  },
  playground: {
    title: "Playground",
    description: "Play with the real motion and texture effects from sergeigarcia.com: band textures, glyph reveal, marker, row sweep and more.",
  },
} as const;

export type PageId = keyof typeof PAGE_META;
