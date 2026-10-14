// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://sergeigarcia.com",
  trailingSlash: "always",
  build: { format: "directory" },
  // /lab/ pages are public but unlisted: no sitemap entry, and each sets noindex.
  integrations: [mdx(), sitemap({ filter: (page) => !new URL(page).pathname.startsWith("/lab/") })],
  vite: { plugins: [tailwindcss()] },
});
