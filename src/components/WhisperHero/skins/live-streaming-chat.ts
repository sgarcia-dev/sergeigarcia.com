import type { ChatSkin } from "../engine/types";

/**
 * A Telegram-like chat for scene 2: blue-slate header, deep navy wallpaper, rounded bubbles, a flat input bar with
 * a plain (not round) action icon. Colors are in hero.css (`.wh-chat[data-skin="tg"]`).
 * No logo, no app name, no paper-plane mark: the send icon is the generic one of the engine.
 */
export const chatTelegramLike: Omit<ChatSkin, "contact" | "status" | "messages" | "dateChip"> = {
  id: "tg",
  placeholder: "Message",
  headerIcons: ["phone", "more"],
  lead: ["emoji"],
  trail: ["attach"],
  action: { idle: "mic", send: "send", round: false },
};
