/**
 * The bubble faces, ported from the app's motion painters (read only reference:
 * accessibility/bubble/motion in the app repo). Motion units: the disc radius is 28, the box is
 * -40..40, 1 unit = 1 mockup dp. Colors are the app's dark palette.
 */
import type { Stage } from "./types";
import { TAU, clamp, lerp, easeOut, easeInOut, smoother, bump, hash, f2, mix, fillHeight } from "./math";

export const R = 28;
const EDGE = 38.4;
const NS = "http://www.w3.org/2000/svg";

export const PAL: Record<Stage, { fill: string; ink: string }> = {
  idle: { fill: "#0f5134", ink: "#94d4b1" },
  recording: { fill: "#b3261e", ink: "#ffffff" },
  transcribing: { fill: "#8ab4f8", ink: "#0b2a52" },
  cleaning: { fill: "#d0bcff", ink: "#381e72" },
  done: { fill: "#94d4b1", ink: "#013822" },
};
export const BRAND = "#94d4b1";

export interface FaceFrame {
  /** Seconds since this stage began. */
  t: number;
  /** Audio level 0..1 (recording only). */
  level: number;
  /** Draw the calm still. */
  reduced: boolean;
}

let uidCounter = 0;

const STAR = "M0 -1Q.22 -.22 1 0Q.22 .22 0 1Q-.22 .22 -1 0Q-.22 -.22 0 -1Z";
const star = (x: number, y: number, size: number, rot: number) =>
  size <= 0.05 ? "scale(0)" : `translate(${f2(x)} ${f2(y)}) rotate(${f2(rot)}) scale(${f2(size)})`;

// The mic glyph of the idle bubble (launcher art, 72 art units wide, origin 18,15.5).
const AIR_R =
  "M68.64,27.85 C68.81,28.15 69.34,29.06 69.66,29.67 C69.97,30.28 70.21,30.92 70.51,31.49 C70.82,32.05 71.11,32.58 71.49,33.06 C71.87,33.54 72.31,33.94 72.79,34.35 C73.28,34.75 73.85,35.1 74.4,35.5 C74.94,35.91 75.55,36.3 76.05,36.77 C76.55,37.23 77.04,37.75 77.38,38.31 C77.72,38.88 77.97,39.52 78.1,40.17 C78.23,40.82 78.21,41.53 78.14,42.2 C78.08,42.88 77.87,43.58 77.72,44.24 C77.56,44.91 77.34,45.55 77.22,46.17 C77.1,46.8 77,47.39 77,48 C77,48.61 77.1,49.2 77.22,49.83 C77.34,50.45 77.56,51.09 77.72,51.76 C77.87,52.42 78.08,53.12 78.14,53.8 C78.21,54.47 78.23,55.18 78.1,55.83 C77.97,56.48 77.72,57.12 77.38,57.69 C77.04,58.25 76.55,58.77 76.05,59.23 C75.55,59.7 74.94,60.09 74.4,60.5 C73.85,60.9 73.28,61.25 72.79,61.65 C72.31,62.06 71.87,62.46 71.49,62.94 C71.11,63.42 70.82,63.95 70.51,64.51 C70.21,65.08 69.97,65.72 69.66,66.33 C69.34,66.94 68.81,67.85 68.64,68.15";
