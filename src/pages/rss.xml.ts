import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPosts } from "../lib/content";
import { SITE } from "../lib/site";

export async function GET(context: APIContext) {
  const posts = await getPosts();

  return rss({
    title: SITE.name,
    description: "Writing by Sergei Garcia on software, front ends and AI coding agents.",
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.pubDate,
      link: `/writing/${post.id}/`,
    })),
  });
}
