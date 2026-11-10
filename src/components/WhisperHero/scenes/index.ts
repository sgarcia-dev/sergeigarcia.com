import type { Scene } from "../engine/types";
import onDevice from "./on-device";
import liveStreaming from "./live-streaming";
import cloud from "./cloud";

/** Loop order. The engine skips scenes with `implemented: false` or no steps. */
export const scenes: Scene[] = [onDevice, liveStreaming, cloud];
export { onDevice };