const AIR_L =
  "M40.19,67.01 C39.86,66.92 38.87,66.69 38.22,66.47 C37.57,66.26 36.88,66.04 36.29,65.71 C35.7,65.38 35.13,64.98 34.69,64.49 C34.25,64.01 33.9,63.41 33.64,62.8 C33.38,62.18 33.25,61.47 33.13,60.79 C33.01,60.11 33,59.4 32.92,58.74 C32.85,58.08 32.81,57.44 32.67,56.84 C32.52,56.23 32.33,55.68 32.07,55.13 C31.81,54.57 31.44,54.05 31.08,53.5 C30.72,52.95 30.26,52.4 29.91,51.82 C29.56,51.23 29.18,50.61 28.96,49.97 C28.75,49.33 28.6,48.66 28.6,48 C28.6,47.34 28.75,46.67 28.96,46.03 C29.18,45.39 29.56,44.77 29.91,44.18 C30.26,43.6 30.72,43.05 31.08,42.5 C31.44,41.95 31.81,41.43 32.07,40.87 C32.33,40.32 32.52,39.77 32.67,39.16 C32.81,38.56 32.85,37.92 32.92,37.26 C33,36.6 33.01,35.89 33.13,35.21 C33.25,34.53 33.38,33.82 33.64,33.2 C33.9,32.59 34.25,31.99 34.69,31.51 C35.13,31.02 35.7,30.62 36.29,30.29 C36.88,29.96 37.57,29.74 38.22,29.53 C38.87,29.31 39.86,29.08 40.19,28.99";

function idleArt(uid: number): string {
  const top = mix(BRAND, "#ffffff", 0.1);
  const cut = mix(PAL.idle.fill, "#000000", 0.3);
  const s = R * 1.6;
  return `<defs><linearGradient id="g${uid}" gradientUnits="userSpaceOnUse" x1="0" y1="28" x2="0" y2="77"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${BRAND}"/></linearGradient></defs>
<g transform="translate(${-s / 2} ${-s / 2}) scale(${f2(s / 72)}) translate(-18 -15.5)" stroke-linecap="round" stroke-linejoin="round" fill="none">
<path d="${AIR_R}" stroke="url(#g${uid})" stroke-width="4.25" opacity=".75"/><path d="${AIR_L}" stroke="url(#g${uid})" stroke-width="4.25" opacity=".75"/>
<path d="M64.40,38.63 A14,14 0 0 1 64.40,57.37" stroke="url(#g${uid})" stroke-width="4.5"/><path d="M43.60,57.37 A14,14 0 0 1 43.60,38.63" stroke="url(#g${uid})" stroke-width="4.5"/>
<path d="M54,60 V70.5" stroke="url(#g${uid})" stroke-width="4.5"/>
<path d="M43.5,77 A10.5,6.5 0 0 1 64.5,77 Z" fill="${BRAND}" stroke="none"/>
<rect x="47.5" y="36" width="13" height="24" rx="6.5" fill="url(#g${uid})" stroke="none"/>
<path d="M50.6,41.2 V50.5" stroke="#fff" stroke-width="1.6" opacity=".55"/>
<path d="M48.2,48.6 C50.1,46.6 52,46.6 54,48.6 C56,50.6 57.9,50.6 59.8,48.6" stroke="${cut}" stroke-width="1.9"/></g>`;
}

const GEM_OUT = "M-7.8 -13.65L7.8 -13.65L16.9 -5.85L0 13.65L-16.9 -5.85Z";
const GEM_FACETS = [
  [-16.9, -5.85, -7.8, -13.65, -5.85, -5.85],
  [-7.8, -13.65, 0, -5.85, -5.85, -5.85],
  [-7.8, -13.65, 7.8, -13.65, 0, -5.85],
  [7.8, -13.65, 5.85, -5.85, 0, -5.85],
  [7.8, -13.65, 16.9, -5.85, 5.85, -5.85],
  [-16.9, -5.85, -5.85, -5.85, 0, 13.65],
  [-5.85, -5.85, 5.85, -5.85, 0, 13.65],
  [5.85, -5.85, 16.9, -5.85, 0, 13.65],
];
const GEM_OP = [0.62, 0.84, 1, 0.72, 0.5, 0.74, 0.9, 0.46];
const BX = [18, -19, 33, -4, 27, -34];
const BY = [-16, -15, 13, -35, -25, -6];
const BS = [4.8, 4.2, 3.6, 3, 2.8, 3.2];
const LINES = 7;
const PARTS = 40;

