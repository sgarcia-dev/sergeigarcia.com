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

## License

Code is MIT. Content (text and images) is all rights reserved. See `LICENSE`.
