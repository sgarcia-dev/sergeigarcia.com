import type { Pt, Target } from "./types";
import { clamp, lerp, easeOut, f2 } from "./math";
import { el } from "./dom";

/** ms from `finger.tap()` until the press lands. Schedule the tap's effect this long after the call. */
export const FINGER_ARRIVE = 480;
const PRESS = 140;
const LINGER = 160;
const FADE = 260;
const RING = 460;
const SIZE = 38;

interface Seq {
  target: Target;
  start: number;
  from: Pt;
  hold: boolean;
  releaseAt: number;
}

const at = (t: Target): Pt => (typeof t === "function" ? t() : t);

/** The soft round touch indicator. Everything is computed from the scene clock, so it replays. */
export class Finger {
  readonly el = el("div", "wh-finger", '<i class="r"></i><i class="d"></i>');
  private ring = this.el.firstChild as HTMLElement;
  private dot = this.el.lastChild as HTMLElement;
  private seq: Seq | null = null;

  private begin(target: Target, now: number, hold: boolean) {
    const p = at(target);
    this.seq = { target, start: now, from: { x: p.x + 26, y: p.y + 44 }, hold, releaseAt: hold ? Infinity : now + FINGER_ARRIVE + PRESS };
  }
  tap(target: Target, now: number) { this.begin(target, now, false); }
  hold(target: Target, now: number) { this.begin(target, now, true); }
  release(now: number) { if (this.seq && this.seq.hold) this.seq.releaseAt = now; }

  tick(now: number) {
    const s = this.seq;
    if (!s) { this.el.style.opacity = "0"; return; }
    const age = now - s.start;
    const tgt = at(s.target);
    let x = tgt.x, y = tgt.y, alpha = 1, press = 0, ring = 0;
    if (age < 0) { alpha = 0; }
    else if (age < FINGER_ARRIVE) {
      const k = easeOut(age / FINGER_ARRIVE);
      x = lerp(s.from.x, tgt.x, k); y = lerp(s.from.y, tgt.y, k);
      alpha = clamp(age / 160);
    } else {
      const down = now - (s.start + FINGER_ARRIVE);
      press = clamp(down / 70) * (1 - clamp((now - s.releaseAt) / 120));
      ring = clamp(down / RING);
      alpha = 1 - clamp((now - s.releaseAt - LINGER) / FADE);
    }
    const sc = 1 - 0.22 * press;
    this.el.style.opacity = String(f2(alpha));
    this.el.style.transform = `translate(${f2(x - SIZE / 2)}px,${f2(y - SIZE / 2)}px)`;
    this.dot.style.transform = `scale(${f2(sc)})`;
    this.ring.style.opacity = ring > 0 && ring < 1 ? String(f2(0.55 * (1 - ring))) : "0";
    this.ring.style.transform = `scale(${f2(lerp(0.7, 1.9, easeOut(ring)))})`;
  }
}
