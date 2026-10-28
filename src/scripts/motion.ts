// Motion: glyph reveal on mono text, header compact fallback, page head band, view-transition hand-off.
// The CSS side is src/styles/motion.css. With no JS, none of this exists and the site is plain.
//
//   glyph reveal   mono text appears letter by letter: blank, then ░ ▒ ▓, then the letter
//   header         CSS scroll timelines do the compacting; this only covers browsers without them
//                  and reduced motion (an instant switch)
//   page head      the title band sticks under the header and shrinks to a thin banner

const root = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasTimelines = CSS.supports("animation-timeline: scroll()");

// ---------------------------------------------------------------------------
// Gate: wait for an arriving cross-document view transition to finish before any
// text effect starts. pagereveal can fire before or after this module runs, so
// listen for it and also check document.activeViewTransition.
// ---------------------------------------------------------------------------
let transitionDone: Promise<unknown> = Promise.resolve();
interface RevealEvent extends Event {
  viewTransition?: { finished: Promise<unknown> } | null;
}
addEventListener("pagereveal", (e) => {
  const vt = (e as RevealEvent).viewTransition;
  if (vt) transitionDone = vt.finished.catch(() => {});
});
{
  const active = (document as unknown as { activeViewTransition?: { finished: Promise<unknown> } | null })
    .activeViewTransition;
  if (active) transitionDone = active.finished.catch(() => {});
}

// ---------------------------------------------------------------------------
// Glyph reveal
// Original nodes are never replaced or re-created (the marker script wraps phrases in
// spans, and those must survive). While a block of text reveals, its own ink is made
// transparent by CSS and an aria-hidden overlay of positioned letter boxes is laid over it.
// When the reveal ends, only the overlay is removed. Screen readers only ever see the
// original text.
// ---------------------------------------------------------------------------
const FRAMES = ["░", "▒", "▓"]; // after "nothing" and before the real letter
/** A reveal that is still running this long after it started is cut short and the text shown. */
const RUN_FAILSAFE_MS = 2500;
/** Waiting for a view transition longer than this is treated as stalled. */
const TRANSITION_WAIT_MS = 1500;

/** Mono text only. Keep this list in sync with the pre-hide rule in motion.css. */
const TARGETS = "main .label, main .hero-aside p:not(.font-title), main .section-head > p";

const hasVtName = (el: HTMLElement) => {
  const own = (n: Element) => getComputedStyle(n).viewTransitionName;
  if (own(el) !== "none") return true;
  for (const d of el.querySelectorAll("*")) if (own(d) !== "none") return true;
  return false;
};

const isMono = (el: HTMLElement) => /mono/i.test(getComputedStyle(el).fontFamily.split(",")[0]);

/** Never links, buttons, nav, controls, headings, or anything containing them. */
const isExcluded = (el: HTMLElement) =>
  !!el.closest("a, button, nav, header, footer, label, input, select, textarea, [role=button]") ||
  !!el.querySelector("a, button, input, select, textarea, h1, h2, h3, h4, h5, h6") ||
  /^H[1-6]$/.test(el.tagName);

interface Cell {
  box: HTMLElement;
  ch: string;
}

/** Lay one box over every non-space character. One batch of layout reads. */
function buildOverlay(el: HTMLElement) {
  const host = el.getBoundingClientRect();
  const range = document.createRange();
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const overlay = document.createElement("span");
  overlay.className = "dc-ov";
  overlay.setAttribute("aria-hidden", "true");
  const cells: Cell[] = [];
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    const text = node.nodeValue ?? "";
    for (let c = 0; c < text.length; c++) {
      if (/\s/.test(text[c])) continue;
      range.setStart(node, c);
      range.setEnd(node, c + 1);
      const r = range.getClientRects()[0];
      if (!r) continue;
      const box = document.createElement("span");
      box.className = "dc-b";
      box.style.cssText = `left:${r.left - host.left}px;top:${r.top - host.top}px;width:${r.width}px;height:${r.height}px;line-height:${r.height}px`;
      overlay.append(box);
      cells.push({ box, ch: text[c] });
    }
  }
  return { overlay, cells };
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function whenVisible(el: Element, go: () => void) {
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      void Promise.race([transitionDone, wait(TRANSITION_WAIT_MS)]).then(go);
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  io.observe(el);
}

