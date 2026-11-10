import type { Pt, Stage, StageOpts, Target } from "./types";
import { clamp, f2, speechLevel, hash } from "./math";
import { el } from "./dom";
import { Face, HandOff, bounceScale, type FaceFrame } from "./face";

/** Disc diameter in phone px. The face is drawn in motion units (disc radius 28). */
const D = 46;
const UNIT = D / 56;
const SZ = 80 * UNIT;
const STEP = 50;
const MINI = 0.66;
const NS = "http://www.w3.org/2000/svg";

const WORD: Record<Stage, string> = {
  idle: "",
  recording: "Recording",
  transcribing: "Transcribing",
  cleaning: "Cleaning",
  done: "Done",
};

const CLOUD =
  '<svg class="pc" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 18.500a4 4 0 01-.600-7.950A5.500 5.500 0 0116.900 8.800 4.800 4.800 0 0117 18.500z"/><path d="M4 4l16 16"/></svg>';
const WAVE =
  '<svg class="pv" viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">' +
  [2, 5.5, 9, 12.5].map((x) => `<rect x="${x}" y="6" width="2" height="4" rx="1" fill="currentColor"/>`).join("") +
  "</svg>";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

class Item {
  readonly el = el("div", "wh-b");
  readonly svg = document.createElementNS(NS, "svg");
  private host = document.createElementNS(NS, "g");
  readonly pill = el("div", "wh-pill");
  private words = el("span", "pw");
  private tm = el("span", "pt", "0:00");
  private bars: SVGElement[] = [];
  face: Face | null = null;
  leaving: Face | null = null;
  stage: Stage = "idle";
  stageAt = 0;
  handAt = -1e9;
  level: (t: number) => number;
  timer: "reset" | "keep" | "hide" = "hide";
  timerStart = 0;
  y = 0;
  ty = 0;
  scale = 0;
  ts = 1;
  mini = false;
  removing = false;
  gone = false;
  private shown = "";
  private lastSec = -1;

  constructor(readonly id: string, words: string[], x: number) {
    this.level = (t) => speechLevel(t, Math.round(hash(id.length * 7 + id.charCodeAt(0)) * 50));
    this.svg.setAttribute("viewBox", "-40 -40 80 80");
    this.svg.setAttribute("class", "wh-bs");
    this.svg.setAttribute("width", String(f2(SZ)));
    this.svg.setAttribute("height", String(f2(SZ)));
    this.svg.appendChild(this.host);
    this.el.appendChild(this.svg);
    this.pill.innerHTML = `<span class="pi">${WAVE}${CLOUD}</span>`;
    this.pill.appendChild(this.words);
    this.pill.appendChild(this.tm);
    for (const w of words) this.words.appendChild(el("b", "", w));
    this.el.appendChild(this.pill);
    this.bars = Array.from(this.pill.querySelectorAll(".pv rect")) as SVGElement[];
    this.el.style.left = `${x}px`;
  }

  private showWord(w: string) {
    if (w === this.shown) return;
    this.shown = w;
    let hit = false;
    for (const b of Array.from(this.words.children)) {
      const on = b.textContent === w;
      hit = hit || on;
      b.classList.toggle("on", on);
    }
    if (!hit && w) {
      const b = el("b", "on", w);
      this.words.appendChild(b);
    }
  }

  setStage(stage: Stage, now: number, o: StageOpts, seedN: number) {
    if (stage === this.stage && this.face) {
      // Same face: only the pill text and clock change.
      const t = o.timer ?? "reset";
      if (t === "reset") this.timerStart = now;
      this.timer = stage === "idle" || stage === "done" ? "hide" : t === "keep" ? this.timer : t;
      this.showWord(stage === "idle" ? "" : o.word ?? WORD[stage]);
      return;
    }
    if (this.face) {
      this.leaving = this.face;
      this.host.insertBefore(this.leaving.g, this.host.firstChild);
    }
    this.face = new Face(stage, seedN);
    this.host.appendChild(this.face.g);
    // drop an older leaving face
    while (this.host.childNodes.length > 2) this.host.removeChild(this.host.firstChild as Node);
    this.stage = stage;
    this.stageAt = now;
    this.handAt = now;
    if (o.level) this.level = o.level;
    const t = o.timer ?? "reset";
    if (t === "reset") this.timerStart = now;
    this.timer = stage === "idle" || stage === "done" ? "hide" : t;
    this.showWord(stage === "idle" ? "" : o.word ?? WORD[stage]);
    this.pill.dataset.st = stage;
    this.mini = false;
    this.ts = 1;
  }

