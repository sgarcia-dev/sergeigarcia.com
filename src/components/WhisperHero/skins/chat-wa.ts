import type { ChatSkin } from "../engine/types";

/**
 * A WhatsApp-like chat: dark teal header, doodle-free dark wallpaper, green outgoing bubbles, round green
 * action button. Colors are in hero.css (`.wh-chat[data-skin="wa"]`). No logo, no app name, no real icons.
 */
export const chatWaLike: Omit<ChatSkin, "contact" | "status" | "messages" | "dateChip"> = {
  id: "wa",
  placeholder: "Message",
  headerIcons: ["video", "phone", "more"],
  lead: ["emoji"],
  trail: ["attach", "camera"],
  action: { idle: "mic", send: "send", round: true },
};
