/**
 * Types of the hero engine and the scene API. A scene is plain data plus a list of timeline
 * steps. See ../README.md for a walkthrough.
 */

/** A point in phone pixels (design units, 1 unit = 1 css px at scale 1). */
export interface Pt {
  x: number;
  y: number;
}

/** A point, or a function that gives the point now (so a finger can follow a moving bubble). */
export type Target = Pt | (() => Pt);

/** Bubble faces, one per stage of the app. */
export type Stage = "idle" | "recording" | "transcribing" | "cleaning" | "done";

export type IconName =
  | "back" | "video" | "phone" | "more" | "emoji" | "attach" | "camera" | "mic" | "send" | "plus"
  | "search" | "gif" | "clip" | "gear" | "grid" | "shift" | "backspace" | "enter" | "globe";

/** The silhouette of the phone. Design units: the stage is 340 x 700 and the phone is centred in it. */
export interface PhoneShape {
  w: number;
  h: number;
  /** Outer corner radius. Small = squarish flagship, large = round. */
  radius: number;
  /** Bezel thickness. */
  bezel: number;
  /** Front camera: a punch hole at the top centre or left, a small notch, or none. */
  camera: "punch" | "punch-left" | "notch" | "none";
  /** Height of the status bar. */
  statusH: number;
}

export interface Msg {
  from: "them" | "me";
  text: string;
  time?: string;
}

/**
 * The chat look. The colors live in CSS: add a `.wh-chat[data-skin="<id>"]` block in hero.css
 * that sets the variables listed in the README. Here you only pick text and icons.
 */
export interface ChatSkin {
  id: string;
  contact: string;
  status: string;
  messages: Msg[];
  /** Small chip above the messages, for example "Today". */
  dateChip?: string;
  placeholder: string;
  headerIcons: IconName[];
  /** Icons left of the text field. */
  lead: IconName[];
  /** Icons inside the right end of the field. */
  trail: IconName[];
  /** The round (or plain) action button: idle icon, and the icon once there is text. */
  action: { idle: IconName; send: IconName; round: boolean };
}

export interface KeyDef {
  /** Stable id for finger targets and `kbd.press`, for example "bksp". */
  id: string;
  label?: string;
  icon?: IconName;
  /** Relative width, default 1. */
  flex?: number;
  kind?: "fn" | "space" | "accent" | "pad";
}

/** The keyboard look. Colors live in CSS as `.wh-kb[data-skin="<id>"]`. */
export interface KeyboardSkin {
  id: string;
  /** Suggestion words in the top strip (may be empty when the skin shows only a toolbar). */
  suggestions: string[];
  toolbar: IconName[];
  rows: KeyDef[][];
}

/** Context a step gets. All calls are idempotent state setters, so the engine can replay them. */
export interface Ctx {
  /** Scene time of this step in ms. */
  readonly now: number;
  finger: {
    /** Glide in from near the target, press, lift, fade out. The press happens FINGER_ARRIVE ms after the call. */
    tap(target: Target): void;
    /** Like tap but keeps pressing until `release`. */
    hold(target: Target): void;
    release(): void;
  };
  stack: {
    /** Add a bubble on top of the stack. `mini` is the small "record the next part" bubble. */
    add(id: string, opts?: { mini?: boolean; words?: string[] }): void;
    /** Switch face. `word` is the pill text, `timer` picks the pill clock. */
    stage(id: string, stage: Stage, opts?: StageOpts): void;
    /** Shrink the bubble away; the ones above it slide down. */
    remove(id: string): void;
    /** Where the bubble centre is now, in phone pixels. */
    pos(id: string): Target;
  };
  field: {
    set(text: string): void;
    /** Add text at the end (animated in). */
    append(text: string): void;
    /** Show text as live, not yet final (dimmer), for streaming scenes. */
    live(text: string): void;
  };
  kbd: {
    press(keyId: string): void;
    release(keyId: string): void;
    /** Where a key is, in phone pixels. */
    pos(keyId: string): Target;
  };
  chat: {
    add(msg: Msg): void;
  };
}

export interface StageOpts {
  /** Pill text. Defaults to the stage word. */
  word?: string;
  /** "reset" starts the pill clock at 0:00 now, "keep" continues, "hide" shows no clock. Default "reset". */
  timer?: "reset" | "keep" | "hide";
  /** Audio level 0..1 over time (seconds since the stage began) for the recording face. */
  level?: (t: number) => number;
}

/** One timeline step. With `dur`, `run` is called every frame with p from 0 to 1, and once more with 1. */
export interface Step {
  at: number;
  dur?: number;
  run: (c: Ctx, p: number) => void;
}

export interface Scene {
  id: string;
  /** Short title under the phone, for example "On device". */
  title: string;
  /** One calm sentence under the title. */
  blurb: string;
  /** Plain description for screen readers. */
  aria: string;
  /** False for a placeholder: the loop skips it. */
  implemented: boolean;
  phone: PhoneShape;
  chat: ChatSkin;
  keyboard: KeyboardSkin;
  /** Length of one run in ms. */
  duration: number;
  /** Scene time of the still frame that reduced motion shows. */
  still: number;
  steps: Step[];
}
