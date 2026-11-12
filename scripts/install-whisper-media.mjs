// Usage: node scripts/install-whisper-media.mjs /path/to/ready.txt [--activate]
// Copy only ready-listed files. After visual review, --activate selects complete sets.
import { readFile, writeFile, mkdir, copyFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const readyPath = process.argv[2];
if (!readyPath) throw new Error("Pass the marketing ready.txt path.");
const ids = ["bubble", "home", "models", "polish", "keys", "transcript", "usage"];
const publicDir = path.join(root, "public/whisper-for-android/video/r7");
const manifestPath = path.join(root, "src/lib/whisperMedia.generated.json");
let ready;
try { ready = await readFile(readyPath, "utf8"); }
catch (error) {
  if (error.code !== "ENOENT") throw error;
  console.log("No ready list yet. Keeping existing media.");
  process.exit(0);
}
await mkdir(publicDir, { recursive: true });
const listed = new Set();
for (const line of ready.split(/\r?\n/)) {
  const match = line.trim().replace(/^[-|]\s*/, "").match(/^[`"]?([^,\t| `"]+\.(?:mp4|webm|webp))/);
  if (!match) continue;
  const file = match[1];
  const basename = path.basename(file);
  const id = ids.find((id) => basename === `${id}.mp4` || basename === `${id}.webm` || basename === `${id}.webp` || basename === `${id}-poster.webp`);
  if (!id) continue;
  const extension = path.extname(file);
  const destination = `${id}${extension}`;
  const candidates = path.isAbsolute(file) ? [file] : [
    path.resolve(path.dirname(readyPath), file),
    path.resolve(path.dirname(readyPath), "media", file),
    path.resolve(path.dirname(readyPath), "media", "posters", file),
  ];
  let source;
  for (const candidate of candidates) {
    try { await access(candidate); source = candidate; break; } catch {}
  }
  if (!source) throw new Error(`Ready-listed file is missing: ${file}`);
  await copyFile(source, path.join(publicDir, destination));
  listed.add(destination);
  console.log(`Installed ${id}${extension}`);
}
if (process.argv.includes("--activate")) {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  for (const id of ids) {
    if (!["mp4", "webm", "webp"].every((extension) => listed.has(`${id}.${extension}`))) continue;
    manifest[id] = { name: `r7/${id}`, poster: `/whisper-for-android/video/r7/${id}.webp` };
    console.log(`Activated reviewed set: ${id}`);
  }
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}
