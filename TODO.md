# Deferred work

Things left out of v1 on purpose, so the job-ready MVP shipped first. Each item
has a next step. Facts to confirm live in `CONTENT-TODO.md`, not here.

## Before go-live

- **Review the preview.** Sergei reviews the `build/v1` preview URL, then merge to `main`.
- **Publish the launch post.** Read `src/content/posts/how-i-built-this-site-with-ai-agents.md`, edit, set `draft: false`.
- **Email forwarding.** Set up `hello@sergeigarcia.com` in Cloudflare Email Routing (needs Sergei's go-ahead). Until then the address bounces.
- **Production checks.** After the merge, run the e2e test against `https://sergeigarcia.com` too (a preview vs production 404 difference was reported in Oct 2026).

## Later

- **Lighthouse CI.** Add `@lhci/cli` with budgets from SPEC.md (Perf 95+, A11y 100, SEO 100) as a PR job.
- **Per-post OG images.** Generate with Satori at build time. Today every page uses `public/og-default.png` (rebuild with `npm run og`).
- **Company logos.** Check each brand's usage rules before adding any. Company names are set in our own type for now.
- **Search Console and Bing.** Verify the domain and submit `sitemap-index.xml`.
- **AI crawler policy.** Decide on training bots in `public/robots.txt`; check Cloudflare is not adding its own block.
- **Cloudflare Web Analytics.** Turn on the free beacon (the only allowed JS).
- **Screenshot refresh.** `npm run screenshots` recaptures public sites at 1440x900. Re-run before each big content update.
- **Visual regression.** Add Playwright screenshots at 375, 768 and 1440 to CI.
- **More motion.** Only if it earns its place: a one-time first-load reveal. Nothing beyond the view transitions ships today.
- **Full-text RSS.** The feed has summaries only. Render post HTML into `content` when posts exist.
- **Search, comments, newsletter.** Pagefind after about 15 posts; Giscus and Buttondown later.

## Hosting notes

- Production deploys run `npx wrangler deploy` from Workers Builds on push to `main`. Branch previews run `npx wrangler preview` (needs the `previews` block in `wrangler.jsonc`).
- If a deploy fails with a Cloudflare API 504, retry the build from the dashboard or push again.
