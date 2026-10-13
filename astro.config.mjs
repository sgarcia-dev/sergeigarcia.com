// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://sergeigarcia.com",
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [sitemap()],
  // LAB ONLY: node_modules is a symlink to the main checkout; let the dev server serve it.
  vite: { plugins: [tailwindcss()], server: { fs: { allow: ["..", "../sergeigarcia.com"] } } },
});
