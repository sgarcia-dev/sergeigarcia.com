// LAB ONLY: scripts for motion variants. Owned by the motion worker.
// Reads <html data-motion / data-header / data-progress> (set by LabSwitch.astro).
// With none of them set, this file does nothing.
//
//   motion=glyph (alias decode-glyph)  mono text appears letter by letter: blank, then ░ ▒ ▓, then the letter
//   header=shrink | sticky             shrink: tiny sentinel fallback only, CSS does the rest
//   header=pagehead                    the page title band sticks and shrinks to a thin banner
//   progress=bar                       thin reading bar at the top edge (posts and projects)

const root = document.documentElement;
const motion = root.dataset.motion ?? "";
const header = root.dataset.header ?? "";
const progress = root.dataset.progress ?? "";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

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
// glyph reveal
// Original nodes are never replaced or re-created (the marker script wraps phrases in
// .lv-mark spans, and those must survive). While a block of text reveals, its own ink is made
// transparent by CSS and an aria-hidden overlay of positioned letter boxes is laid over it.
// When the reveal ends, only the overlay is removed.
// ---------------------------------------------------------------------------
const FRAMES = ["░", "▒", "▓"]; // after "nothing" and before the real letter

/** Mono text only. Keep this list in sync with the pre-hide rule in lab-motion.css. */
const TARGETS = "main .label, main .hero-aside p, main .section-head > p";

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
  (/^H[1-6]$/.test(el.tagName) && !isMono(el));

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

function whenVisible(el: Element, go: () => void) {
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      void transitionDone.then(go);
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  io.observe(el);
}

function reveal(el: HTMLElement) {
  const { overlay, cells } = buildOverlay(el);
  const n = cells.length;
  // Short labels: relaxed. Long lines: tight, so the whole thing stays under ~900ms.
  const frameMs = n > 30 ? 40 : 60;
  const stepMs = Math.max(3, Math.min(28, (820 - FRAMES.length * frameMs) / Math.max(1, n - 1)));
  const shown: number[] = new Array(n).fill(-2);
  el.append(overlay);
  el.dataset.dc = "run";
  const t0 = performance.now();
  const tick = (now: number) => {
    let finished = true;
    for (let i = 0; i < n; i++) {
      // k: -1 blank, 0..2 the block frames, 3 the real letter
      const k = Math.min(FRAMES.length, Math.floor((now - t0 - i * stepMs) / frameMs));
      if (k < FRAMES.length) finished = false;
      if (k === shown[i]) continue;
      shown[i] = k;
      cells[i].box.dataset.g = k < 0 ? "" : k < FRAMES.length ? FRAMES[k] : cells[i].ch;
    }
    if (finished) {
      overlay.remove(); // only the overlay goes; the element's own nodes were never touched
      el.dataset.dc = "done";
    } else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function setupGlyph() {
  const targets = Array.from(document.querySelectorAll<HTMLElement>(TARGETS));
  void document.fonts.ready.then(() => {
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
  });
}

if (!reduced && (motion === "glyph" || motion === "decode-glyph")) setupGlyph();

// ---------------------------------------------------------------------------
// header=shrink fallback (browsers without scroll() timelines)
// ---------------------------------------------------------------------------
const siteHeader = document.querySelector<HTMLElement>(".site-header");

if (siteHeader && header === "shrink" && !CSS.supports("animation-timeline: scroll()")) {
  // A 1px sentinel 80px down the page. No scroll listener.
  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText = "position:absolute;top:80px;left:0;width:1px;height:1px;pointer-events:none";
  document.body.prepend(sentinel);
  new IntersectionObserver(([e]) => siteHeader.classList.toggle("is-compact", !e.isIntersecting)).observe(sentinel);
}

// ---------------------------------------------------------------------------
// header=pagehead: the title band sticks and shrinks to a thin banner.
// The band is made sticky with a negative top, so only its bottom strip stays on screen:
// no layout change, nothing below it jumps. CSS needs three measurements (band height and
// the scroll range where the strip arrives); they are set once and on resize.
// A small aria-hidden copy of the title sits in that strip and fades in as it arrives.
// ---------------------------------------------------------------------------
let pageHeadSwap: (() => void) | null = null;
{
  const band = document.querySelector<HTMLElement>("main .page-head");
  const title = band?.querySelector<HTMLElement>(".page-head-title");
  if (
    header === "pagehead" &&
    band &&
    title &&
    !reduced &&
    CSS.supports("animation-timeline: scroll()")
  ) {
    const mini = document.createElement("div");
    mini.className = "ph-mini shell";
    mini.setAttribute("aria-hidden", "true");
    const miniTitle = document.createElement("span");
    miniTitle.className = "ph-mini-title";
    miniTitle.textContent = (title.textContent ?? "").replace(/\s+/g, " ").trim();
    mini.append(miniTitle);
    band.append(mini);

    const stripPx = () => parseFloat(getComputedStyle(root).getPropertyValue("--ph-strip")) || 48;
    let end = Infinity;
    const measure = () => {
      const main = band.closest("main");
      const top = (main?.getBoundingClientRect().top ?? 0) + scrollY; // main is not sticky
      const h = band.offsetHeight;
      end = Math.max(0, top + h - stripPx());
      root.style.setProperty("--ph-H", `${h}px`);
      root.style.setProperty("--ph-end", `${end}px`);
      root.style.setProperty("--ph-start", `${Math.max(0, end - 140)}px`);
      root.dataset.ph = "on";
    };
    void document.fonts.ready.then(() => {
      measure();
      new ResizeObserver(measure).observe(band);
    });

    // When leaving by a view transition while the strip is showing, let the visible mini title
    // carry the page title's transition name, so it morphs from what is on screen.
    pageHeadSwap = () => {
      const name = title.style.viewTransitionName;
      if (!name || name === "none" || scrollY < end - 20) return;
      title.style.viewTransitionName = "none";
      miniTitle.style.viewTransitionName = name;
      mini.style.animation = "none";
      mini.style.opacity = "1";
      mini.style.translate = "0 0";
    };
  }
}
addEventListener("pageswap", (e) => {
  if ((e as Event & { viewTransition?: unknown }).viewTransition) pageHeadSwap?.();
});

// ---------------------------------------------------------------------------
// progress=bar: only on /writing/<slug>/ and /projects/<slug>/
// ---------------------------------------------------------------------------
const isArticle = /^\/(writing|projects)\/[^/]+\/?$/.test(location.pathname);
if (isArticle && progress === "bar" && !reduced && CSS.supports("animation-timeline: scroll()")) {
  const bar = document.createElement("div");
  bar.className = "lab-progress";
  bar.setAttribute("aria-hidden", "true");
  bar.append(document.createElement("i"));
  document.body.append(bar);
}

export {};
