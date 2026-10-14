/** The same highlight as <CardHighlight>, as an HTML string, for text that goes through set:html. */
export const hl = (text: string, tone: "pale" | "yellow" | "cobalt" | "tomato" = "pale") =>
  `<span class="card-hl card-hl--${tone}">${text}</span>`;
