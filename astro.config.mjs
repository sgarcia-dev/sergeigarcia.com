// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  redirects: {
    "/whisper-for-android": "/whisper-suite/",
    "/whisper-for-android/privacy": "/whisper-suite/privacy/",
    "/whisper-for-android/terms": "/whisper-suite/terms/",
  },
  site: "https://sergeigarcia.com",
  trailingSlash: "always",
  build: { format: "directory" },
  // /lab/ pages, /automation-privacy/, /whisper-suite/ (invite-only beta app pages; old /whisper-for-android/ redirects) and the /og-render/ drawing pages are public but unlisted: no sitemap entry, and each sets noindex.
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !["/lab/", "/og-render/", "/automation-privacy/", "/whisper-for-android/", "/whisper-suite/"].some((p) => new URL(page).pathname.startsWith(p)) }),
  ],
  vite: { plugins: [tailwindcss()] },
});
