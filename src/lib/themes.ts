// "Hack this site": the options a visitor can pick on /hack/. This file is the one list of them.
// The looks themselves are CSS in src/styles/theme.css, keyed by <html> attributes. The head script
// in src/components/ThemeInit.astro reads a saved theme, checks every value against these lists and
// sets the attributes before first paint. DESIGN.md, "Hack this site", has the rules.

export interface Option {
  id: string;
  label: string;
}

/** Color sets. Each sets the paper, ink and the three band fills, light and dark (theme.css). */
export const PALETTES = [
  { id: "original", label: "Original", swatch: ["#FFD400", "#1A34B0", "#FF6A44"] },
  { id: "swiss", label: "Swiss", swatch: ["#E30613", "#111111", "#F2F2F2"] },
  { id: "editorial", label: "Editorial", swatch: ["#E8D8B8", "#2F4A3A", "#A8492A"] },
  { id: "terminal", label: "Terminal", swatch: ["#33FF66", "#0F2A14", "#FFB000"] },
  { id: "y2k", label: "Y2K", swatch: ["#FF5EC4", "#6B2BFF", "#C6FF3D"] },
] as const;

export const TYPES = [
  { id: "original", label: "Fraunces" },
  { id: "grotesk", label: "Grotesk" },
  { id: "mono", label: "All mono" },
  { id: "editorial", label: "Book serif" },
  { id: "system", label: "System" },
] as const satisfies readonly Option[];

export const SHAPES = [
  { id: "square", label: "Square" },
  { id: "soft", label: "Soft" },
  { id: "round", label: "Round" },
] as const satisfies readonly Option[];

export const SHADOWS = [
  { id: "hard", label: "Hard" },
  { id: "huge", label: "Huge" },
  { id: "none", label: "None" },
] as const satisfies readonly Option[];

/** full: every effect. calm: the ?calm=on set. still: no textures, reveals or sticky shrink. */
export const EFFECTS = [
  { id: "full", label: "Full" },
  { id: "calm", label: "Calm" },
  { id: "still", label: "Still" },
] as const satisfies readonly Option[];

export interface Theme {
  palette: string;
  type: string;
  shape: string;
  shadow: string;
  fx: string;
  /** Own band fills, "#rrggbb", in the order yellow, cobalt, tomato slot. Optional. */
  colors?: [string, string, string];
}

export const DEFAULT_THEME: Theme = { palette: "original", type: "original", shape: "square", shadow: "hard", fx: "full" };

/** Ready-made looks. Swiss and Editorial are directions rejected while the site was designed. */
export const SKINS: readonly { id: string; label: string; line: string; theme: Theme }[] = [
  { id: "original", label: "Original", line: "The real site. Neo-brutalist, loud and square.", theme: DEFAULT_THEME },
  {
    id: "swiss",
    label: "Swiss",
    line: "Rejected in the design round as too boring. Judge for yourself.",
    theme: { palette: "swiss", type: "grotesk", shape: "square", shadow: "none", fx: "calm" },
  },
  {
    id: "editorial",
    label: "Editorial",
    line: "The quiet magazine look, rejected as too generic.",
    theme: { palette: "editorial", type: "editorial", shape: "soft", shadow: "none", fx: "still" },
  },
  {
    id: "terminal",
    label: "Terminal",
    line: "Green on black, all mono. The glyph reveal finally feels at home.",
    theme: { palette: "terminal", type: "mono", shape: "square", shadow: "hard", fx: "full" },
  },
  {
    id: "y2k",
    label: "Y2K",
    line: "Hot pink, round corners, huge shadows. Maximum shenanigans.",
    theme: { palette: "y2k", type: "system", shape: "round", shadow: "huge", fx: "full" },
  },
];

/** What the head script accepts. Anything else in a saved or shared theme is dropped. */
export const ALLOW = {
  palette: PALETTES.map((p) => p.id),
  type: TYPES.map((t) => t.id),
  shape: SHAPES.map((s) => s.id),
  shadow: SHADOWS.map((s) => s.id),
  fx: EFFECTS.map((e) => e.id),
};

/** Stable hooks for visitor CSS, listed on /hack/ and in the prompt for an AI. */
export const HOOKS = {
  variables: [
    ["--color-yellow, --color-cobalt, --color-tomato", "the three band fills"],
    ["--c-bg, --c-ink, --c-muted", "page background, text and quiet text"],
    ["--font-display, --font-sans, --font-mono", "headings, body text, labels"],
    ["--th-radius, --th-shadow", "corner radius and shadow offset (when a theme is on)"],
  ],
  classes: [
    [".band-yellow, .band-cobalt, .band-tomato, .band-black", "the full-width color blocks"],
    [".page-head", "the band that opens every inner page"],
    [".hit, .hit-primary", "every button-like link"],
    [".pill, .tag, .label", "skill pills, status tags, mono labels"],
    [".row, .list", "rows in the work, project and writing lists"],
    [".prose", "the text of a post"],
    [".font-display, .font-title", "big headings, list titles"],
    [".frame", "framed screenshots and covers"],
  ],
} as const;
