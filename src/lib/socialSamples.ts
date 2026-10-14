/**
 * The samples the social image lab draws: every published post (copy from its frontmatter, see the
 * og fields in src/content.config.ts), the homepage, and the generic pages. Uses astro:content, so
 * it only runs inside Astro.
 */
import { getPosts } from "./content";
import { HOME, PAGES, ogFields, plain, type Sample } from "./social";

/**
 * A generic-page sample (design p1): the page name in the yellow block, the description in the
 * box. Pages without a content file, and project and work entries, all use it.
 */
export function pageSample(id: string, title: string, description: string, label = `Page: ${title}`): Sample {
  return {
    id,
    kind: "page",
    label,
    title: `==${title}==`,
    titleShort: `==${title}==`,
    summary: description,
    summaryShort: description,
    pageTitle: `${title} | Sergei Garcia`,
    description: plain(description),
  };
}

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
  const pages: Sample[] = PAGES.map((pg) => pageSample(pg.id, pg.title, pg.description, `Page: ${pg.title}`));
  return [...postSamples, home, ...pages];
}
