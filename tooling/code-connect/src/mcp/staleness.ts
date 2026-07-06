/**
 * Staleness (Connect.md §4.4, §6.2, §8).
 *
 * Two paths, matching the spec's fast-vs-thorough split:
 *  - {@link computeStaleness}: the cheap read-path check used by
 *    `get_component_context`. Compares the entry's stored `propSignatureHash`
 *    against the scanner-published `latest-hashes.json` — no re-scan, so repeated
 *    agent queries stay fast (§8).
 *  - {@link liveValidate}: the thorough check used by `validate_mapping`. Re-scans
 *    the real code to compute a prop-level diff. Allowed to be slower — it's a
 *    pre-flight tool, not called mid-generation (§5, §6.2).
 */

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { ComponentManifestEntry, PropDiff, Staleness } from "../schema.js";
import { scanReact } from "../scanner/scan-react.js";
import { diffProps } from "../prop-diff.js";
import { computeStalenessCore } from "../staleness-core.js";
import type { ManifestLoader } from "./manifest-loader.js";

function defaultRepoRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, "../../../.."); // src/mcp → repo root
}

const REPO_ROOT = process.env.CODE_CONNECT_REPO_ROOT ?? defaultRepoRoot();

/**
 * Cheap: hash compare against the published latest scan. When stale AND the scan
 * artifact carries the current props, the prop-level `changedProps` is filled in
 * here too — no re-scan needed (Connect.md §8), so `get_component_context` can name
 * what drifted without paying for a live scan.
 */
export function computeStaleness(entry: ComponentManifestEntry, loader: ManifestLoader): Staleness {
  // Resolve the scanner-published hash/props from the fs-backed loader, then hand
  // off to the shared, browser-safe core so the inspector panel and the plugin
  // compute staleness identically (INSPECTOR.md §6).
  return computeStalenessCore(entry, loader.latestHashFor(entry), loader.latestPropsFor(entry));
}

export interface LiveValidation {
  currentHash: string;
  storedHash: string;
  isValid: boolean;
  diff: PropDiff[];
  /** Set when the source couldn't be re-scanned (e.g. code not present). */
  warning?: string;
}

/**
 * Thorough: re-scan the real code for this entry and diff it against the stored
 * props. Falls back to the published latest hash if the source can't be scanned
 * (e.g. a deployment without the repo checked out) — still honest, just no diff.
 */
export function liveValidate(entry: ComponentManifestEntry, loader: ManifestLoader): LiveValidation {
  const storedHash = entry.propSignatureHash;
  try {
    const scanned = scanReact(REPO_ROOT);
    const match = scanned.find(
      (s) => s.codePath === entry.codePath && s.codeName === entry.codeName,
    );
    if (!match) {
      return {
        currentHash: "",
        storedHash,
        isValid: false,
        diff: entry.props.map((p) => ({ name: p.name, change: "removed", before: p.type })),
        warning: `Component source no longer found at ${entry.codePath}; it may have been removed.`,
      };
    }
    return {
      currentHash: match.propSignatureHash,
      storedHash,
      isValid: match.propSignatureHash === storedHash,
      diff: diffProps(entry.props, match.props),
    };
  } catch {
    const latest = loader.latestHashFor(entry) ?? "";
    return {
      currentHash: latest,
      storedHash,
      isValid: latest !== "" && latest === storedHash,
      diff: [],
      warning: "Source unavailable for live re-scan; compared against published latest hash only.",
    };
  }
}
