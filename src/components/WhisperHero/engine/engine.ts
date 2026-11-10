import type { Scene } from "./types";
import { buildPhone, type PhoneView } from "./phone";
import { clamp } from "./math";
import { el, q } from "./dom";

const FADE_MS = 380;

/**
 * Runs the loop. `root` holds `.wh-stage`, `.wh-slot`, `.wh-cap` and `.wh-dots` (see Hero.astro).
 * Scenes that are not implemented are skipped. The clock only runs while the hero is on screen and
 * the tab is visible. With reduced motion it shows one still frame and never animates.
 */
export function startHero(root: HTMLElement, all: Scene[]): void {
  const scenes = all.filter((s) => s.implemented && s.steps.length > 0);
  if (!scenes.length) return;
  for (const s of scenes) s.steps.sort((a, b) => a.at - b.at);
  const stage = q(root, ".wh-stage");
  const slot = q(root, ".wh-slot");
  const cap = q(root, ".wh-cap");
  const dots = q(root, ".wh-dots");
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

  stage.setAttribute("aria-label", scenes.map((s) => s.aria).join(" "));
  dots.innerHTML = "";
  const buttons = scenes.map((s, i) => {
    const b = el("button", "wh-dot");
    b.type = "button";
    b.setAttribute("aria-label", `Show: ${s.title}`);
    b.addEventListener("click", () => go(i));
    dots.appendChild(b);
    return b;
  });
  dots.hidden = scenes.length < 2;

  let idx = 0;
  let phone: PhoneView | null = null;
  let t = 0;
  let fired: number[] = [];
  let mode: "play" | "out" = "play";
  let modeT = 0;
  let onScreen = true;
  let raf = 0;
  let last = 0;

  function load(i: number) {
    idx = i;
    const sc = scenes[i]!;
    slot.innerHTML = "";
    phone = buildPhone(sc);
    slot.appendChild(phone.el);
    phone.ready();
    t = 0;
    mode = "play";
    modeT = 0;
    fired = new Array(sc.steps.length).fill(0);
    cap.innerHTML = `<b></b> <span></span>`;
    (cap.firstChild as HTMLElement).textContent = sc.title;
    (cap.lastChild as HTMLElement).textContent = sc.blurb;
    buttons.forEach((b, k) => b.setAttribute("aria-current", k === i ? "true" : "false"));
    slot.classList.remove("out");
    if (mq.matches) {
      advance(sc.still);
      t = sc.still;
      phone.snap(t, true);
    } else {
      advance(0);
      phone.tick(0, 0, false);
    }
  }

  function advance(to: number) {
    const sc = scenes[idx]!;
    const ph = phone!;
    for (let i = 0; i < sc.steps.length; i++) {
      const s = sc.steps[i]!;
      if (to < s.at) break;
      if (!s.dur) {
        if (!fired[i]) {
          fired[i] = 1;
          ph.setNow(s.at);
          s.run(ph.ctx, 1);
        }
      } else if (fired[i] !== 2) {
        const p = clamp((to - s.at) / s.dur);
        ph.setNow(s.at + Math.min(to - s.at, s.dur));
        s.run(ph.ctx, p);
        fired[i] = p >= 1 ? 2 : 1;
      }
    }
    ph.setNow(to);
  }

  function go(i: number) {
    load(i);
    if (!mq.matches && !raf) kick();
  }

  function frame(ts: number) {
    raf = 0;
    if (!running()) return;
    const dt = Math.min(48, last ? ts - last : 16);
    last = ts;
    const sc = scenes[idx]!;
    if (mode === "play") {
      t += dt;
      advance(Math.min(t, sc.duration));
      if (t >= sc.duration) {
        mode = "out";
        modeT = 0;
        slot.classList.add("out");
      }
    } else {
      modeT += dt;
      if (modeT >= FADE_MS) {
        load((idx + 1) % scenes.length);
        raf = requestAnimationFrame(frame);
        return;
      }
    }
    phone!.tick(Math.min(t, sc.duration), dt, false);
    raf = requestAnimationFrame(frame);
  }

  const running = () => onScreen && !document.hidden && !mq.matches;
  function kick() {
    if (raf || !running()) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function sync() {
    root.dataset.state = mq.matches ? "still" : running() ? "playing" : "paused";
    if (running()) kick();
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  new IntersectionObserver(
    (es) => {
      onScreen = es.some((e) => e.isIntersecting);
      sync();
    },
    { threshold: 0.12 },
  ).observe(root);
  document.addEventListener("visibilitychange", sync);
  mq.addEventListener("change", () => {
    load(idx);
    sync();
  });

  load(0);
  sync();
}
