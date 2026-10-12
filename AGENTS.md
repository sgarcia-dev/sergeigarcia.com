# Agent rules for this repo

Run `npm run build` before claiming any work is done. It must pass with zero
`astro check` errors.

## Layout

- Content lives in `src/content/` (`posts`, `projects`), schemas in `src/content.config.ts`.
- Design tokens live only in `src/styles/global.css` under `@theme`.
- Read `DESIGN.md` before any UI work (once it exists).

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
