// Liveliness scripts: marker draw-in, row click forwarding, sticker chips. The CSS is in
// src/styles/lively.css. Everything added here is decorative or a copy of text already on the page,
// and nothing here touches an element that carries a view-transition-name.

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- marker ---------------------------------------------------------------------------------
// The phrases are wrapped in <span class="lv-mark"> in the page markup, so no text node is ever
// split at runtime (the glyph reveal in motion.ts reads those nodes). Here we only draw them in:
// each highlight starts collapsed (CSS, while html[data-tex] is set) and grows once when it is
// on screen. A phrase already on screen at load waits a moment, so the swipe is seen, not missed.
function initMarker() {
  const marks = Array.from(document.querySelectorAll<HTMLElement>(".lv-mark"));
  if (!marks.length) return;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    for (const mark of marks) mark.classList.add("lv-in");
    return;
  }
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
  for (const mark of marks) io.observe(mark);
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

initMarker();
initRows();
initSticker();
