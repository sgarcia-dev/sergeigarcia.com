// Read time for posts and case studies. Plain text math at build time, no dependencies.
// The number is shown as static text ("N min read") and also feeds the live "minutes left" chip.

/** Words per minute for the estimate. */
export const WORDS_PER_MINUTE = 250;

/**
 * Walk the text and drop every JSX or HTML tag, including multi-line ones. A tag may hold quotes
 * and braces (props like `posts={["a > b"]}`), so the closing `>` only counts outside them.
 * Text between tags is kept.
 */
function dropTags(src: string): string {
  const tagStart = /<\/?[A-Za-z][\w.-]*(?=[\s/>])/y;
  let out = "";
  let i = 0;
  while (i < src.length) {
    if (src[i] === "<") {
      tagStart.lastIndex = i;
      const m = tagStart.exec(src);
      if (m) {
        let j = i + m[0].length;
        let braces = 0;
        let quote = "";
        for (; j < src.length; j++) {
          const c = src[j];
          if (quote) {
            if (c === "\\") j++;
            else if (c === quote) quote = "";
          } else if (c === '"' || c === "'" || (braces > 0 && c === "`")) quote = c;
          else if (c === "{") braces++;
          else if (c === "}") braces = Math.max(0, braces - 1);
          else if (c === ">" && braces === 0) break;
        }
        out += " ";
        i = j + 1;
        continue;
      }
    }
    out += src[i++];
  }
  return out;
}

/** Remove frontmatter, MDX imports, tags and markdown syntax. What is left is what a reader reads. */
export function plainText(body: string): string {
  let t = body.replace(/\r\n?/g, "\n");
  t = t.replace(/^---\n[\s\S]*?\n---\n/, ""); // frontmatter, if it was left in
  t = t.replace(/^(?:import|export)\s[^\n]*$/gm, ""); // MDX import and export lines
  t = t.replace(/^(```|~~~)[^\n]*\n[\s\S]*?\n\1[ \t]*$/gm, " "); // fenced code (folder trees, snippets)
  t = t.replace(/<!--[\s\S]*?-->/g, " "); // comments
  t = dropTags(t); // JSX and HTML tags; props inside them are ignored on purpose
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, " "); // images
  t = t.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1"); // links keep their text
  t = t.replace(/^\[[^\]]+\]:\s*\S+.*$/gm, ""); // link reference definitions
  t = t.replace(/`([^`]*)`/g, "$1"); // inline code keeps its text
  t = t.replace(/^\s{0,3}(?:#{1,6}\s+|>\s?|[-*+]\s+|\d+[.)]\s+)/gm, ""); // headings, quotes, list markers
  t = t.replace(/^\s*(?:[-*_]\s*){3,}$/gm, " "); // horizontal rules
  t = t.replace(/^\s*\|?[\s:|-]+\|[\s:|-]*$/gm, " "); // table separator rows
  t = t.replace(/[|*~]+/g, " "); // table pipes, emphasis marks
  t = t.replace(/(^|[\s(])_+|_+(?=[\s).,;:!?]|$)/gm, "$1"); // _emphasis_ (snake_case stays whole)
  return t;
}

/** Count the words a reader would read in an entry body. */
export function countWords(body: string): number {
  // A word is any chunk of non-space text that has at least one letter or digit.
  return plainText(body)
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/** Whole minutes, never below 1. */
export function readingMinutes(body: string | undefined): number {
  return Math.max(1, Math.round(countWords(body ?? "") / WORDS_PER_MINUTE));
}
