// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://sergeigarcia.com",
  trailingSlash: "always",
  build: { format: "directory" },
  // /lab/ pages and the /og-render/ drawing pages are public but unlisted: no sitemap entry, and each sets noindex.
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !["/lab/", "/og-render/"].some((p) => new URL(page).pathname.startsWith(p)) }),
  ],
  vite: { plugins: [tailwindcss()] },
});
