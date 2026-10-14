/**
 * The list of social images the site needs, as JSON. `npm run og` reads it to know what to draw,
 * and the e2e test (tests/og.spec.ts) reads it to check every image exists and is up to date.
 */
import type { APIRoute } from "astro";
import { getOgTargets, ogImagePath } from "../../lib/ogTargets";

export const GET: APIRoute = async () => {
  const targets = await getOgTargets();
  const body = targets.map((t) => ({ key: t.key, path: t.path, design: t.design, hash: t.hash, image: ogImagePath(t.key) }));
  return new Response(JSON.stringify(body, null, 2), { headers: { "Content-Type": "application/json" } });
};