function markup(stage: Stage, uid: number): string {
  const { fill, ink } = PAL[stage];
  const glass = mix(fill, "#000000", 0.35);
  const disc = `<circle r="${R}" fill="${fill}"/>`;
  let body = "";
  if (stage === "idle") body = disc + idleArt(uid);
  else if (stage === "recording")
    body = `<path class="ring" fill="none" stroke="${fill}" stroke-width="1.6" stroke-linejoin="round"/>
<circle r="${R}" fill="${glass}"/><clipPath id="c${uid}"><circle r="${R}"/></clipPath>
<path class="liq" clip-path="url(#c${uid})" fill="${fill}"/><circle r="${R - 0.6}" fill="none" stroke="${fill}" stroke-width="1.2"/>
<rect x="-8.5" y="-8.5" width="17" height="17" rx="3" fill="${ink}"/>`;
  else if (stage === "transcribing") {
    const lines = Array.from({ length: LINES }, () => `<rect class="rule" height="3.4" rx="1.7" fill="${ink}"/><rect class="ink" height="3.4" rx="1.7" fill="${ink}"/>`).join("");
    const bars = [0, 1, 2].map(() => `<rect class="bar" fill="${ink}"/>`).join("");
    body = `<circle r="33" fill="none" stroke="${fill}" stroke-width="1.6" opacity=".25"/><path class="arc" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
${disc}${lines}${bars}<rect class="caret" width="1.6" height="6" rx=".8" fill="${ink}"/>`;
  } else if (stage === "cleaning") {
    const facets = GEM_FACETS.map((f, i) => `<path d="M${f[0]} ${f[1]}L${f[2]} ${f[3]}L${f[4]} ${f[5]}Z" fill="${ink}" fill-opacity="${GEM_OP[i]}" stroke="${fill}" stroke-width=".7" stroke-linejoin="round"/>`).join("");
    const stars = Array.from({ length: 9 }, () => `<path class="st" d="${STAR}" fill="${ink}"/>`).join("");
    body = `${disc}<clipPath id="c${uid}"><path d="${GEM_OUT}"/></clipPath>
<linearGradient id="s${uid}"><stop offset="0" stop-color="${mix(ink, fill, 0.15)}" stop-opacity="0"/><stop offset=".5" stop-color="${mix(ink, fill, 0.15)}" stop-opacity=".75"/><stop offset="1" stop-color="${mix(ink, fill, 0.15)}" stop-opacity="0"/></linearGradient>
<g class="gem">${facets}<g clip-path="url(#c${uid})"><rect class="shine" y="-40" width="12" height="80" fill="url(#s${uid})"/></g>
<path d="${GEM_OUT}" fill="none" stroke="${ink}" stroke-width="1.1" stroke-linejoin="round"/></g>${stars}`;
  } else {
    const parts = Array.from({ length: PARTS }, () => `<circle class="pt"/>`).join("");
    body = `<circle class="shock" fill="none" stroke="${fill}" stroke-width="2.4"/><circle class="pulse" r="${R}" fill="none" stroke="${fill}" stroke-width="2.4" opacity="0"/>
${disc}<path class="chk" d="M-10.6 .6L-2.8 8.4L11.8 -7.8" pathLength="1" stroke-dasharray="1" fill="none" stroke="${ink}" stroke-width="3.9" stroke-linecap="round" stroke-linejoin="round"/>${parts}`;
  }
  // The shared finish: a calm sheen and a soft top edge highlight, on every face.
  const finish = `<defs><linearGradient id="h${uid}" gradientUnits="userSpaceOnUse" x1="0" y1="-28" x2="0" y2="28"><stop offset="0" stop-color="#fff" stop-opacity=".06"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".08"/></linearGradient></defs>
<circle r="${R}" fill="url(#h${uid})"/><path d="M-23.7 -13.9A27.5 27.5 0 0 1 23.7 -13.9" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1.1" stroke-linecap="round"/>`;
  // Stage content is drawn after the finish for the ring layers only, so the sheen sits on the disc.
  return body + finish;
}

