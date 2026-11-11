import type { Scene } from "../engine/types";
import { FINGER_ARRIVE } from "../engine/finger";
import { chatGmLike } from "../skins/cloud-chat";
import { keyboardGboardLike } from "../skins/cloud-keyboard";

/**
 * Scene 3, "Cloud". Names as the app catalog shows them (ModelPresets: "Whisper Large V3" is listed under Groq
 * and OpenRouter, "Claude Haiku 5.5" under OpenRouter, so OpenRouter is the one provider for both steps).
 * The app pill shows the model name and a cloud icon, never the provider, so the provider is in the caption only.
 */
const SPEECH = "Whisper Large V3";
const CLEAN = "Claude Haiku 5.5";
const WORDS = ["Recording", SPEECH, CLEAN, "Done"];

const TEXT = "Ten works for me. Send me the address and I'll be there.";

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
  id: "cloud",
  title: "Your cloud account",
  blurb: "Use OpenRouter for speech and Polish with your own API key.",
  aria:
    "Animated demo of the floating bubble using cloud models through OpenRouter to dictate a chat reply.",
  implemented: true,
  phone: { w: 316, h: 612, radius: 46, bezel: 8, camera: "notch" },
  chat: {
    ...chatGmLike,
    contact: "Dana",
    status: "",
    dateChip: "Today · 12:06",
    messages: [
      { from: "them", text: "Are we still on for Saturday?" },
      { from: "them", text: "What time works for you?" },
    ],
  },
  keyboard: keyboardGboardLike,
  duration: 13600,
  still: 3000,
  steps: [
    { at: 0, run: (c) => c.stack.add("a", { words: WORDS }) },
    { at: 400, run: (c) => c.finger.tap(c.stack.pos("a")) },
    { at: 400 + A, run: (c) => c.stack.stage("a", "recording", { word: "Recording" }) },
    { at: 4400, run: (c) => c.finger.tap(c.stack.pos("a")) },
    { at: 4400 + A, run: (c) => c.stack.stage("a", "transcribing", { word: SPEECH }) },
    { at: 6600, run: (c) => c.stack.stage("a", "cleaning", { word: CLEAN, timer: "keep" }) },
    { at: 8200, run: (c) => { c.stack.stage("a", "done"); c.field.append(TEXT); } },
    { at: 9800, run: (c) => c.stack.stage("a", "idle") },
    { at: 10000, run: (c) => c.finger.hold(c.kbd.pos("bksp")) },
    { at: 10000 + A, run: (c) => c.kbd.press("bksp") },
    { at: 10000 + A, dur: 1800, run: (c, p) => c.field.set(p >= 1 ? "" : afterBackspace(TEXT, p * 1800)) },
    { at: 10000 + A + 1800, run: (c) => { c.kbd.release("bksp"); c.finger.release(); } },
  ],
};

export default scene;
