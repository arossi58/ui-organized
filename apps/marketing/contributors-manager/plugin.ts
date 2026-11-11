import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { isAllowed, readJson, send } from "../copy-editor/plugin.ts";
import type { Contributor } from "../src/lib/contributors.ts";

const DATA_FILE = fileURLToPath(new URL("../src/content/contributors.json", import.meta.url));
const AVATAR_DIR = fileURLToPath(new URL("../public/contributors", import.meta.url));
/** Avatars are served from public/, so the stored path is relative to it. */
const AVATAR_PREFIX = "contributors/";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATA_URL = /^data:image\/(webp|png|jpeg);base64,([A-Za-z0-9+/=]+)$/;
const EXT: Record<string, string> = { webp: "webp", png: "png", jpeg: "jpg" };

const read = (): Contributor[] => JSON.parse(readFileSync(DATA_FILE, "utf8")) as Contributor[];

/** Check the list the manager sends back; returns an error message or null. */
function invalid(list: unknown): string | null {
  if (!Array.isArray(list)) return "Expected a list of contributors.";
  const ids = new Set<string>();
  for (const entry of list as Partial<Contributor>[]) {
    const label = entry?.name || entry?.id || "A contributor";
    if (typeof entry?.id !== "string" || !SLUG.test(entry.id)) return `${label} has an invalid id.`;
    if (ids.has(entry.id)) return `Two contributors share the id "${entry.id}".`;
    ids.add(entry.id);
    if (typeof entry.name !== "string" || !entry.name.trim()) return `${entry.id} needs a name.`;
    if (typeof entry.url !== "string" || !/^https?:\/\/\S+$/.test(entry.url)) {
      return `${label} needs a website starting with http:// or https://.`;
    }
    if (entry.avatar !== null) {
      const file = typeof entry.avatar === "string" ? entry.avatar.slice(AVATAR_PREFIX.length) : "";
      if (!entry.avatar?.startsWith(AVATAR_PREFIX) || !existsSync(join(AVATAR_DIR, file)) || file.includes("/")) {
        return `${label}'s photo is missing; upload it again.`;
      }
    }
  }
  return null;
}

/** Delete photos no contributor points at any more (replaced or removed). */
function pruneAvatars(list: Contributor[]) {
  const used = new Set(list.map((c) => c.avatar?.slice(AVATAR_PREFIX.length)));
  for (const file of readdirSync(AVATAR_DIR)) {
    if (!file.startsWith(".") && !used.has(file)) unlinkSync(join(AVATAR_DIR, file));
  }
}

/**
 * Dev-only backend for the contributors manager page (/contributors/manage).
 * `apply: "serve"` keeps it out of every build; the page is DEV-gated too.
 * Writes src/content/contributors.json and photos under public/contributors/,
 * which are committed like any other source change.
 */
export function contributorsManager(): Plugin {
  return {
    name: "contributors-manager",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__contributors", async (req, res) => {
        if (!isAllowed(req)) return send(res, 403, { error: "Local requests only." });
        try {
          const route = `${req.method} ${req.url?.split("?")[0]}`;
          if (route === "GET /list") return send(res, 200, { contributors: read() });
          if (req.method !== "POST") return send(res, 404, { error: "Not found" });
          const body = await readJson(req);

          if (route === "POST /avatar") {
            const { id, dataUrl } = body as { id?: string; dataUrl?: string };
            const match = typeof dataUrl === "string" ? DATA_URL.exec(dataUrl) : null;
            if (typeof id !== "string" || !SLUG.test(id)) return send(res, 400, { error: "Invalid id." });
            if (!match) return send(res, 400, { error: "Expected a WebP, PNG or JPEG image." });
            const bytes = Buffer.from(match[2], "base64");
            // Content-hashed so a replaced photo never serves stale from a cache.
            const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 8);
            const file = `${id}-${hash}.${EXT[match[1]]}`;
            mkdirSync(AVATAR_DIR, { recursive: true });
            writeFileSync(join(AVATAR_DIR, file), bytes);
            return send(res, 200, { avatar: `${AVATAR_PREFIX}${file}` });
          }

          if (route === "POST /save") {
            const error = invalid(body.contributors);
            if (error) return send(res, 400, { error });
            const list = (body.contributors as Contributor[]).map(({ id, name, url, avatar }) => ({
              id,
              name: name.trim(),
              url: url.trim(),
              avatar,
            }));
            writeFileSync(DATA_FILE, `${JSON.stringify(list, null, 2)}\n`);
            pruneAvatars(list);
            return send(res, 200, { contributors: list });
          }
          return send(res, 404, { error: "Not found" });
        } catch (error) {
          return send(res, 500, { error: (error as Error).message });
        }
      });
    },
  };
}