export class Face {
  readonly g: SVGGElement;
  private inner: SVGGElement;
  private uid = ++uidCounter;
  private $: Record<string, SVGElement | SVGElement[]> = {};
  // recording follower state
  private lastT = -1;
  private lvl = 0;
  private surface = 0;
  private speed = 0;
  private trough = 0;
  // done particles
  private pAng: number[] = [];
  private pReach: number[] = [];
  private pRad: number[] = [];
  private pDelay: number[] = [];
  private pTint: number[] = [];

  constructor(readonly stage: Stage, seed = 1) {
    this.g = document.createElementNS(NS, "g");
    this.inner = document.createElementNS(NS, "g");
    this.g.appendChild(this.inner);
    this.inner.innerHTML = markup(stage, this.uid);
    const one = (s: string) => this.inner.querySelector(s) as SVGElement;
    const all = (s: string) => Array.from(this.inner.querySelectorAll(s)) as SVGElement[];
    if (stage === "recording") this.$ = { ring: one(".ring"), liq: one(".liq") };
    if (stage === "transcribing")
      this.$ = { arc: one(".arc"), rule: all(".rule"), ink: all(".ink"), bar: all(".bar"), caret: one(".caret") };
    if (stage === "cleaning") this.$ = { gem: one(".gem"), shine: one(".shine"), st: all(".st") };
    if (stage === "done") {
      this.$ = { shock: one(".shock"), chk: one(".chk"), pt: all(".pt") };
      const open = Math.PI;
      const squeeze = 0.55;
      for (let i = 0; i < PARTS; i++) {
        const a = (i + hash(seed * 7 + i)) * (TAU / PARTS);
        let rel = (a - open) % TAU;
        if (rel > Math.PI) rel -= TAU;
        if (rel < -Math.PI) rel += TAU;
        this.pAng.push(open + rel * squeeze);
        this.pReach.push(Math.min(R + 80, R + 26 + hash(seed * 13 + i) * 48));
        this.pRad.push(2.2 + hash(seed * 17 + i) * 3.8);
        this.pDelay.push(hash(seed * 19 + i) * 140);
        this.pTint.push(hash(seed * 23 + i) < 0.35 ? 0.55 : 0);
      }
    }
  }

  /** Whole-face transform used for the hand-off spring and the done bounce. */
  setXform(scale: number, alpha: number) {
    this.g.setAttribute("transform", `scale(${f2(scale)})`);
    this.g.setAttribute("opacity", String(f2(alpha)));
  }

  draw(fr: FaceFrame) {
    const t = fr.t;
    switch (this.stage) {
      case "recording": return this.drawRecording(fr);
      case "transcribing": return this.drawTranscribing(t);
      case "cleaning": return this.drawGem(t, fr.reduced);
      case "done": return this.drawDone(t, fr.reduced);
      default:
    }
  }

  private drawRecording(fr: FaceFrame) {
    const { ring, liq } = this.$ as { ring: SVGElement; liq: SVGElement };
    const t = fr.t;
    const raw = fr.reduced ? 0.5 : fr.level;
    const dt = t - this.lastT;
    if (this.lastT < 0 || dt < 0 || dt > 0.5) {
      this.lvl = this.surface = this.trough = raw;
      this.speed = 0;
    } else if (dt > 0) {
      const ms = dt * 1000;
      this.lvl += (raw - this.lvl) * (1 - Math.exp(-ms / (raw > this.lvl ? 40 : 300)));
      const before = this.surface;
      this.surface += (this.lvl - this.surface) * (1 - Math.exp(-ms / (this.lvl > this.surface ? 90 : 350)));
      this.speed = (this.surface - before) / dt;
      this.trough += (this.lvl - this.trough) * (1 - Math.exp(-ms / (this.lvl < this.trough ? 150 : 2500)));
    }
    this.lastT = t;
    const voice = Math.max(0, this.lvl - this.trough - 0.04);
    const amp = fr.reduced ? 0 : Math.min(3.2, 9 * voice);
    const sp = t * 4.2;
    let d = "";
    for (let i = 0; i <= 72; i++) {
      const th = (i / 72) * TAU;
      const rad = Math.min(EDGE - 0.8, R + 3.4 + amp * (0.75 * Math.sin(9 * th + sp) + 0.25 * Math.sin(5 * th - sp * 0.7)));
      d += (i ? "L" : "M") + f2(Math.cos(th) * rad) + " " + f2(Math.sin(th) * rad);
    }
    ring.setAttribute("d", d + "Z");
    ring.setAttribute("opacity", String(f2(0.3 + 0.7 * Math.min(1, voice * 3))));
    const top = R - fillHeight(this.surface, R);
    const slosh = fr.reduced ? 0 : Math.min(1.4, 0.4 + 0.9 * Math.abs(this.speed));
    let p = `M${-R} ${R + 1}`;
    for (let i = 0; i <= 16; i++) {
      const x = -R + (i * 2 * R) / 16;
      p += `L${f2(x)} ${f2(top + slosh * Math.sin(x * 0.2 + t * 2.4))}`;
    }
    liq.setAttribute("d", p + `L${R} ${R + 1}Z`);
  }

