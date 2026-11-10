# WhisperHero

An animated phone that plays a full dictation loop. Use it as `<Hero />` from `Hero.astro` (no props).
Width follows the container, up to `--wh-max` (default 340px, set it on a parent or on `.wh`).
Dark mode first. No logos, app names or trademarked icons appear on the phone.

## How it runs

`engine/engine.ts` loops over the scenes. The clock only runs while the hero is on screen
(IntersectionObserver) and the tab is visible. With `prefers-reduced-motion` it shows one still frame
(`scene.still`). Scenes with `implemented: false` or no steps are skipped. The phone is drawn in a 340 x 700
design box that scales with CSS only. The page text and dots are outside the `role="img"` stage;
its `aria-label` is built from the `aria` text of every implemented scene.

## Scene API (`engine/types.ts`)

A scene is plain data plus timeline steps. Put it in `scenes/<name>.ts` and list it in `scenes/index.ts`.

```ts
{
  id, title, blurb, aria,        // caption (title + blurb) and screen reader text
  implemented: true,              // false = placeholder, loop skips it
  phone:    { w, h, radius, bezel, camera: "punch"|"punch-left"|"notch"|"none", statusH },
  chat:     { id: "wa", contact, status, dateChip, messages, placeholder, headerIcons, lead, trail, action },
  keyboard: { id: "sam", suggestions, toolbar, rows },   // rows of { id, label|icon, flex, kind }
  duration: 14800,                // ms, one run
  still: 3000,                    // ms, the reduced-motion frame
  steps: [ { at: ms, run(ctx) }, { at, dur, run(ctx, p) } ],
}
```

Phone shapes: scene 1 is `radius: 30` (tall, flat, squarish). Use a bigger radius or a notch for the others.

### Steps

- `{ at, run }` fires once at `at` ms. `{ at, dur, run }` is called every frame with `p` from 0 to 1.
- Steps must be idempotent state setters. The engine replays all steps up to `still` for the still frame.
- Keep `steps` sorted by `at` (the engine sorts them anyway).

### `ctx`

- `finger.tap(target)`: soft touch dot glides in, presses, lifts, fades. The press lands `FINGER_ARRIVE`
  (480 ms, from `engine/finger.ts`) after the call, so schedule the effect at `at + FINGER_ARRIVE`.
  `finger.hold(target)` / `finger.release()` keep pressing.
- `stack.add(id, { mini?, words? })`, `stack.stage(id, stage, { word?, timer?, level? })`, `stack.remove(id)`,
  `stack.pos(id)` (a finger target). Stages: `idle | recording | transcribing | cleaning | done`.
  New bubbles stack upward; removing one slides the others down. `words` lists every pill word the job
  can show, so the pill keeps one width. `timer`: `"reset"` (default), `"keep"`, `"hide"`.
  Calling `stage` with the stage it already has only changes the pill text and clock.
- `field.set(text)`, `field.append(text)` (animated, space joined), `field.live(text)` (dim, for streaming).
- `kbd.press(keyId)`, `kbd.release(keyId)`, `kbd.pos(keyId)`.
- `chat.add({ from, text, time })`.

### Skins

Colors live in `hero.css`: add `.wh-chat[data-skin="<id>"]` (vars `--hd --bg --in --out --tx --sub --fd --act --actx --chip`)
and `.wh-kb[data-skin="<id>"]` (vars `--kb --key --fnk --kt --kd --acc --keydn`). The data side is in `skins/`.
Existing: `chat-wa.ts` + `wa` (WhatsApp-like), `keyboard-samsung.ts` + `sam` (Samsung-like).
Scenes 2 and 3 still need their own skins (Telegram-like, Google-Messages-like, Gboard-like).

### Bubble faces (`engine/face.ts`)

Ported from the app: idle (brand mic), recording (level fill, squiggle ring, stop square), transcribing
(sound bars to wiggle line), cleaning (violet gem, sparkles), done (check, bounce, particles).
Palette: green `#94d4b1`, blue `#8ab4f8`, violet `#d0bcff`, red `#b3261e`.

## Model names (as the app shows them)

Scene 1: speech `Parakeet Ultra`, clean-up `Gemma 4 E2B`. For scene 2 the catalog name is `Nemotron 3.5 Live`.
For scene 3: `Whisper Large V3` and `Claude Haiku 5.5`.
