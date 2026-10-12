import { getCollection, type CollectionEntry } from "astro:content";

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

/** Published work roles, in display order (newest first by `order`). */
export async function getWork(): Promise<CollectionEntry<"work">[]> {
  return (await getCollection("work", ({ data }) => !data.draft)).sort(byOrder);
}

/** Published projects, in display order. */
export async function getProjects(): Promise<CollectionEntry<"projects">[]> {
  return (await getCollection("projects", ({ data }) => !data.draft)).sort(byOrder);
}

/** Published posts, newest first. Drafts never ship. */
export async function getPosts(): Promise<CollectionEntry<"posts">[]> {
  return (await getCollection("posts", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

/** All posts including drafts, for the "coming soon" teaser. */
export async function getAllPosts(): Promise<CollectionEntry<"posts">[]> {
  return (await getCollection("posts")).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

/**
 * View transition name shared by a list title and the page title it opens.
 * Use it on exactly one element per page.
 */
export function vtName(kind: "work" | "projects" | "posts", id: string): string {
  return `${kind}-${id.replace(/[^a-z0-9-]/gi, "-")}`;
}

/** Readable date, e.g. "12 October 2026". */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