  private drawTranscribing(t: number) {
    const { arc, rule, ink, bar, caret } = this.$ as Record<string, SVGElement[]> & { arc: SVGElement; caret: SVGElement };
    const { fill, ink: inkC } = PAL.transcribing;
    const LX = -11, LY0 = -6.2, PITCH = 6.2, DOT = 3.4, W0 = 1.15, LP = 0.5, WD = 0.38;
    const CA = [0.6, 0.72, 0.84];
    const BH = [12.3, 22.4, 15.7];
    const BXs = [-7.3, 0, 7.3];
    const lineW = (n: number) => (n % 4 === 3 ? 8 + 5 * hash(n) : 14 + 8 * hash(n));
    const lineStart = (n: number) => W0 + n * LP;
    const nNow = Math.floor((t - W0) / LP);
    let scroll = 0;
    if (nNow + 1 >= 3) {
      const first = Math.max(3, nNow - 3);
      scroll = first - 3;
      for (let m = first; m <= nNow + 1; m++) scroll += smoother((t - lineStart(m) + 0.12) / 0.3);
    }
    const m = smoother((t - W0) / 0.8);
    const a = nNow >= 0 ? bump(t, lineStart(nNow) + WD - 0.1, 0.5) : 0;
    const b = nNow >= 1 ? bump(t, lineStart(nNow - 1) + WD - 0.1, 0.5) : 0;
    const swell = 0.45 * Math.max(a, b);
    // ring / wiggle arc
    const len = lerp(TAU, 1.7 + 0.5 * Math.sin(t * 1.3), m);
    const a0 = t * 1.6 - Math.PI / 2;
    const amp = 1.8 * m;
    const ph = -t * 4.5;
    let d = "";
    for (let i = 0; i <= 56; i++) {
      const an = a0 - len + (len * i) / 56;
      const rw = 33 + amp * Math.sin(12 * an + ph);
      d += (i ? "L" : "M") + f2(Math.cos(an) * rw) + " " + f2(Math.sin(an) * rw);
    }
    arc.setAttribute("d", d);
    arc.setAttribute("stroke", mix(fill, inkC, swell));
    arc.setAttribute("stroke-width", String(f2(lerp(2.2, 2.6, m) + 1.6 * swell)));
    // lines
    const used = new Set<number>();
    let cur: { x: number; y: number; op: number } | null = null;
    const put = (n: number, w: number, op: number, ruleOp: number, y: number) => {
      const k = n % LINES;
      used.add(k);
      const r = rule[k]!, i = ink[k]!;
      r.setAttribute("x", String(LX)); r.setAttribute("y", String(f2(y - DOT / 2))); r.setAttribute("width", String(f2(ruleOp ? lineW(n) : 0))); r.setAttribute("opacity", String(f2(ruleOp)));
      i.setAttribute("x", String(LX)); i.setAttribute("y", String(f2(y - DOT / 2))); i.setAttribute("width", String(f2(w))); i.setAttribute("opacity", String(f2(op)));
    };
    for (let n = Math.max(0, nNow - 4); n <= Math.max(2, nNow); n++) {
      const y = LY0 + (n - scroll) * PITCH;
      const op = 1 - smoother((LY0 - y) / PITCH);
      if (op <= 0) continue;
      const k = (t - lineStart(n)) / WD;
      if (k > 0) {
        const full = lineW(n);
        const w = Math.max(DOT, full * easeInOut(k));
        put(n, w, op, k < 1 ? 0.22 * op : 0, y);
        cur = { x: LX + w, y, op };
      } else if (n < 3 && t >= CA[n]! + 0.4) put(n, DOT, op, 0, y);
    }
    for (let k = 0; k < LINES; k++) if (!used.has(k)) { rule[k]!.setAttribute("opacity", "0"); ink[k]!.setAttribute("opacity", "0"); }
    // opening bars
    for (let i = 0; i < 3; i++) {
      const k = smoother((t - CA[i]!) / 0.4);
      const e = bar[i]!;
      if (k >= 1) { e.setAttribute("opacity", "0"); continue; }
      const h0 = BH[i]! * (1 + 0.28 * Math.sin(t * 7 + i * 2.1));
      const x = lerp(BXs[i]!, LX + DOT / 2, k), y = lerp(0, LY0 + i * PITCH, k);
      const w = lerp(3.9, DOT, k), h = lerp(h0, DOT, k);
      e.setAttribute("x", String(f2(x - w / 2))); e.setAttribute("y", String(f2(y - h / 2)));
      e.setAttribute("width", String(f2(w))); e.setAttribute("height", String(f2(h)));
      e.setAttribute("rx", String(f2(Math.min(1.95, w / 2, h / 2)))); e.setAttribute("opacity", "1");
    }
    if (cur) {
      caret.setAttribute("x", String(f2(cur.x + 1.4))); caret.setAttribute("y", String(f2(cur.y - 3)));
      caret.setAttribute("opacity", String(f2(0.9 * cur.op)));
    } else caret.setAttribute("opacity", "0");
  }

