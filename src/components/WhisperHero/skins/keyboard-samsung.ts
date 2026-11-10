import type { KeyDef, KeyboardSkin } from "../engine/types";

const letters = (s: string): KeyDef[] => [...s].map((c) => ({ id: c, label: c }));

/** A Samsung-like dark keyboard: tool strip, number row, letters, rounded keys, accent enter key. No logo, no name. */
export const keyboardSamsungLike: KeyboardSkin = {
  id: "sam",
  suggestions: [],
  toolbar: ["grid", "emoji", "gif", "clip", "gear", "mic"],
  rows: [
    letters("1234567890"),
    letters("qwertyuiop"),
    [{ id: "pad1", kind: "pad", flex: 0.5 }, ...letters("asdfghjkl"), { id: "pad2", kind: "pad", flex: 0.5 }],
    [{ id: "shift", icon: "shift", flex: 1.5, kind: "fn" }, ...letters("zxcvbnm"), { id: "bksp", icon: "backspace", flex: 1.5, kind: "fn" }],
    [
      { id: "sym", label: "!#1", flex: 1.3, kind: "fn" },
      { id: "comma", label: ",", kind: "fn" },
      { id: "lang", icon: "globe", kind: "fn" },
      { id: "space", label: "", flex: 4.2, kind: "space" },
      { id: "dot", label: ".", kind: "fn" },
      { id: "enter", icon: "enter", flex: 1.4, kind: "accent" },
    ],
  ],
};