  tick(now: number, dt: number, reduced: boolean, snap: boolean) {
    const k = snap ? 1 : 1 - Math.exp(-dt / 110);
    this.y += (this.ty - this.y) * k;
    this.scale += (this.ts - this.scale) * k;
    if (this.removing && this.scale < 0.03) { this.gone = true; return; }
    this.el.style.transform = `translate(0px,${f2(this.y)}px)`;
    this.svg.style.transform = `translate(${f2(-SZ / 2)}px,${f2(-SZ / 2)}px) scale(${f2(Math.max(0, this.scale))})`;
    const t = Math.max(0, (now - this.stageAt) / 1000);
    const handT = snap ? 1e3 : (now - this.handAt) / 1000;
    if (this.leaving && HandOff.done(handT)) { this.host.removeChild(this.leaving.g); this.leaving = null; }
    if (this.leaving) {
      this.leaving.setXform(HandOff.outScale(handT), HandOff.outAlpha(handT));
    }
    if (this.face) {
      const lvl = this.stage === "recording" ? clamp(this.level(t)) : 0;
      const fr: FaceFrame = { t, level: lvl, reduced };
      this.face.draw(fr);
      const born = this.handAt > -1e8;
      let s = born && !reduced ? HandOff.inScale(handT) : 1;
      if (this.stage === "done" && !reduced) s *= bounceScale((now - this.stageAt));
      const a = reduced || !born || handT > 1 ? 1 : HandOff.inAlpha(handT);
      this.face.setXform(s, a);
      if (this.stage === "recording") {
        const l = reduced ? 0.5 : lvl;
        this.bars.forEach((b, i) => {
          const h = 3 + 10 * clamp(l * (0.7 + 0.3 * Math.sin(now / 90 + i * 1.7)) * 1.2);
          b.setAttribute("height", String(f2(h)));
          b.setAttribute("y", String(f2(8 - h / 2)));
        });
      }
    }
    const on = this.stage !== "idle";
    this.pill.classList.toggle("on", on);
    if (this.timer === "hide") { if (this.lastSec !== -2) { this.tm.textContent = ""; this.lastSec = -2; } }
    else {
      const sec = Math.max(0, Math.floor((now - this.timerStart) / 1000));
      if (sec !== this.lastSec) { this.lastSec = sec; this.tm.textContent = mmss(sec); }
    }
  }
}

/** The stack of bubbles at the right edge. The first bubble sits at the anchor, newer ones above it. */
export class Stack {
  readonly layer = el("div", "wh-over");
  private items: Item[] = [];
  private seed = 0;
  constructor(private cx: number, private anchorY: number, private origin: Pt) {}

  private get(id: string): Item | undefined {
    return this.items.find((i) => i.id === id);
  }

  private relayout() {
    let n = 0;
    for (const it of this.items) if (!it.removing) it.ty = this.anchorY - STEP * n++;
  }

  add(id: string, now: number, opts: { mini?: boolean; words?: string[] } = {}) {
    if (this.get(id)) return;
    const it = new Item(id, opts.words ?? [], this.cx);
    it.mini = !!opts.mini;
    it.ts = opts.mini ? MINI : 1;
    this.items.push(it);
    this.layer.appendChild(it.el);
    this.relayout();
    it.y = it.ty + (opts.mini ? 6 : 0);
    it.setStage("idle", now, {}, ++this.seed);
    it.handAt = -1e9;
  }

  stage(id: string, stage: Stage, now: number, o: StageOpts = {}) {
    const it = this.get(id);
    if (!it) return;
    it.setStage(stage, now, o, ++this.seed);
    this.relayout();
  }

  remove(id: string) {
    const it = this.get(id);
    if (!it) return;
    it.removing = true;
    it.ts = 0;
    it.pill.classList.remove("on");
    this.relayout();
  }

  pos(id: string): () => Pt {
    return () => {
      const it = this.get(id);
      return { x: this.cx + this.origin.x, y: (it ? it.y : this.anchorY) + this.origin.y };
    };
  }

  tick(now: number, dt: number, reduced: boolean, snap: boolean) {
    for (const it of this.items) it.tick(now, dt, reduced, snap);
    const gone = this.items.filter((i) => i.gone);
    for (const g of gone) g.el.remove();
    if (gone.length) this.items = this.items.filter((i) => !i.gone);
  }
}

export type { Target };