/** Overlays that are running, so a leaving page (or bfcache) never keeps a half-drawn state. */
const running = new Set<() => void>();
addEventListener("pagehide", () => running.forEach((stop) => stop()));

function reveal(el: HTMLElement) {
  if (el.dataset.dc !== "pending") return;
  let overlay: HTMLElement;
  let cells: Cell[];
  try {
    ({ overlay, cells } = buildOverlay(el));
  } catch {
    el.dataset.dc = "done";
    return;
  }
  const n = cells.length;
  if (n === 0) {
    el.dataset.dc = "done";
    return;
  }
  // Short labels: relaxed. Long lines: tight, so the whole thing stays under ~900ms.
  const frameMs = n > 30 ? 40 : 60;
  const stepMs = Math.max(3, Math.min(28, (820 - FRAMES.length * frameMs) / Math.max(1, n - 1)));
  const shown: number[] = new Array(n).fill(-2);
  el.append(overlay);
  el.dataset.dc = "run";

  let timer = 0;
  // Only the overlay goes; the element's own nodes were never touched.
  const finish = () => {
    if (el.dataset.dc === "done") return;
    clearTimeout(timer);
    running.delete(finish);
    overlay.remove();
    el.dataset.dc = "done";
  };
  running.add(finish);
  timer = window.setTimeout(finish, RUN_FAILSAFE_MS); // a stalled reveal must never leave text hidden

  const t0 = performance.now();
  const tick = (now: number) => {
    if (el.dataset.dc !== "run") return;
    let finished = true;
    for (let i = 0; i < n; i++) {
      // k: -1 blank, 0..2 the block frames, 3 the real letter
      const k = Math.min(FRAMES.length, Math.floor((now - t0 - i * stepMs) / frameMs));
      if (k < FRAMES.length) finished = false;
      if (k === shown[i]) continue;
      shown[i] = k;
      cells[i].box.dataset.g = k < 0 ? "" : k < FRAMES.length ? FRAMES[k] : cells[i].ch;
    }
    if (finished) finish();
    else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function setupGlyph() {
  const targets = Array.from(document.querySelectorAll<HTMLElement>(TARGETS));
  const showAll = () => {
    for (const el of targets) if (!el.dataset.dc) el.dataset.dc = "skip"; // un-hides it
  };
  void document.fonts.ready.then(() => {
    try {
      // Decide first (reads), then mark (writes).
      const keep = targets.filter((el) => {
        if (el.dataset.dc) return false;
        if (isExcluded(el) || !isMono(el) || hasVtName(el) || !(el.textContent ?? "").trim()) {
          el.dataset.dc = "skip"; // un-hides it if the pre-hide rule caught it
          return false;
        }
        return true;
      });
      for (const el of keep) {
        el.dataset.dc = "pending"; // ink transparent, nothing drawn yet
        whenVisible(el, () => reveal(el));
      }
    } catch {
      showAll();
    }
  });
}

// The calm switch (html[data-calm]) keeps the reveal on the home page only. motion.css leaves
// these targets visible there, so nothing needs un-hiding.
const calmInner = "calm" in root.dataset && !document.querySelector("main.home-mono");
if (!reduced && !calmInner && root.classList.contains("js-motion")) setupGlyph();

// Playground hook: a "glyph-replay" event on a finished block plays its reveal once more. Nothing on
// the site dispatches it except /playground, so it changes nothing elsewhere.
if (!reduced && root.classList.contains("js-motion")) {
  document.addEventListener("glyph-replay", (e) => {
    const el = e.target;
    if (el instanceof HTMLElement && el.dataset.dc === "done") {
      el.dataset.dc = "pending";
      reveal(el);
    }
  });
}

// ---------------------------------------------------------------------------
// Header: CSS scroll timelines compact it. Without them (or with reduced motion, as an instant
// switch) toggle .is-compact from a 1px sentinel 80px down the page. No scroll listener.
// ---------------------------------------------------------------------------
const siteHeader = document.querySelector<HTMLElement>(".site-header");

if (siteHeader && (!hasTimelines || reduced)) {
  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText = "position:absolute;top:80px;left:0;width:1px;height:1px;pointer-events:none";
  document.body.prepend(sentinel);
  new IntersectionObserver(([e]) => siteHeader.classList.toggle("is-compact", !e.isIntersecting)).observe(sentinel);
}

// ---------------------------------------------------------------------------
// Page head: the title band sticks under the header and shrinks to a thin banner.
// The band is made sticky with a negative top, so only its bottom strip stays visible: no layout
// change, nothing below it jumps. CSS needs three measurements (band height and the scroll range
// where the strip arrives); they are set once and on resize. A small aria-hidden copy of the
// title sits in that strip and fades in as it arrives.
// ---------------------------------------------------------------------------
let pageHeadSwap: (() => void) | null = null;
{
  const band = document.querySelector<HTMLElement>("main .page-head");
  const title = band?.querySelector<HTMLElement>(".page-head-title");
  if (band && title && !reduced && hasTimelines) {
    const mini = document.createElement("div");
    mini.className = "ph-mini"; // full width of the band, so the texture never shows at its sides
    mini.setAttribute("aria-hidden", "true");
    const miniIn = document.createElement("div");
    miniIn.className = "ph-mini-in shell"; // the centered column the title lines up with
    const miniTitle = document.createElement("span");
    miniTitle.className = "ph-mini-title";
    miniTitle.textContent = (title.textContent ?? "").replace(/\s+/g, " ").trim();
    miniIn.append(miniTitle);
    mini.append(miniIn);
    band.append(mini);

    const cssPx = (name: string, fallback: number) =>
      parseFloat(getComputedStyle(root).getPropertyValue(name)) || fallback;
    let end = Infinity;
    const measure = () => {
      const main = band.closest("main");
      const top = (main?.getBoundingClientRect().top ?? 0) + scrollY; // main does not move
      const h = band.offsetHeight;
      // Scroll position where the band's strip is exactly under the compact header.
      end = Math.max(0, top + h - cssPx("--ph-strip", 48) - cssPx("--hh", 0));
      root.style.setProperty("--ph-H", `${h}px`);
      root.style.setProperty("--ph-end", `${end}px`);
      root.style.setProperty("--ph-start", `${Math.max(0, end - 140)}px`);
      root.dataset.ph = "on";
    };
    void document.fonts.ready.then(() => {
      measure();
      new ResizeObserver(measure).observe(band);
    });

    // Leaving by a view transition: the page title carries the transition name (so the list
    // title morphs into it). When the banner is showing instead, the visible mini title must
    // carry it, or the morph would start from text that is hidden under the header. Mid-shrink,
    // give the name to whichever of the two is more visible right now.
    pageHeadSwap = () => {
      const name = title.style.viewTransitionName;
      if (!name || name === "none" || scrollY <= end - 140) return;
      const headerBottom = siteHeader?.getBoundingClientRect().bottom ?? 0;
      const t = title.getBoundingClientRect();
      const titleVisible =
        t.height > 0 ? Math.max(0, Math.min(t.bottom, innerHeight) - Math.max(t.top, headerBottom)) / t.height : 0;
      const miniVisible = parseFloat(getComputedStyle(mini).opacity) || 0;
      if (miniVisible <= titleVisible) return;
      title.style.viewTransitionName = "none";
      miniTitle.style.viewTransitionName = name;
      mini.style.animation = "none"; // freeze the banner as fully shown for the snapshot
      mini.style.opacity = "1";
      mini.style.translate = "0 0";
      // Back-forward cache: coming back to this very page, put everything as it was.
      addEventListener(
        "pageshow",
        (e) => {
          if (!e.persisted) return;
          title.style.viewTransitionName = name;
          miniTitle.style.viewTransitionName = "";
          mini.style.animation = mini.style.opacity = mini.style.translate = "";
        },
        { once: true },
      );
    };
  }
}
addEventListener("pageswap", (e) => {
  if ((e as Event & { viewTransition?: unknown }).viewTransition) pageHeadSwap?.();
});

export {};
