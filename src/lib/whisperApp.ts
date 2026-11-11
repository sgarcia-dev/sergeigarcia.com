/**
 * Whisper Suite: the app name and contact email for /whisper-suite/ (home, privacy,
 * terms). They live here and only here. Every page and every sentence of the policy and terms reads
 * them from this file. Do not type the name or the address into a page.
 */
export const WHISPER = {
  name: "Whisper Suite",
  contactEmail: "feedback@androidwhisper.com",
  inviteEmail: "apps@sergeigarcia.com",
  base: "/whisper-suite/",
  effective: "10 November 2026",
} as const;

/** Opens the visitor's mail app with a ready invite request. */
export const inviteHref = `mailto:${WHISPER.inviteEmail}?subject=${encodeURIComponent(`Access to ${WHISPER.name}`)}&body=${encodeURIComponent(`Hey, I would like access to ${WHISPER.name}.`)}`;