  private drawGem(t0: number, reduced: boolean) {
    const { gem, shine, st } = this.$ as { gem: SVGElement; shine: SVGElement; st: SVGElement[] };
    const t = reduced ? 0 : t0;
    const p = (((t / 2.4) % 1) + 1) % 1;
    let scale: number;
    if (p < 0.3) { const k = 1 - p / 0.3; scale = 0.9 + 0.18 * (1 - k * k * k); }
    else if (p < 0.62) { const k = (p - 0.3) / 0.32; scale = 1 + 0.08 * Math.exp(-4 * k) * Math.cos(6 * k); }
    else scale = 1 - 0.1 * easeInOut((p - 0.62) / 0.38);
    gem.setAttribute("transform", `scale(${f2(scale)})`);
    const showShine = p > 0.2 && p < 0.6;
    const sh = showShine ? -24 + 48 * easeInOut((p - 0.2) / 0.4) : NaN;
    shine.setAttribute("opacity", showShine ? "1" : "0");
    if (showShine) shine.setAttribute("transform", `rotate(22) translate(${f2(sh - 6)} 0)`);
    // burst sparkles (6), twinkles (2), shine star (1)
    for (let i = 0; i < 6; i++) {
      const q = (p - 0.5 - i * 0.035) / 0.3;
      const e = st[i]!;
      if (q <= 0 || q >= 1) { e.setAttribute("transform", "scale(0)"); continue; }
      const size = BS[i]! * Math.sin(Math.PI * q);
      const reach = Math.hypot(BX[i]!, BY[i]!);
      const fct = Math.min(1 + 0.18 * q, (EDGE - Math.max(0, size)) / reach);
      e.setAttribute("transform", star(BX[i]! * fct, BY[i]! * fct, size, 90 * q));
      e.setAttribute("opacity", String(f2(Math.sin(Math.PI * q))));
    }
    for (let i = 0; i < 2; i++) {
      const w = Math.pow(Math.sin(Math.PI * (t0 / 1.6 + i * 0.5)), 2);
      const e = st[6 + i]!;
      e.setAttribute("transform", star(i ? -17 : 19, i ? 13 : 11, (i ? 2.8 : 3.2) * (0.3 + 0.7 * w), 0));
      e.setAttribute("opacity", String(f2(0.35 + 0.65 * w)));
    }
    const last = st[8]!;
    if (showShine) {
      const dl = (sh - 10) / 5;
      const g = Math.exp(-dl * dl);
      if (g > 0.05) { last.setAttribute("transform", star(7.8 * scale + 1, -13.65 * scale - 1, 5.5 * g, 45 * g)); last.setAttribute("opacity", String(f2(g))); return; }
    }
    last.setAttribute("transform", "scale(0)");
  }

