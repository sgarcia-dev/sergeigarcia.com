import type { ChatSkin, Ctx, KeyboardSkin, Msg, Pt, Scene, Target } from "./types";
import { el, q } from "./dom";
import { icon } from "./icons";
import { Finger } from "./finger";
import { Stack } from "./stack";

const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string);

function statusBar(): string {
  return `<span class="tm">12:08</span><span class="ic"><svg viewBox="0 0 16 12" width="15" height="11" aria-hidden="true"><path d="M1 11l0-3M5 11V6M9 11V3.500M13 11V1" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg><svg viewBox="0 0 16 12" width="15" height="11" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M1.500 4.500a9 9 0 0113 0M4 7.200a5.600 5.600 0 018 0"/><circle cx="8" cy="10" r="1" fill="currentColor"/></svg><svg viewBox="0 0 22 12" width="20" height="11" aria-hidden="true"><rect x="1" y="1" width="17" height="10" rx="2.500" fill="none" stroke="currentColor" stroke-width="1.300" opacity=".7"/><rect x="2.500" y="2.500" width="11" height="7" rx="1.300" fill="currentColor"/><rect x="19" y="4" width="2" height="4" rx="1" fill="currentColor" opacity=".7"/></svg></span>`;
}

function chatHtml(c: ChatSkin): string {
  const msgs = c.messages
    .map((m) => `<div class="m ${m.from}"><span>${esc(m.text)}</span>${m.time ? `<i>${esc(m.time)}</i>` : ""}</div>`)
    .join("");
  return `<div class="wh-status">${statusBar()}</div><div class="hd"><span class="bk">${icon("back", 20)}</span><span class="av"><svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="currentColor" opacity=".35"/><circle cx="12" cy="9.500" r="4" fill="currentColor" opacity=".7"/><path d="M4.500 20a7.500 7.500 0 0115 0" fill="currentColor" opacity=".7"/></svg></span>
<span class="nm"><b>${esc(c.contact)}</b><small>${esc(c.status)}</small></span><span class="ac">${c.headerIcons.map((i) => icon(i, 19)).join("")}</span></div>
<div class="ls">${c.dateChip ? `<div class="dc">${esc(c.dateChip)}</div>` : ""}${msgs}</div>
<div class="cp"><div class="fd">${c.lead.map((i) => `<span class="ld">${icon(i, 20)}</span>`).join("")}<div class="ti"><span class="tx"></span><i class="cr"></i><span class="ph">${esc(c.placeholder)}</span></div>${c.trail.map((i) => `<span class="tr">${icon(i, 20)}</span>`).join("")}</div>
<span class="ab${c.action.round ? " rd" : ""}"><span class="a0">${icon(c.action.idle, 21)}</span><span class="a1">${icon(c.action.send, 20)}</span></span></div>`;
}

function kbHtml(k: KeyboardSkin): string {
  const tool = `<div class="tb">${k.toolbar.map((i) => `<span>${icon(i, 18)}</span>`).join("")}</div>`;
  const sug = k.suggestions.length ? `<div class="sg">${k.suggestions.map((s) => `<span>${esc(s)}</span>`).join("")}</div>` : "";
  const rows = k.rows
    .map(
      (r) =>
        `<div class="rw">${r
          .map(
            (key) =>
              `<span class="k ${key.kind ?? ""}" data-k="${key.id}" style="flex:${key.flex ?? 1}">${key.kind === "pad" ? "" : key.icon ? icon(key.icon, 19) : esc(key.label ?? key.id)}</span>`,
          )
          .join("")}</div>`,
    )
    .join("");
  return `${sug || tool}${sug ? tool : ""}${rows}<div class="wh-nav"><i></i></div>`;
}

export interface PhoneView {
  el: HTMLElement;
  ctx: Ctx;
  /** Advance visuals. `now` is scene ms, `dt` frame ms. */
  tick(now: number, dt: number, reduced: boolean): void;
  /** Jump all eased values to their targets (used before a still). */
  snap(now: number, reduced: boolean): void;
  setNow(now: number): void;
  /** Call once after the element is in the document, before any step runs. */
  ready(): void;
}

