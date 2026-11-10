import type { Scene } from "../engine/types";
import { chatWaLike } from "../skins/chat-wa";
import { keyboardSamsungLike } from "../skins/keyboard-samsung";

/**
 * Scene 2, "Live streaming". PLACEHOLDER: `implemented` is false, so the loop skips it.
 * Planned: Telegram-like blue chat skin, Gboard-like keyboard skin, a rounder phone, Nemotron 3.5 Live,
 * no clean-up step, words appear live in the field (use `c.field.live`, then `c.field.append`).
 * Replace this file's contents, set `implemented: true`, and list real steps.
 */
const scene: Scene = {
  id: "live-streaming",
  title: "Live streaming",
  blurb: "Words appear as you speak.",
  aria: "Scene two, live streaming: words appear in the text field while the person is still speaking.",
  implemented: false,
  phone: { w: 296, h: 620, radius: 52, bezel: 8, camera: "punch", statusH: 28 },
  chat: { ...chatWaLike, contact: "", status: "", messages: [] },
  keyboard: keyboardSamsungLike,
  duration: 13000,
  still: 3000,
  steps: [],
};

export default scene;
