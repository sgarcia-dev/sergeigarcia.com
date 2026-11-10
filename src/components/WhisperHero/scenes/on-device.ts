import type { Scene } from "../engine/types";
import { FINGER_ARRIVE } from "../engine/finger";
import { chatWaLike } from "../skins/chat-wa";
import { keyboardSamsungLike } from "../skins/keyboard-samsung";

/** Display names exactly as the app shows them in the pill (model catalog, "(...)" notes dropped). */
const SPEECH = "Parakeet Ultra";
const CLEAN = "Gemma 4 E2B";
const WORDS = ["Recording", "Waiting", SPEECH, CLEAN, "Done"];

const T1 = "Friday works for me. Let's do the Italian place.";
const T2 = "I'll book it for seven.";
const FULL = `${T1} ${T2}`;

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
  id: "on-device",
  title: "On device",
  blurb: "Speech recognition and clean-up both run on this phone.",
  aria:
    "Scene one, on device: a person taps the floating microphone bubble over a chat, speaks, and the bubble shows recording, transcribing with Parakeet Ultra and cleaning up with Gemma 4 E2B. A second dictation is queued while the first finishes, both texts are added in order, and then holding the backspace key clears the text.",
  implemented: true,
  phone: { w: 300, h: 640, radius: 30, bezel: 7, camera: "punch", statusH: 26 },
  chat: {
    ...chatWaLike,
    contact: "Maya",
    status: "online",
    dateChip: "Today",
    messages: [
      { from: "them", text: "Are we still on for Friday?", time: "11:02" },
      { from: "them", text: "Where should we eat?", time: "11:02" },
    ],
  },
  keyboard: keyboardSamsungLike,
  duration: 14800,
  still: 3000,
  steps: [
    { at: 0, run: (c) => c.stack.add("a", { words: WORDS }) },
    // First dictation: tap, speak, tap to stop.
    { at: 300, run: (c) => c.finger.tap(c.stack.pos("a")) },
    { at: 300 + A, run: (c) => c.stack.stage("a", "recording", { word: "Recording" }) },
    { at: 3000, run: (c) => c.finger.tap(c.stack.pos("a")) },
    { at: 3000 + A, run: (c) => c.stack.stage("a", "transcribing", { word: SPEECH }) },
    // Tap again: the small "record the next part" bubble appears and starts a second recording.
    { at: 3800, run: (c) => c.stack.add("b", { mini: true, words: WORDS }) },
    { at: 4200, run: (c) => c.finger.tap(c.stack.pos("b")) },
    { at: 4200 + A, run: (c) => c.stack.stage("b", "recording", { word: "Recording" }) },
    { at: 5080, run: (c) => c.stack.stage("a", "cleaning", { word: CLEAN, timer: "keep" }) },
    { at: 6500, run: (c) => c.finger.tap(c.stack.pos("b")) },
    { at: 6500 + A, run: (c) => c.stack.stage("b", "transcribing", { word: "Waiting", timer: "hide" }) },
    // The first job finishes first. Its text lands, then the second runs.
    { at: 7200, run: (c) => { c.stack.stage("a", "done"); c.field.append(T1); c.stack.stage("b", "transcribing", { word: SPEECH, timer: "reset" }); } },
    { at: 8800, run: (c) => c.stack.stage("b", "cleaning", { word: CLEAN, timer: "keep" }) },
    { at: 8900, run: (c) => c.stack.remove("a") },
    { at: 10300, run: (c) => { c.stack.stage("b", "done"); c.field.append(T2); } },
    { at: 11900, run: (c) => c.stack.stage("b", "idle") },
    // Hold backspace until the field is empty.
    { at: 12000, run: (c) => c.finger.hold(c.kbd.pos("bksp")) },
    { at: 12000 + A, run: (c) => c.kbd.press("bksp") },
    { at: 12000 + A, dur: 1800, run: (c, p) => c.field.set(p >= 1 ? "" : afterBackspace(FULL, p * 1800)) },
    { at: 12000 + A + 1800, run: (c) => { c.kbd.release("bksp"); c.finger.release(); } },
  ],
};

export default scene;
