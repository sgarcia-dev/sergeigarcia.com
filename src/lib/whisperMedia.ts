import installed from "./whisperMedia.generated.json";

interface Media { name: string; poster: string }
// Only the ready-list installer writes this manifest. Existing recordings stay available
// until a reviewed MP4, WebM and poster have all arrived for the replacement.
const replacements = installed as Partial<Record<string, Media>>;

export function whisperMedia(id: string): Media {
  const fallback = id === "polish" ? "model-detail" : id;
  return replacements[id] ?? {
    name: fallback,
    poster: `/whisper-for-android/shots/${fallback}.webp`,
  };
}

export const bubbleMedia = replacements.bubble;
