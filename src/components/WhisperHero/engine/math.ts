export const TAU = Math.PI * 2;
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInOut = (t: number) => {
  const k = clamp(t);
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
};
/** Smoother step used by the app's transcribing animation. */
export const smoother = (x: number) => {
  const k = clamp(x);
  return k * k * k * (k * (k * 6 - 15) + 10);
};
/** 0..1..0 over d seconds starting at a. */
export const bump = (p: number, a: number, d: number) => Math.sin(Math.PI * clamp((p - a) / d));
/** Deterministic 0..1 value. */
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const f2 = (n: number) => Math.round(n * 100) / 100;

/** Mix two #rrggbb colors, k = share of b. */
export function mix(a: string, b: string, k: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, k));
  return "#" + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
}

/** Height of liquid (0..2R) for a share of a disc's area, as the app's FillTable. */
const STEPS = 32;
const area = (h: number) => {
  const d = 1 - h;
  return (Math.acos(clamp(d, -1, 1)) - d * Math.sqrt(Math.max(0, 2 * h - h * h))) / Math.PI;
};
const heights: number[] = [];
for (let i = 0; i <= STEPS; i++) {
  let lo = 0;
  let hi = 2;
  for (let j = 0; j < 24; j++) {
    const mid = (lo + hi) / 2;
    if (area(mid) < i / STEPS) lo = mid;
    else hi = mid;
  }
  heights.push((lo + hi) / 2);
}
export function fillHeight(fraction: number, r: number): number {
  const f = clamp(fraction) * STEPS;
  const i = Math.min(STEPS - 1, Math.floor(f));
  return (heights[i]! + (heights[i + 1]! - heights[i]!) * (f - i)) * r;
}

/** A made-up voice level: syllables with pauses. Always 0..1. */
export function speechLevel(t: number, seed = 0): number {
  const syl = Math.pow(Math.max(0, Math.sin(TAU * (t * 3.3 + hash(seed) * 4))), 0.8);
  const phrase = 0.55 + 0.45 * Math.sin(TAU * (t * 0.85 + hash(seed + 1)));
  const gate = clamp(0.6 + 1.6 * Math.sin(TAU * (t * 0.42 + hash(seed + 2) * 3)) + 0.4, 0, 1);
  return clamp(0.12 + 0.78 * syl * phrase * gate + 0.06 * Math.sin(t * 31));
}
