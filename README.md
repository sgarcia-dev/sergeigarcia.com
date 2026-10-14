# sergeigarcia.com

Source for Sergei Garcia's personal site. Astro 7, Tailwind v4, static output.

## Develop

```sh
npm i
npm run dev      # http://localhost:4321
npm run build    # type check + static build into dist/
npm run preview
```

Needs Node 22.12 or newer.

## Deploy

Pushing to `main` deploys through Cloudflare Workers Builds, which runs
`npm run build` and `npx wrangler deploy` (static assets from `dist/`, see
`wrangler.jsonc`). Other branches get preview URLs.

## Content

Posts and projects are Markdown files in `src/content/`. Entries with
`draft: true` are not published. A wrong frontmatter field fails the build.

## Share images

Every page has its own social preview image (`og:image` and `twitter:image`), saved in
`public/og/` and committed, so deploys never need a browser. Articles use design A-1 T1, the home
page uses H-X3, every other page uses P-1 (compared in the lab at `/lab/social/`). The titles and
summaries come from the content files and `src/lib/pageMeta.ts`.

**After adding or retitling a post (or changing a page's title or description, or a post's
cover), run `npm run og` and commit `public/og/` and `scripts/og-manifest.json`.** It builds the
site, draws each page at `/og-render/<key>/` and screenshots it at 1200x630. The e2e tests fail
if a page has no image or its image is out of date. `npm run og -- writing/my-post` redraws one
image. `npm run og:default` redraws the fallback card `public/og-default.png`.

## License

Code is MIT. Content (text and images) is all rights reserved. See `LICENSE`.
