// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  redirects: {
    "/whisper-suite": "/whisper-for-android/",
    "/whisper-suite/privacy": "/whisper-for-android/privacy/",
    "/whisper-suite/terms": "/whisper-for-android/terms/",
  },
  site: "https://sergeigarcia.com",
  trailingSlash: "always",
  build: { format: "directory" },
  // /lab/ pages, /automation-privacy/, /whisper-for-android/ (invite-only beta app pages; /whisper-suite/ redirects here) and the /og-render/ drawing pages are public but unlisted: no sitemap entry, and each sets noindex.
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !["/lab/", "/og-render/", "/automation-privacy/", "/whisper-for-android/", "/whisper-suite/"].some((p) => new URL(page).pathname.startsWith(p)) }),
  ],
  vite: { plugins: [tailwindcss()] },
});
