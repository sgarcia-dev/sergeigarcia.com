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
| `tomato` | `#FF5A36` | Writing band and 404. Black text only. |
| `black` / `white` / `chalk` | `#0A0A0A` / `#FFFFFF` / `#F4F4EE` | Footer, tags, text on bands. |

Bands keep their fills in dark mode. Every text pair passes WCAG AA (most pass
AAA); ratios are in the mockup notes and checked by axe in CI.

### Type

| Role | Font | Token |
|---|---|---|
| Display (name, h1, h2) | Fraunces 900, `opsz` 144, tracking `-0.02em` | `.font-display` with `text-display`, `text-display-lg`, `text-h2` |
| Titles (h3, list titles) | Fraunces 700, auto optical size | `.font-title` with `text-xl` |
| Body | Bricolage Grotesque (variable, 400 / 500 / 700) | `text-base` (17px, 1.6), `text-lg` (20px, 1.5) |
| Labels, dates, pills, buttons | JetBrains Mono 400 / 700 | `.label`, `text-xs` (13px) |

Fonts are self-hosted from Fontsource, latin subset only. Only the Fraunces file
is preloaded.

### Space and layout

Spacing tokens: `2xs` 4px, `xs` 8px, `sm` 16px, `md` 24px, `lg` 48px, `xl` 80px,
`2xl` 128px. Page width `page` (90rem) through `.shell` (16px gutter, 48px from
`lg`). Reading width `prose` (40rem). Row rail `rail` (11rem). Title width
`title` (18ch). Breakpoints: `md` 48rem, `lg` 64rem.

Rules: `--rule-thick` 3px between bands, `--rule-thin` 2px between list rows.
Radius is always 0.

## Components

- **Band** (`.band-yellow`, `.band-cobalt`, `.band-tomato`, `.band-black`): a
  full-width flat block. Each band sets its own text, rule, focus, pill and
  button colors through CSS variables, so components inside just work.
- **Edge** (`.edge-b`, `.edge-t`): the 3px ink rule between bands.
- **Section**: `.shell` grid, 5 or 4 columns of heading on the left, 7 or 8
  columns of content on the right from `lg`. Stacks below.
- **List and row** (`.list`, `.row`, `.row-end`): thin-ruled rows. `.row` has a
  mono date rail on the left from `md`.
- **Row link** (`.row-link`): the whole title links to the entry page; underline
  shows on hover and focus.
- **Hit** (`.hit`, `.hit-primary`, `.hit-nav`, `.hit-logo`): every button-like
  link. 2px border, hard 4px shadow, mono bold text, min height 44px. Hover moves
  it 2px into its shadow; press moves it fully in.
- **Label** (`.label`): mono bold 13px for dates and meta.
- **Tag** (`.tag`): filled black status tag ("Coming soon"). Not clickable, no shadow.
- **Pill** (`.pill`, `<Pills>`): bordered mono skill tag, transparent fill, at most 5.
- **Frame** (`.frame`): screenshot with a 3px ink border and an 8px hard shadow.
- **Type card** (`.type-card`): stand-in for confidential work. Company and
  title set in display type on a band. Never a fake screenshot.
- **Prose** (`.prose`): long-form text at `text-lg`, `prose` width, h2s ruled.
- **PageHead**: the band block that opens every inner page, with the h1.

## Motion

CSS only, and only inside `prefers-reduced-motion: no-preference`.

- Cross-document view transitions (`@view-transition { navigation: auto; }`),
  220ms.
- The home page name has `view-transition-name: site-name`; on every other page
  the header mark has it, so the name shrinks into the nav.
- A list title and its page h1 share `vtName(kind, id)` from `src/lib/content.ts`.
  Use each name on exactly one element per page.
- Hit hover and press: 90ms transform and shadow.

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
| 7. Fade-in sections, card hover animations, parallax, scroll hijack, loaders | The view transitions and hit feedback above, nothing else. |
| 8. Skill bars, percent meters, fake terminals, "passionate" copy, invented metrics, lorem ipsum | Skill pills, real facts from sources, plain English. |
| 9. Any color, font, radius or spacing outside `@theme` | Add a token with a reason, or use an existing one. |
| 10. Pure `#000` or gray text on color, anything under AA | Use each band's own text color. Run `npm run test:e2e`. |

## Voice

Plain, short sentences. No em dashes. No buzzwords. Only facts that are in the
sources; anything unconfirmed goes in `CONTENT-TODO.md`.
