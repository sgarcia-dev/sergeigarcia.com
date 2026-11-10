import type { IconName } from "./types";

/** Simple generic line icons on a 24 grid. Drawn here, not copied from any app. */
const P: Record<IconName, string> = {
  back: '<path d="M15 5l-7 7 7 7M8.5 12H20"/>',
  video: '<rect x="3" y="7" width="12" height="10" rx="2.5"/><path d="M15 11l6-3.5v9L15 13z"/>',
  phone: '<path d="M6.5 4.5l3 .5 1 4-2 1.5a11 11 0 005 5l1.5-2 4 1 .5 3a2 2 0 01-2 2A15 15 0 014.500 6.500a2 2 0 012-2z"/>',
  more: '<circle cx="12" cy="5.500" r="1.400"/><circle cx="12" cy="12" r="1.400"/><circle cx="12" cy="18.500" r="1.400"/>',
  emoji: '<circle cx="12" cy="12" r="8.500"/><path d="M8.500 14a4 4 0 007 0"/><circle cx="9" cy="9.800" r=".6"/><circle cx="15" cy="9.800" r=".6"/>',
  attach: '<path d="M16.500 8.500l-6.500 6.500a1.800 1.800 0 002.600 2.600l7-7a4 4 0 00-5.700-5.700L6.800 12.500a6 6 0 008.500 8.500"/>',
  camera: '<path d="M4 8.500h3l1.500-2.500h7L17 8.500h3v10H4z"/><circle cx="12" cy="13.500" r="3.200"/>',
  mic: '<rect x="9" y="3.500" width="6" height="11" rx="3"/><path d="M5.500 11.500a6.500 6.500 0 0013 0M12 18v3"/>',
  send: '<path d="M4 4l17 8-17 8 2.500-8z"/><path d="M6.500 12H13"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="10.500" cy="10.500" r="6"/><path d="M15 15l5 5"/>',
  gif: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M10 10.500H8.500v3H10M13 10v4M15.500 14v-4h2"/>',
  clip: '<rect x="6" y="4.500" width="12" height="16" rx="2"/><path d="M9.500 4.500v-1h5v1M9 10h6M9 13.500h6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.500M12 18.500V21M3 12h2.500M18.500 12H21M5.600 5.600l1.800 1.800M16.600 16.600l1.800 1.800M5.600 18.400l1.800-1.800M16.600 7.400l1.800-1.800"/>',
  grid: '<rect x="4" y="4" width="6.500" height="6.500" rx="1.500"/><rect x="13.500" y="4" width="6.500" height="6.500" rx="1.500"/><rect x="4" y="13.500" width="6.500" height="6.500" rx="1.500"/><rect x="13.500" y="13.500" width="6.500" height="6.500" rx="1.500"/>',
  shift: '<path d="M12 4l8 9h-5v6H9v-6H4z"/>',
  backspace: '<path d="M8.500 5.500h11a1.500 1.500 0 011.500 1.500v10a1.500 1.500 0 01-1.500 1.500h-11L3 12z"/><path d="M12 9.500l5 5M17 9.500l-5 5"/>',
  enter: '<path d="M19 6v6a2 2 0 01-2 2H6M10 9.500L5.500 14 10 18.500"/>',
  globe: '<circle cx="12" cy="12" r="8.500"/><path d="M3.500 12h17M12 3.500c3 3.500 3 13.500 0 17M12 3.500c-3 3.500-3 13.500 0 17"/>',
};

/** An inline svg for [name]. Stroke uses currentColor. */
export function icon(name: IconName, size = 20): string {
  return `<svg class="wh-i" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name]}</svg>`;
}
