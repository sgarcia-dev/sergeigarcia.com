# Design system

The site is light neo-brutalist: big Fraunces display type, flat color blocks
(yellow, cobalt, tomato, black), thick black rules, square corners and one hard
shadow on things you can click. Source mockup: "D1, Fraunces original".

All values live in `src/styles/global.css` under `@theme`. The Tailwind default
theme is reset (`--*: initial`), so a utility only exists if a token backs it.
If you need a value that is not here, add a token first and say why.

## Tokens

### Color

| Token | Value | Use |
|---|---|---|
| `bg` / `ink` / `muted` | light `#FFFFFF` / `#0A0A0A` / `#3F3F3F`; dark `#0D0D12` / `#F2F0EA` / `#C4C2BC` | Paper sections. Switch with `prefers-color-scheme`. |
| `yellow` | `#FFD400` | Hero name block, primary buttons, hover fill, text selection. Black text only. |
| `cobalt` | `#1F3FD1` | Facts block, Projects and About bands. White text only. |
| `tomato` | `#FF6A44` | Writing band and 404. Black text only. |
| `black` / `white` / `chalk` | `#0A0A0A` / `#FFFFFF` / `#F4F4EE` | Footer, tags, text on bands. |

Bands keep their fills in dark mode. Every text pair passes WCAG AA (most pass
AAA); ratios are in the mockup notes and checked by axe in CI.

### Type

| Role | Font | Token |
|---|---|---|
| Display (name, h1, h2) | Fraunces 900, `opsz` 144, tracking `-0.02em` | `.font-display` with `text-display`, `text-display-lg`, `text-h2` |
| Titles (h3, list titles) | Fraunces 700, auto optical size | `.font-title` with `text-xl` |
| Body | Space Grotesk (variable) for long-form; the home page sets its text in JetBrains Mono at 340 (`.home-mono`) | `text-base` (17px, 1.6), `text-lg` (20px, 1.5) |
| Labels, dates, pills, buttons | JetBrains Mono 400 / 700 | `.label`, `text-xs` (13px) |

Fonts are self-hosted from Fontsource, latin subset only. Only the Fraunces file
is preloaded.

### Space and layout

Spacing tokens: `2xs` 4px, `xs` 8px, `sm` 16px, `md` 24px, `lg` 48px, `xl` 80px,
`2xl` 128px. Page width `page` (90rem) through `.shell` (16px gutter, 48px from
`lg`). Reading width `prose` (40rem). Row rail `rail` (11rem). Title width
`title` (18ch). Breakpoints: `md` 48rem, `lg` 64rem.

Rules: `--rule-thick` 3px between bands, `--rule-thin` 2px between list rows.
Radius is always 0. One exception: the small round headshot in the home hero (`.avatar`), with a 3px black ring.

## Components

- **Band** (`.band-yellow`, `.band-cobalt`, `.band-tomato`, `.band-black`): a
  full-width flat block. Each band sets its own text, rule, focus, pill and
  button colors through CSS variables, so components inside just work.
- **Edge** (`.edge-b`, `.edge-t`): the 3px ink rule between bands.
- **Section**: `.shell` grid, 5 or 4 columns of heading on the left, 7 or 8
  columns of content on the right from `lg`. Stacks below.
- **List and row** (`.list`, `.row`, `.row-end`): thin-ruled rows. `.row` has a
  mono date rail on the left from `md`. From `lg`, a list narrower than 46rem (its own width,
  a container query) stacks the row: thumbnail, date, title, text, pills. The home page uses a 4/8
  heading/list split below `xl` (90rem) and 5/7 from there.
- **Row link** (`.row-link`): the whole title links to the entry page; underline
  shows on hover and focus.
- **Hit** (`.hit`, `.hit-primary`, `.hit-nav`, `.hit-logo`): every button-like
  link. 2px border, hard 4px shadow, mono bold text, min height 44px. Hover moves
  it 2px into its shadow; press moves it fully in. `.hit-logo` keeps the plain
  default style (Sergei rejected cobalt and yellow fills). It shows the SG mark
  only on phones, and mark plus "Sergei Garcia" from `md`.
- **Hero** (home): yellow name band plus cobalt aside, content capped at `page`
  width, with the fills running to the edges via a gradient on `.hero`. The name
  is capped at 13rem.
- **Post row** (`<PostRow>`): a post with its cover thumbnail. `featured` shows
  the cover large with a "Read the post" button (the newest post on home).
