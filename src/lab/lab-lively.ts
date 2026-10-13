// LAB ONLY: scripts for the liveliness ideas (see lab-lively.css). Runs only for the names listed in
// <html data-lively="...">. Everything it adds is decorative or a copy of text already on the page,
// and it never touches an element that carries a view-transition-name.

const root = document.documentElement;
const active = new Set((root.dataset.lively ?? "").split(/\s+/).filter(Boolean));
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/** True for anything that morphs between pages: leave it, and everything inside it, alone. */
const isTransitionNamed = (el: Element | null) =>
  !!el?.closest('[style*="view-transition-name"], h1, h2, h3, .hit, nav, header');

// ---- marker ---------------------------------------------------------------------------------
// A small data map: path -> phrases to highlight (first match on the page, in reading order).
const MARKS: Record<string, string[]> = {
  "/": ["13 years", "what changed", "keep teams moving"],
  "/about": ["happy accident", "more than 13 years", "empathy"],
};

function initMarker() {
  const path = location.pathname.replace(/\/+$/, "") || "/";
  const phrases = MARKS[path];
  const main = document.querySelector("main");
  if (!phrases || !main) return;
  const spans: HTMLElement[] = [];
  for (const phrase of phrases) {
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = node.nodeValue ?? "";
      const at = text.indexOf(phrase);
      if (at < 0) continue;
      const parent = node.parentElement;
      if (!parent || isTransitionNamed(parent) || parent.closest(".lv-mark")) continue;
      // Yellow on the cobalt band would put white text on yellow, so skip those.
      if (parent.closest(".band-cobalt")) continue;
      const range = document.createRange();
      range.setStart(node, at);
      range.setEnd(node, at + phrase.length);
      const span = document.createElement("span");
      span.className = "lv-mark";
      if (parent.closest('[class*="band-"]')) span.classList.add("lv-mark--band");
      range.surroundContents(span);
      spans.push(span);
      break;
    }
  }
  if (reduceMotion || !spans.length || !("IntersectionObserver" in window)) return; // Static highlight.

  // Draw each highlight once and leave it. Collapse it first, then let it grow when it is on screen.
  // A phrase already on screen at load waits a moment, so the swipe is seen rather than missed.
  for (const span of spans) span.classList.add("lv-pre");
  const startedAt = performance.now();
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target as HTMLElement;
        io.unobserve(target);
        const wait = Math.max(0, 450 - (performance.now() - startedAt));
        setTimeout(() => target.classList.add("lv-in"), wait);
      }
    },
    { rootMargin: "0px 0px -12% 0px" },
  );
  for (const span of spans) io.observe(span);
}

// ---- rows -----------------------------------------------------------------------------------
// The fill makes the whole row look clickable, so make it so. The title link stays the real,
// keyboard-reachable control; this only forwards a plain click on the row to it.
function initRows() {
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const target = e.target as Element | null;
    if (!target || target.closest("a, button, input, select, textarea, summary")) return;
    const row = target.closest("li.row");
    if (!row || getSelection()?.toString()) return;
    row.querySelector<HTMLAnchorElement>("a.row-link")?.click();
  });
}

// ---- sticker --------------------------------------------------------------------------------
function makeChip(text: string) {
  const chip = document.createElement("span");
  chip.className = "lv-chip";
  chip.setAttribute("aria-hidden", "true");
  chip.textContent = text;
  return chip;
}

function initSticker() {
  const heroPicture = document.querySelector<HTMLElement>(".hero picture");
  if (heroPicture && !heroPicture.querySelector(".lv-chip")) {
    heroPicture.classList.add("lv-sticker-host");
    heroPicture.append(makeChip("Dublin, IE"));
  }
  const photo = document.querySelector<HTMLElement>("main figure.photo");
  if (photo && !photo.querySelector(".lv-chip")) {
    photo.classList.add("lv-sticker-host");
    photo.append(makeChip("Dublin, IE"));
  }
}

if (active.has("marker")) initMarker();
if (active.has("rows")) initRows();
if (active.has("sticker")) initSticker();
