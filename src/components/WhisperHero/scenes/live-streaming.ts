import type { Ctx, Scene } from "../engine/types";
import { FINGER_ARRIVE } from "../engine/finger";
import { chatTelegramLike } from "../skins/live-streaming-chat";
import { keyboardGboardLike } from "../skins/live-streaming-keyboard";

/** Display name exactly as the app shows it (model catalog: Nemotron, the only streaming model). */
const MODEL = "Nemotron 3.5 Live";
const WORDS = ["Recording", MODEL, "Done"];

/** What the person says. Nemotron streams it as is, and there is no clean-up step, so the text never changes. */
const SPOKEN = "Running ten minutes late, start without me. I'll grab us a table by the window.".split(" ");
/** Scene time each word shows up. The pace follows speech: quick runs, a pause at the full stop. */
const START = 1500;
const GAP = [420, 380, 330, 520, 460, 400, 700, 340, 460, 330, 300, 380, 420, 360, 0];
const WORD_AT: number[] = [];
{
  let t = START;
  for (let i = 0; i < SPOKEN.length; i++) {
    WORD_AT.push(t);
    t += GAP[i] ?? 400;
  }
}
const FULL = SPOKEN.join(" ");
const LAST_WORD = WORD_AT[WORD_AT.length - 1]!;
const STOP = LAST_WORD + 1100;
const BKSP = STOP + 2900;
const BKSP_MS = 1800;

/** How many words have been heard at scene time `t`. */
const heard = (t: number) => WORD_AT.filter((w) => t >= w).length;

/**
 * Streaming shows the newest two words dim (still open to change) and the rest as settled text.
 * The app does the same: older words firm, the tail dimmer.
 */
function stream(c: Ctx, t: number) {
  const n = heard(t);
  const firm = Math.max(0, n - 2);
  c.field.set(SPOKEN.slice(0, firm).join(" "));
  if (n > firm) c.field.live(SPOKEN.slice(firm, n).join(" "));
}

/** How much of `full` is left after holding backspace for `e` ms (first press, repeat, then whole words). */
function afterBackspace(full: string, e: number): string {
  let len = full.length - 1;
  let tt = 350;
  while (len > 0 && tt <= e) {
    if (tt < 900) len -= 1;
    else len = Math.max(0, full.lastIndexOf(" ", len - 1));
    tt += tt < 900 ? 55 : 120;
  }
  return full.slice(0, Math.max(0, len));
}

const A = FINGER_ARRIVE;

const scene: Scene = {
  id: "live-streaming",
  title: "Live words",
  blurb: "Nemotron 3.5 Live shows words as you speak, on your phone.",
  aria:
    "Animated demo of live dictation with Nemotron 3.5 Live over a chat.",
  implemented: true,
  phone: { w: 296, h: 620, radius: 52, bezel: 8, camera: "punch" },
  chat: {
    ...chatTelegramLike,
    contact: "Dana",
    status: "online",
    dateChip: "Today",
    messages: [
      { from: "them", text: "Where are you? Our table is for 7:30.", time: "7:24" },
    ],
  },
  keyboard: keyboardGboardLike,
  duration: BKSP + A + BKSP_MS + 700,
  still: 9200,
  steps: [
    { at: 0, run: (c) => c.stack.add("a", { words: WORDS }) },
    { at: 300, run: (c) => c.finger.tap(c.stack.pos("a")) },
    { at: 300 + A, run: (c) => c.stack.stage("a", "recording", { word: "Recording" }) },
    // The first word lands: the bubble turns streaming blue and the pill names the live model.
    { at: START - 150, run: (c) => c.stack.stage("a", "transcribing", { word: MODEL, timer: "keep" }) },
    // Words appear one by one while the person is still speaking.
    ...WORD_AT.map((t) => ({ at: t, run: (c: Ctx) => stream(c, t) })),
    // The last words settle, then the person taps to stop. No clean-up: the text is already final.
    { at: LAST_WORD + 700, run: (c) => c.field.set(FULL) },
    { at: STOP, run: (c) => c.finger.tap(c.stack.pos("a")) },
    { at: STOP + A, run: (c) => { c.field.set(FULL); c.stack.stage("a", "done"); } },
    { at: STOP + A + 1500, run: (c) => c.stack.stage("a", "idle") },
    // Hold backspace until the field is empty.
    { at: BKSP, run: (c) => c.finger.hold(c.kbd.pos("bksp")) },
    { at: BKSP + A, run: (c) => c.kbd.press("bksp") },
    { at: BKSP + A, dur: BKSP_MS, run: (c, p) => c.field.set(p >= 1 ? "" : afterBackspace(FULL, p * BKSP_MS)) },
    { at: BKSP + A + BKSP_MS, run: (c) => { c.kbd.release("bksp"); c.finger.release(); } },
  ],
};

export default scene;
