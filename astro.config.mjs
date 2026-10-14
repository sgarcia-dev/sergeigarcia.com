// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://sergeigarcia.com",
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes("/lab/") })],
  vite: { plugins: [tailwindcss()] },
});
