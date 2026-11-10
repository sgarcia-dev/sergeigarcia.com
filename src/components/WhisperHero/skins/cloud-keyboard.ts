import type { KeyDef, KeyboardSkin } from "../engine/types";

const letters = (s: string): KeyDef[] => [...s].map((c) => ({ id: c, label: c }));

/** A Gboard-like dark keyboard: one tool strip, three letter rows, round light-blue enter key. No logo, no name. */
export const keyboardGboardLike: KeyboardSkin = {
  id: "gb",
  suggestions: [],
  toolbar: ["grid", "emoji", "gif", "clip", "gear", "mic"],
  rows: [
    letters("qwertyuiop"),
    [{ id: "pad1", kind: "pad", flex: 0.5 }, ...letters("asdfghjkl"), { id: "pad2", kind: "pad", flex: 0.5 }],
    [{ id: "shift", icon: "shift", flex: 1.5, kind: "fn" }, ...letters("zxcvbnm"), { id: "bksp", icon: "backspace", flex: 1.5, kind: "fn" }],
    [
      { id: "sym", label: "?123", flex: 1.5, kind: "fn" },
      { id: "comma", label: ",", kind: "fn" },
      { id: "emoji", icon: "emoji", kind: "fn" },
      { id: "space", label: "", flex: 4.4, kind: "space" },
      { id: "dot", label: ".", kind: "fn" },
      { id: "enter", icon: "enter", flex: 1.5, kind: "accent" },
    ],
  ],
};
