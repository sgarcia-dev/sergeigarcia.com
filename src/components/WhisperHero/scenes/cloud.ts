import type { Scene } from "../engine/types";
import { chatWaLike } from "../skins/chat-wa";
import { keyboardSamsungLike } from "../skins/keyboard-samsung";

/**
 * Scene 3, "Cloud". PLACEHOLDER: `implemented` is false, so the loop skips it.
 * Planned: Google-Messages-like chat skin, Gboard-like keyboard skin, a third phone shape,
 * Whisper Large V3 through a real provider, then Claude Haiku 5.5 clean-up (cloud icon in the pill).
 * Replace this file's contents, set `implemented: true`, and list real steps.
 */
const scene: Scene = {
  id: "cloud",
  title: "Cloud",
  blurb: "Use the cloud model you choose.",
  aria: "Scene three, cloud: the dictation is sent to a cloud speech model and a cloud clean-up model, then the text appears.",
  implemented: false,
  phone: { w: 306, h: 628, radius: 40, bezel: 8, camera: "notch", statusH: 28 },
  chat: { ...chatWaLike, contact: "", status: "", messages: [] },
  keyboard: keyboardSamsungLike,
  duration: 13000,
  still: 3000,
  steps: [],
};

export default scene;
