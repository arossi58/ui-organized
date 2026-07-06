/**
 * Loads the shared manifest + latest-scan artifacts into the Storybook MANAGER
 * (INSPECTOR.md §2, §7 preset). The preset serves them as static files (see
 * preset.ts + the app's staticDirs); the manager fetches them once and caches the
 * promise so every story switch reuses the same data. This is the same
 * `manifest/components.json` the MCP server reads — one source of truth (§0.3).
 */

import type { ComponentManifest, LatestHashes } from "@ui-organized/code-connect/browser";

/** Where the manifest artifacts are served (see the app's staticDirs / preset.ts). */
const BASE = "inspector-manifest";

export interface ManifestData {
  manifest: ComponentManifest | null;
  latestScan: LatestHashes | null;
  error?: string;
}

let cached: Promise<ManifestData> | null = null;

async function fetchJson<T>(file: string): Promise<T | null> {
  try {
    const url = new URL(`${BASE}/${file}`, document.baseURI).href;
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function loadManifestData(): Promise<ManifestData> {
  if (!cached) {
    cached = (async () => {
      const manifest = await fetchJson<ComponentManifest>("components.json");
      const latestScan = await fetchJson<LatestHashes>("latest-hashes.json");
      if (!manifest) {
        // Don't cache a failure — a stale dev server that hadn't mounted
        // staticDirs yet should recover on the next render/reload without a full
        // module reset. Only successful loads are memoized.
        cached = null;
        return {
          manifest: null,
          latestScan: null,
          error:
            `Could not load the manifest from "${BASE}/components.json". ` +
            "Restart Storybook (staticDirs are applied only at startup), and run " +
            "`pnpm --filter @ui-organized/code-connect scan` if manifest/components.json is missing.",
        };
      }
      return { manifest, latestScan };
    })();
  }
  return cached;
}