  private drawDone(t: number, reduced: boolean) {
    const { shock, chk, pt } = this.$ as { shock: SVGElement; chk: SVGElement; pt: SVGElement[] };
    const ms = reduced ? 1e5 : t * 1000;
    const pr = ms / 600;
    chk.setAttribute("stroke-dashoffset", String(f2(1 - (reduced ? 1 : easeOut(t / 0.3)))));
    // departing ring of the check ending
    const ring = this.inner.querySelector(".pulse") as SVGElement;
    if (pr > 0 && pr < 1 && !reduced) {
      ring.setAttribute("r", String(f2(R + (EDGE - 1.2 - R) * easeOut(pr))));
      ring.setAttribute("opacity", String(f2(1 - pr)));
    } else ring.setAttribute("opacity", "0");
    // celebration: shock ring and particles
    const ra = clamp(1 - ms / 520);
    shock.setAttribute("opacity", String(f2(ra)));
    shock.setAttribute("r", String(f2(lerp(R, R * 2.6, easeOut(ms / 520)))));
    for (let i = 0; i < PARTS; i++) {
      const u = clamp((ms - this.pDelay[i]!) / 950);
      const e = pt[i]!;
      if (ms < this.pDelay[i]! || u >= 1) { e.setAttribute("opacity", "0"); continue; }
      const dist = lerp(R * 0.9, this.pReach[i]!, easeOut(u));
      e.setAttribute("cx", String(f2(Math.cos(this.pAng[i]!) * dist)));
      e.setAttribute("cy", String(f2(Math.sin(this.pAng[i]!) * dist)));
      e.setAttribute("r", String(f2(this.pRad[i]! * (1 - 0.6 * u))));
      e.setAttribute("fill", this.pTint[i]! ? mix(BRAND, "#ffffff", this.pTint[i]!) : BRAND);
      e.setAttribute("opacity", String(f2(u < 0.45 ? 1 : 1 - (u - 0.45) / 0.55)));
    }
  }
}

/** Hand-off curves, seconds. The old face leaves in 0.15 s, the new one springs in. */
export const HandOff = {
  outScale: (t: number) => 1 - 0.1 * clamp(t / 0.15),
  outAlpha: (t: number) => 1 - clamp(t / 0.15),
  inScale: (t: number) => 1 - 0.2 * Math.exp(-13 * Math.max(0, t)) * Math.cos(19 * Math.max(0, t)),
  inAlpha: (t: number) => clamp(t / 0.25),
  done: (t: number) => t >= 0.5,
};

/** The done bounce: 1 to 1.3, back to 0.94, then 1, over 650 ms. */
export function bounceScale(ms: number): number {
  if (ms <= 0 || ms >= 650) return 1;
  if (ms < 220) return 1 + 0.3 * easeOut(ms / 220);
  if (ms < 430) return 1.3 + (0.94 - 1.3) * easeInOut((ms - 220) / 210);
  return 0.94 + 0.06 * easeOut((ms - 430) / 220);
}
