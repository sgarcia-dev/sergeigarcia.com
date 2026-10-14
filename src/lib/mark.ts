/**
 * Highlighter marks inside plain-text frontmatter strings (summaries).
 * Write `==phrase==` in the string. `markHtml` turns it into a highlighter span for
 * visible text; `plain` strips the markers for meta tags, JSON-LD, RSS and alt text.
 * Only the `==` markers are special, so nothing else can become HTML.
 */

const MARK = /==(?=\S)(.+?)(?<=\S)==/g;

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/**
 * HTML for visible text: the text is escaped first, then each `==phrase==` becomes
 * `<span class="lv-mark">`. Pass `band` on a colored band to add the `lv-mark--band` variant.
 * Use with `set:html`.
 */
export function markHtml(text: string, opts: { band?: boolean } = {}): string {
  const cls = opts.band ? "lv-mark lv-mark--band" : "lv-mark";
  return escapeHtml(text).replace(MARK, `<span class="${cls}">$1</span>`);
}

/** The same text with the `==` markers removed, for anything that is not rendered as HTML. */
export function plain(text: string): string {
  return text.replace(MARK, "$1");
}