export function buildPhone(scene: Scene): PhoneView {
  const { phone: P, chat, keyboard } = scene;
  const root = el("div", "wh-phone");
  root.style.setProperty("--pw", `${P.w}px`);
  root.style.setProperty("--ph", `${P.h}px`);
  root.style.setProperty("--pr", `${P.radius}px`);
  root.style.setProperty("--pb", `${P.bezel}px`);
  root.style.setProperty("--ps", `${Math.max(P.radius - P.bezel, 6)}px`);
  root.style.setProperty("--st", `${P.statusH}px`);
  root.dataset.cam = P.camera;
  root.dataset.scene = scene.id;
  root.innerHTML = `<span class="sb s1"></span><span class="sb s2"></span><span class="sb s3"></span>
<div class="wh-screen">
<div class="wh-chat" data-skin="${chat.id}">${chatHtml(chat)}</div>
<div class="wh-kb" data-skin="${keyboard.id}">${kbHtml(keyboard)}</div></div>
<i class="wh-cam"></i>`;
  const screen = q(root, ".wh-screen");
  const chatEl = q(root, ".wh-chat");
  const list = q(chatEl, ".ls");
  const cp = q(chatEl, ".cp");
  const tx = q(chatEl, ".tx");
  const ph = q(chatEl, ".ph");
  const kbEl = q(root, ".wh-kb");

  const finger = new Finger();
  // The bubble layer lives over the screen (clipped to it); coordinates are screen pixels.
  const holder = { now: 0 };
  let stack!: Stack;
  let fieldText = "";
  let liveText = "";
  let lastHtml = "";
  let hasText = false;

  const scale = () => root.getBoundingClientRect().width / root.offsetWidth || 1;
  const rel = (e: HTMLElement): Pt => {
    const r = e.getBoundingClientRect();
    const b = root.getBoundingClientRect();
    const s = scale();
    return { x: (r.left - b.left + r.width / 2) / s, y: (r.top - b.top + r.height / 2) / s };
  };

  function renderField(newFrom = -1) {
    const done = fieldText;
    const html =
      (newFrom >= 0 && newFrom < done.length
        ? `${esc(done.slice(0, newFrom))}<span class="nw">${esc(done.slice(newFrom))}</span>`
        : esc(done)) + (liveText ? `<span class="lv">${esc((done && !/\s$/.test(done) ? " " : "") + liveText)}</span>` : "");
    if (html !== lastHtml) {
      lastHtml = html;
      tx.innerHTML = html;
    }
    const has = !!(done || liveText);
    if (has !== hasText) {
      hasText = has;
      ph.style.display = has ? "none" : "";
      cp.classList.toggle("has", has);
    }
  }

  const ctx: Ctx = {
    get now() { return holder.now; },
    finger: {
      tap: (t) => finger.tap(t, holder.now),
      hold: (t) => finger.hold(t, holder.now),
      release: () => finger.release(holder.now),
    },
    stack: {
      add: (id, o) => stack.add(id, holder.now, o),
      stage: (id, s, o) => stack.stage(id, s, holder.now, o),
      remove: (id) => stack.remove(id),
      pos: (id) => stack.pos(id),
    },
    field: {
      set: (t) => { fieldText = t; liveText = ""; renderField(); },
      append: (t) => {
        const from = fieldText.length ? fieldText.length + 1 : 0;
        fieldText = fieldText ? `${fieldText} ${t}` : t;
        liveText = "";
        renderField(from);
      },
      live: (t) => { liveText = t; renderField(); },
    },
    kbd: {
      press: (id) => kbEl.querySelector(`[data-k="${id}"]`)?.classList.add("dn"),
      release: (id) => kbEl.querySelector(`[data-k="${id}"]`)?.classList.remove("dn"),
      pos: (id): Target => () => {
        const k = kbEl.querySelector(`[data-k="${id}"]`) as HTMLElement | null;
        return k ? rel(k) : { x: 0, y: 0 };
      },
    },
    chat: {
      add: (m: Msg) => {
        list.appendChild(el("div", `m ${m.from}`, `<span>${esc(m.text)}</span>${m.time ? `<i>${esc(m.time)}</i>` : ""}`));
      },
    },
  };

  // Layout is known once the phone is in the document; the anchor is computed lazily on mount.
  const init = () => {
    const sr = screen.getBoundingClientRect();
    const s = scale();
    const cpTop = (cp.getBoundingClientRect().top - sr.top) / s;
    const w = screen.offsetWidth;
    stack = new Stack(w - 6 - 23, cpTop - 52, { x: P.bezel, y: P.bezel });
    screen.appendChild(stack.layer);
    root.appendChild(finger.el);
  };

  return {
    el: root,
    ctx,
    setNow(n) { holder.now = n; },
    ready: init,
    tick(now, dt, reduced) {
      stack.tick(now, dt, reduced, false);
      finger.tick(now);
    },
    snap(now, reduced) {
      stack.tick(now, 1e6, reduced, true);
      finger.tick(now);
    },
  };
}
