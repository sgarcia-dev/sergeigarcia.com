// Live "minutes left" chip for posts and case studies. The CSS side is src/styles/readtime.css.
// The page already says "N min read" as plain text; this chip is a scroll-driven extra, aria-hidden,
// and absent without JS. Cross-document view transitions load each page fresh, so this module runs
// again on every page; the bfcache case is covered by "pageshow".
//
// Progress is measured on the article body ([data-rt-body]), not the page:
//   0 when the article top reaches the line under the sticky header (and the page head strip)
//   1 when the article bottom is visible
//
// Variants, switched by URL param and remembered in sessionStorage for the tab:
//   ?rtpos=strip|header                 desktop placement (default strip)
//   ?rtm=compact|corner                 phone placement (default compact: in the strip, short text)
//   ?rtemoji=grow|trip|moon|none        emoji set (default grow)
//   ?rtcopy=cheer|coach|quiet           wording (default cheer)
//   ?rtswap=glyph|plain                 how changed text swaps in: the site's block-glyph reveal, or instantly

const EMOJI = {
  grow: ["🌱", "🌿", "🪴", "🌳", "🎉"],
  trip: ["📖", "🚶", "🏃", "🏁", "🎉"],
  moon: ["🌑", "🌘", "🌗", "🌖", "🌕"],
  none: ["", "", "", "", ""],
} as const;

/**
 * [bold text, tagline] per step: 0-25%, 25-50%, 50-75%, 75-97%, done. "{n}" becomes "N min".
 * The tagline carries its own separator. Phones never show it (see SHORT).
 */
const COPY = {
  cheer: [
    ["{n} left", "· settle in"],
    ["{n} left", "· nice start"],
    ["{n} left", "· halfway there"],
    ["Almost there", "· keep going"],
    ["You made it", "· thanks for reading"],
  ],
  coach: [
    ["{n}", "to go"],
    ["{n}", "· good pace"],
    ["{n}", "· past halfway"],
    ["Final stretch", "· nearly done"],
    ["Done", "· nicely read"],
  ],
  quiet: [
    ["{n} left", ""],
    ["{n} left", ""],
    ["{n} left", ""],
    ["Almost done", ""],
    ["Done", ""],
  ],
} as const;
/** Phone text: minutes and the emoji only ("3 min", "Almost", "Done"). */
const SHORT = ["{n}", "{n}", "{n}", "Almost", "Done"] as const;

const POS = ["header", "strip"] as const;
const PHONE = ["compact", "corner"] as const;
const SWAP = ["glyph", "plain"] as const;
/** Same look as the glyph reveal in motion.ts: blank, then these three blocks, then the real letter. */
const FRAMES = ["░", "▒", "▓"];
const FRAME_MS = 40;
/** Whole swap stays under ~320ms: 3 frames plus the stagger between letters (at most 200ms). */
const STAGGER_BUDGET_MS = 200;
/** From this much progress on, the reader counts as done. */
const DONE_AT = 0.97;

/** URL param first (and remember it), then the tab's stored choice, then the default. */
function pick<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  const ok = (v: string | null): v is T => v !== null && (allowed as readonly string[]).includes(v);
  const fromUrl = new URLSearchParams(location.search).get(key);
  try {
    if (ok(fromUrl)) {
      sessionStorage.setItem(key, fromUrl);
      return fromUrl;
    }
    const stored = sessionStorage.getItem(key);
    if (ok(stored)) return stored;
  } catch {
    // Storage can be blocked (private window). The URL value or the default still work.
    if (ok(fromUrl)) return fromUrl;
  }
  return fallback;
}

