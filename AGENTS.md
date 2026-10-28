# Agent rules for this repo

Run `npm run build` before claiming any work is done. It must pass with zero
`astro check` errors. Run `npm run test:e2e` (axe on every route, light and
dark) before any UI change is done.

## Layout

- Content lives in `src/content/` (`work`, `projects`, `posts`), schemas in `src/content.config.ts`.
  Query it through `src/lib/content.ts` (drafts are filtered there).
- Site constants (name, email, links, nav) live in `src/lib/site.ts`.
- Design tokens live only in `src/styles/global.css` under `@theme`. The one exception is
  `src/styles/theme.css` (visitor themes, keyed on `html[data-theme]`); see DESIGN.md.
- Read `DESIGN.md` before any UI work. It lists the tokens, components,
  motion rules and the banned patterns with what to do instead.
- Facts Sergei still has to confirm are in `CONTENT-TODO.md`. Deferred work is in `TODO.md`.
- Never invent facts, metrics or dates. Public, NDA-safe content only.

## Astro 7 patterns to avoid

- No `Astro.glob()`. Use `getCollection()` / `getEntry()`.
- No `entry.render()`. Import `render` from `astro:content` and call `render(entry)`.
- No collection without a `loader` (use `glob()` from `astro/loaders`).
- Import `z` from `astro/zod`, never from `astro:content`.
- No client JS on content pages. No UI framework islands without a written reason.

## Tailwind v4 rules

- No `tailwind.config.js`. Config is CSS-first in `global.css`.
- No `@tailwind base/components/utilities` directives. Use `@import "tailwindcss";`.
- Use only utilities backed by our `@theme` tokens (the default theme is reset).
- No arbitrary values (`bg-[#...]`, `p-[13px]`) without a reason in a comment.
- Prefer plain scoped CSS for long-form prose and one-off details.

## Banned design patterns

1. Purple, indigo or blue-purple gradients; gradient text; glow.
2. Glassmorphism, backdrop blur, blobs, floating mockups.
3. Centered hero with a badge pill and two buttons.
4. Grids of identical rounded cards with one shadow; cards inside cards; bento grids without a content reason.
5. Tracked-out all-caps eyebrow over every heading; one accented word in a headline; 01/02/03 numbering for things that are not steps.
6. "A · B · C" meta strings, a "→" on every link, emoji in headings.
7. Fade or slide-up on every section, hover animation on every card, scroll hijacking, parallax, cursor followers, bounce easing, intro loaders, autoplay video.
8. Skill bars, percent meters, fake terminal intros, "passionate developer" copy, invented metrics, lorem ipsum.
9. Any color, font, radius or spacing value not defined in the `@theme` tokens.
10. Pure `#000` or flat gray text on colored backgrounds; anything below WCAG AA contrast.

## Other rules

- Motion is CSS only and wrapped in `prefers-reduced-motion: no-preference`.
- Every page needs a unique title, description and self-canonical URL.
- Commit no secrets, `.env` files or private data.
