/**
 * Manifest loader (Connect.md §2, §6, §8, §10.6).
 *
 * The MCP server's read path. Loads `manifest/components.json` and
 * `manifest/latest-hashes.json` and caches them, re-reading only when the file's
 * mtime changes — so repeated agent queries during a design-to-code session don't
 * re-parse (or, in the deployed HTTP case, re-fetch) on every call and can't hit
 * rate limits (§10.6). Local edits (a fresh `pnpm scan`) are still picked up
 * because the mtime moves.
 *
 * Manifest location resolves from `CODE_CONNECT_MANIFEST_DIR` if set (deployment /
 * tests), else the repo-root `manifest/` directory.
 */

import { readFileSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  entryId,
  type ComponentManifest,
  type ComponentManifestEntry,
  type LatestHashes,
  type PropDefinition,
} from "../schema.js";

function defaultManifestDir(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  // src/mcp/ → repo root is four levels up (tooling/code-connect/src/mcp).
  return resolve(here, "../../../..", "manifest");
}

interface CachedFile<T> {
  mtimeMs: number;
  value: T;
}

export class ManifestLoader {
  private readonly componentsPath: string;
  private readonly hashesPath: string;
  private manifestCache: CachedFile<ComponentManifest> | null = null;
  private hashesCache: CachedFile<LatestHashes> | null = null;
  /** codePath → entry index, rebuilt whenever the manifest is (re)read. */
  private keyIndex = new Map<string, ComponentManifestEntry>();

  constructor(manifestDir: string = process.env.CODE_CONNECT_MANIFEST_DIR ?? defaultManifestDir()) {
    this.componentsPath = resolve(manifestDir, "components.json");
    this.hashesPath = resolve(manifestDir, "latest-hashes.json");
  }

  private freshMtime(path: string): number {
    try {
      return statSync(path).mtimeMs;
    } catch {
      return -1; // missing file
    }
  }

  getManifest(): ComponentManifest {
    const mtime = this.freshMtime(this.componentsPath);
    if (!this.manifestCache || this.manifestCache.mtimeMs !== mtime) {
      const value =
        mtime === -1
          ? { manifestVersion: 0, generatedAt: "", components: [] }
          : (JSON.parse(readFileSync(this.componentsPath, "utf8")) as ComponentManifest);
      this.manifestCache = { mtimeMs: mtime, value };
      this.keyIndex = new Map();
      for (const e of value.components) {
        if (e.figmaComponentKey) this.keyIndex.set(e.figmaComponentKey, e);
      }
    }
    return this.manifestCache.value;
  }

  getLatestHashes(): LatestHashes {
    const mtime = this.freshMtime(this.hashesPath);
    if (!this.hashesCache || this.hashesCache.mtimeMs !== mtime) {
      const value =
        mtime === -1
          ? { generatedAt: "", hashes: {} }
          : (JSON.parse(readFileSync(this.hashesPath, "utf8")) as LatestHashes);
      this.hashesCache = { mtimeMs: mtime, value };
    }
    return this.hashesCache.value;
  }

  /** All entries. */
  all(): ComponentManifestEntry[] {
    return this.getManifest().components;
  }

  /** Direct lookup by Figma component key. Only maps non-empty keys. */
  byKey(figmaComponentKey: string): ComponentManifestEntry | undefined {
    this.getManifest(); // ensure index current
    return figmaComponentKey ? this.keyIndex.get(figmaComponentKey) : undefined;
  }

  /** The current (scanner-published) hash for a manifest entry, if known. */
  latestHashFor(entry: Pick<ComponentManifestEntry, "codePath" | "codeName">): string | undefined {
    return this.getLatestHashes().hashes[entryId(entry.codePath, entry.codeName)];
  }

  /** The current (scanner-published) prop set for a manifest entry, if known. */
  latestPropsFor(
    entry: Pick<ComponentManifestEntry, "codePath" | "codeName">,
  ): PropDefinition[] | undefined {
    return this.getLatestHashes().props?.[entryId(entry.codePath, entry.codeName)];
  }
}
