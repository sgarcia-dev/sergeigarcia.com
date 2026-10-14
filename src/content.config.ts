import { defineCollection, type SchemaContext } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { plain } from "./lib/mark";

// Summaries may carry ==highlight== markers (see src/lib/mark.ts); the 200 limit counts the visible text only.
const summary = z.string().refine((s) => plain(s).length <= 200, "summary must be 200 characters or fewer without ==markers==");

const link = z.object({
  label: z.string(),
  url: z.url(),
});

/*
  Shared fields. `period` is the human label shown on the site ("2021 to 2023").
  `startDate` / `endDate` are optional machine dates for sorting and JSON-LD.
  `order` sorts lists (lower first). `skills`: only the first 5 are shown.
*/
const base = ({ image }: SchemaContext) => ({
  title: z.string(),
  summary,
  period: z.string(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  role: z.string(),
  company: z.string().optional(),
  skills: z.array(z.string()).max(8).default([]),
  cover: image().optional(),
  coverAlt: z.string().optional(),
  links: z.array(link).default([]),
  order: z.number().int(),
  draft: z.boolean().default(false),
});

const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: ({ image }) =>
    z.object({
      ...base({ image }),
      company: z.string(),
      location: z.string().optional(),
      clients: z.array(z.string()).default([]),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      ...base({ image }),
      // True for internal or confidential work: never shows a screenshot.
      confidential: z.boolean().default(false),
      // "illustration" covers are commissioned art, safe to show even for confidential work.
      coverKind: z.enum(["screenshot", "illustration"]).default("screenshot"),
      gallery: z.array(z.object({ src: image(), alt: z.string() })).default([]),
      galleryCaption: z.string().optional(),
    }),
});

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary,
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      skills: z.array(z.string()).max(8).default([]),
      // Optional cover image shown at the top of the post page.
      cover: image().optional(),
      coverAlt: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { work, projects, posts };
