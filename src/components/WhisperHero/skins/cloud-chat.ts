import type { ChatSkin } from "../engine/types";

/**
 * A Google-Messages-like chat: flat dark header with no color, rounded blue and grey bubbles, a plain date line,
 * a plus button, a pill field and a round light-blue action button. Colors are in hero.css
 * (`.wh-chat[data-skin="gm"]`). No logo, no app name, no real icons.
 */
export const chatGmLike: Omit<ChatSkin, "contact" | "status" | "messages" | "dateChip"> = {
  id: "gm",
  placeholder: "Text message",
  headerIcons: ["phone", "more"],
  lead: [],
  trail: ["emoji"],
  action: { idle: "mic", send: "send", round: true },
};
