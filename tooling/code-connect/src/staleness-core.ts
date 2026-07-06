/**
 * Staleness core — the pure, browser-safe heart of the staleness check
 * (Connect.md §4.4, §8). No fs, no scanner, no path: given an entry plus the
 * scanner-published latest hash + prop set, it answers "is this mapping stale and
 * what drifted".
 *
 * This exists so the *same* staleness computation runs in three places without
 * forking (INSPECTOR.md §6):
 *   - the MCP server's read path ({@link computeStaleness} in mcp/staleness.ts,
 *     which resolves the hash/props from a fs-backed ManifestLoader then calls
 *     this),
 *   - the Figma plugin,
 *   - the Storybook inspector panel (which fetches the published artifacts over
 *     HTTP then calls this directly).
 *
 * If any consumer computed "is it stale" differently, the AI-facing and
 * human-facing tools would disagree over time — worse than either being merely
 * less accurate, because it destroys trust in both at once. One implementation,
 * enforced by the import graph.
 */

import type { ComponentManifestEntry, PropDefinition, Staleness } from "./schema.js";
import { diffProps } from "./prop-diff.js";

/**
 * Compute staleness from already-resolved inputs. `latestHash`/`latestProps` are
 * whatever the scanner last published for this entry (from `latest-hashes.json`),
 * looked up by the caller — `undefined` when the scan artifact doesn't know this
 * entry (e.g. brand-new component), in which case it is treated as not stale
 * (there is nothing newer to be stale against).
 *
 * When stale AND the latest prop set is available, the prop-level `changedProps`
 * is filled in via the shared {@link diffProps}, so no re-scan is needed to name
 * what drifted.
 */
export function computeStalenessCore(
  entry: Pick<ComponentManifestEntry, "propSignatureHash" | "props" | "lastSyncedAt" | "lastVerifiedBy">,
  latestHash: string | undefined,
  latestProps: PropDefinition[] | undefined,
): Staleness {
  const isStale = latestHash !== undefined && latestHash !== entry.propSignatureHash;

  let changedProps: string[] | undefined;
  if (isStale && latestProps) {
    const names = diffProps(entry.props, latestProps).map((d) => d.name);
    if (names.length) changedProps = names;
  }

  return {
    isStale,
    ...(changedProps ? { changedProps } : {}),
    lastVerified: entry.lastVerifiedBy ?? entry.lastSyncedAt,
  };
}
