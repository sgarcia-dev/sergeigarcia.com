/**
 * The samples the social image lab draws: every published post (copy from its frontmatter, see the
 * og fields in src/content.config.ts), the homepage, and the generic pages. Uses astro:content, so
 * it only runs inside Astro.
 */
import { getPosts } from "./content";
import { HOME, PAGES, ogFields, plain, type Sample } from "./social";

export async function getSamples(): Promise<Sample[]> {
  const posts = await getPosts();
  const postSamples: Sample[] = posts.map((p) => ({
    id: p.id,
    kind: "post",
    label: `Post: ${p.data.title}`,
    ...ogFields(p.data),
    cover: p.data.cover,
    pageTitle: `${p.data.title} | Sergei Garcia`,
    description: plain(p.data.summary),
  }));
  const home: Sample = {
    id: "home",
    kind: "home",
    label: "Homepage",
    title: `Sergei ==Garcia==`,
    titleShort: `Sergei ==Garcia==`,
    summary: HOME.tagline,
    summaryShort: HOME.tagline,
    pageTitle: HOME.title,
    description: HOME.description,
  };
  const pages: Sample[] = PAGES.map((pg) => ({
    id: pg.id,
    kind: "page",
    label: `Page: ${pg.title}`,
    title: `==${pg.title}==`,
    titleShort: `==${pg.title}==`,
    summary: pg.description,
    summaryShort: pg.description,
    pageTitle: `${pg.title} | Sergei Garcia`,
    description: pg.description,
  }));
  return [...postSamples, home, ...pages];
}