- **Label** (`.label`): mono bold 13px for dates and meta.
- **Tag** (`.tag`): filled black status tag ("Coming soon"). Not clickable, no shadow.
- **Pill** (`.pill`, `<Pills>`): bordered mono skill tag, transparent fill, at most 5.
- **Frame** (`.frame`): screenshot with a 3px ink border and an 8px hard shadow.
- **Type card** (`.type-card`): stand-in for confidential work. Company and
  title set in display type on a band. Never a fake screenshot.
- **Prose** (`.prose`): long-form text at `text-lg`, `prose` width, h2s ruled.
- **PageHead**: the band block that opens every inner page, with the h1.

## Motion

Only inside `prefers-reduced-motion: no-preference`, unless noted. Every effect
was picked by Sergei from live prototypes on 2026-10-13 (the frozen lab is the
`lab/motion-2026-10-13` tag). Do not add, remove or "tone down" one without asking.

- Cross-document view transitions (`@view-transition { navigation: auto; }`),
  220ms.
- The home page name has `view-transition-name: site-name`; on every other page
  the header mark has it, so the name shrinks into the nav.
- A list title and its page h1 share `vtName(kind, id)` from `src/lib/content.ts`.
  Use each name on exactly one element per page. No other effect may style an
  element that carries a view-transition-name.
- Hit hover and press: 90ms transform and shadow.
- **Band textures** (`src/styles/texture.css`, `TexturePick.astro`): every big
  yellow, cobalt and tomato band gets one pattern per page load, picked at random
  from dots-fade, dots-big, hatch and grid, never the same twice in a row, with a
  random drift direction at 13.9px/s. The texture is pinned to the viewport and
  clipped to the band's padding box, so it never touches a border. Rule: the
  texture tone always moves away from the text color (lighter on yellow and
  tomato, darker on cobalt). Reduced motion keeps the texture, stops the drift.
- **Glyph reveal** (`src/scripts/motion.ts`): monospace text only (labels, the
  home hero facts, section intro lines). Letters go blank, ░, ▒, ▓, then real.
  Never on links, buttons, nav, headings, serif text or article body. No-JS shows
  plain text; failsafes force text visible within 2.5 to 3.5s.
- **Sticky header** compacts after about 80px. On every page but home, the
  PageHead band sticks under it and shrinks to a thin one-line banner.
- **Reading bar**: 4px, `--color-ink`, top of the viewport, posts and case
  studies only.
- **Liveliness** (`src/styles/lively.css`, `src/scripts/lively.ts`): a pale
  marker that draws once behind a few key phrases (`.lv-mark`), a yellow sweep on
  list row hover and focus, sticker tilt on the headshot, photo chip and skill
  pills on hover, a growing yellow underline on inline text links, and the slow
  black ticker under the home hero (pauses on hover, static under reduced motion).

Nothing else moves.

## Banned patterns, and what to do instead

| Do not | Do this instead |
|---|---|
| 1. Purple or blue-purple gradients, gradient text, glow | Flat fills from the palette. Contrast comes from black rules. |
| 2. Glassmorphism, blur, blobs, floating mockups | Opaque bands and framed, flat screenshots. |
| 3. Centered hero with a badge pill and two buttons | Left-aligned giant name in the yellow block, facts in the cobalt block. |
| 4. Grids of identical rounded cards, cards in cards, bento | Ruled lists of rows. One frame per image. |
| 5. Tracked all-caps eyebrows everywhere, one accented word, 01/02/03 for non-steps | Mono `.label` in sentence case, only where it adds meaning. |
| 6. "A · B · C" meta strings, "→" on every link, emoji in headings | Separate lines or a `<dl>`. Plain link text that says where it goes. |
| 7. Fade-in sections, card hover animations, parallax, scroll hijack, loaders | Only the effects listed under Motion, nothing else. |
| 8. Skill bars, percent meters, fake terminals, "passionate" copy, invented metrics, lorem ipsum | Skill pills, real facts from sources, plain English. |
| 9. Any color, font, radius or spacing outside `@theme` | Add a token with a reason, or use an existing one. |
| 10. Pure `#000` or gray text on color, anything under AA | Use each band's own text color. Run `npm run test:e2e`. |

## Voice

Plain, short sentences. No em dashes. No buzzwords. Only facts that are in the
sources; anything unconfirmed goes in `CONTENT-TODO.md`.