function init() {
  const chip = document.querySelector<HTMLElement>("[data-rt]");
  const body = document.querySelector<HTMLElement>("[data-rt-body]");
  const emojiEl = chip?.querySelector<HTMLElement>(".rt-emoji");
  const box = chip?.querySelector<HTMLElement>(".rt-box");
  const mainEl = chip?.querySelector<HTMLElement>(".rt-main");
  const tailEl = chip?.querySelector<HTMLElement>(".rt-tail");
  if (!chip || !body || !emojiEl || !box || !mainEl || !tailEl) return;

  const total = Math.max(1, Number(chip.dataset.total) || 1);
  const pos = pick("rtpos", POS, "strip");
  const phoneMode = pick("rtm", PHONE, "compact");
  const emojiSet = pick("rtemoji", Object.keys(EMOJI) as (keyof typeof EMOJI)[], "grow");
  const copySet = pick("rtcopy", Object.keys(COPY) as (keyof typeof COPY)[], "cheer");
  const swapMode = pick("rtswap", SWAP, "glyph");
  const glyphSwap = swapMode === "glyph" && !matchMedia("(prefers-reduced-motion: reduce)").matches;
  const emojis = EMOJI[emojiSet];
  const copy = COPY[copySet];
  chip.dataset.emoji = emojiSet;

  const phoneQ = matchMedia("(max-width: 47.99rem)");
  const wideQ = matchMedia("(min-width: 56rem)");
  const homeParent = chip.parentElement!; // the header, where the server put it
  const root = document.documentElement;
  const band = document.querySelector<HTMLElement>("main .page-head");
  const footer = document.querySelector<HTMLElement>("body > footer");
  const cssPx = (name: string) => parseFloat(getComputedStyle(root).getPropertyValue(name)) || 0;

  /** [bold, tagline] for a step. Phones get the short form and no tagline. */
  function words(step: number, mins: number): [string, string] {
    const n = `${mins} min`;
    if (phoneQ.matches) return [SHORT[step].replace("{n}", n), ""];
    return [copy[step][0].replace("{n}", n), copy[step][1]];
  }

  // Hidden copies of every text the chip can show, stacked in the same grid cell as the live text.
  // The chip is then as wide as the widest one and never jitters as the words change.
  function buildGhosts() {
    box!.querySelectorAll(".rt-ghost").forEach((g) => g.remove());
    const seen = new Set<string>();
    for (let step = 0; step < 5; step++) {
      const [m, t] = words(step, total);
      if (seen.has(m + "|" + t)) continue;
      seen.add(m + "|" + t);
      const ghost = document.createElement("span");
      ghost.className = "rt-ghost rt-live";
      ghost.setAttribute("aria-hidden", "true");
      const mm = document.createElement("b");
      mm.className = "rt-main";
      mm.textContent = m;
      const tt = document.createElement("span");
      tt.className = "rt-tail";
      tt.textContent = t;
      ghost.append(mm, tt);
      box!.append(ghost);
    }
  }

  /**
   * Put new text in an element. With the glyph swap, only the letters that differ from the previous
   * text run through blank, then three block glyphs, then the real letter (so "8 min" to "7 min"
   * only redraws the 8). A new change while one is running cancels it and jumps to the newest
   * text. Returns true if the text changed.
   */
  function swapper(el: HTMLElement) {
    let current = el.textContent ?? "";
    let raf = 0;
    return (next: string, instant = false) => {
      if (next === current) return false;
      const prev = current;
      current = next;
      cancelAnimationFrame(raf);
      const changed: number[] = [];
      if (glyphSwap && !instant) for (let i = 0; i < next.length; i++) if (next[i] !== prev[i] && next[i] !== " ") changed.push(i);
      if (!changed.length) {
        el.textContent = next;
        return true;
      }
      const stagger = Math.min(18, STAGGER_BUDGET_MS / Math.max(1, changed.length - 1));
      const t0 = performance.now();
      const tick = (now: number) => {
        const out = next.split("");
        let finished = true;
        changed.forEach((at, j) => {
          const k = Math.floor((now - t0 - j * stagger) / FRAME_MS); // -1 and below: blank
          if (k >= FRAMES.length) return;
          finished = false;
          out[at] = k < 0 ? " " : FRAMES[k];
        });
        el.textContent = finished ? next : out.join("");
        if (!finished) raf = requestAnimationFrame(tick);
      };
      tick(t0);
      raf = requestAnimationFrame(tick);
      return true;
    };
  }
  const setMain = swapper(mainEl);
  const setTail = swapper(tailEl);

  /**
   * Where the chip lives:
   *   phones   compact (default): in the page head strip, short text. corner: pinned bottom right.
   *   tablets  in the strip (the header has no room for it below 56rem)
   *   desktop  the strip (default) or the header, by ?rtpos
   * The strip only exists when motion.ts built it (no reduced motion, scroll timelines supported);
   * without it a phone uses the corner and a wider screen keeps the chip in the header.
   */
  function place() {
    const strip = document.querySelector<HTMLElement>(".ph-mini-in");
    const phone = phoneQ.matches;
    let where: "header" | "strip" | "corner";
    if (phone) where = phoneMode === "corner" || !strip ? "corner" : "strip";
    else where = pos === "header" && wideQ.matches ? "header" : strip ? "strip" : "header";
    chip!.dataset.pos = where;
    if (where === "strip") strip!.append(chip!);
    else if (where === "corner") document.body.append(chip!);
    else homeParent.append(chip!);
    buildGhosts();
    render(true);
  }

  /** 0..1 through the article body. */
  function progress() {
    const r = body!.getBoundingClientRect();
    // The reading line: just under the compact header, and under the page head strip when it shows.
    const line = cssPx("--hh") + (root.dataset.ph === "on" ? cssPx("--ph-strip") : 0);
    const room = innerHeight - line; // viewport height that is not covered
    const range = r.height - room; // how far the article can travel before its bottom shows
    if (range <= 0) return r.bottom <= innerHeight ? 1 : 0; // a short article: done once it all shows
    return Math.min(1, Math.max(0, (line - r.top) / range));
  }

  /** The corner pill shows once the page head has shrunk to its strip, and not over the footer. */
  function updateCorner() {
    if (chip!.dataset.pos !== "corner") return;
    const line = cssPx("--hh") + (root.dataset.ph === "on" ? cssPx("--ph-strip") : 0);
    const shrunk = !band || band.getBoundingClientRect().bottom <= line + 2;
    const footerShown = !!footer && footer.getBoundingClientRect().top < innerHeight;
    chip!.toggleAttribute("data-show", shrunk && !footerShown);
  }

  let step = -1;
  function render(instant = false) {
    const p = progress();
    const s = p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : p < DONE_AT ? 3 : 4;
    const mins = Math.max(1, Math.round(total * (1 - p)));
    const first = step === -1 || instant;
    const [main, tail] = words(s, mins);
    const mainChanged = setMain(main, first);
    const tailChanged = setTail(tail, first);
    const stepChanged = s !== step;
    updateCorner();
    if (!mainChanged && !tailChanged && !stepChanged && !instant) return;
    step = s;
    emojiEl!.textContent = emojis[s];
    chip!.dataset.state = s === 4 ? "done" : s === 3 ? "almost" : "left";
    // One bounce on EVERY change (a new minute count or a new step, scrolling either way), never on
    // first paint. "Almost there" keeps bouncing gently on a loop, so it also starts at load.
    // The CSS runs the animation only when motion is welcome.
    chip!.removeAttribute("data-go");
    if (!first || s === 3) {
      void chip!.offsetWidth; // restart the animation
      chip!.setAttribute("data-go", "");
    }
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      render();
    });
  };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  phoneQ.addEventListener("change", place);
  wideQ.addEventListener("change", place);
  // Images and fonts change the article height after load.
  if ("ResizeObserver" in window) new ResizeObserver(schedule).observe(body);
  // Back/forward cache: the page comes back as it was, with the scroll position restored.
  addEventListener("pageshow", (e) => {
    if (e.persisted) schedule();
  });
  // motion.ts sets html[data-ph] after fonts load, which moves the reading line.
  void document.fonts.ready.then(schedule);
  place();
}

init();

export {};
