/**
 * Plugin-side staleness (Connect.md §4.4). The plugin can't re-scan code, so it
 * compares the mapping's stored `propSignatureHash` against the scanner-published
 * latest scan (`latest-hashes.json`, fetched from GitHub) — a cheap hash compare
 * (§8) — and, when it differs, diffs the stored props against the scan's current
 * props to show exactly what changed. Uses the same `diffProps` the MCP server uses.
 */

import {
  diffProps,
  entryId,
  type ComponentManifestEntry,
  type LatestHashes,
  type PropDiff,
} from "@ui-organized/code-connect/browser";

export interface PluginStaleness {
  /** false when we have no scan data to compare against (unknown, not "fresh"). */
  known: boolean;
  isStale: boolean;
  diff: PropDiff[];
}

export function pluginStaleness(
  entry: ComponentManifestEntry,
  scan: LatestHashes | null,
): PluginStaleness {
  if (!scan) return { known: false, isStale: false, diff: [] };
  const id = entryId(entry.codePath, entry.codeName);
  const latestHash = scan.hashes[id];
  if (latestHash === undefined) return { known: false, isStale: false, diff: [] };

  const isStale = latestHash !== entry.propSignatureHash;
  const latestProps = scan.props?.[id];
  const diff = isStale && latestProps ? diffProps(entry.props, latestProps) : [];
  return { known: true, isStale, diff };
}

/** Human-readable one-liner for a prop change, e.g. `+ iconPosition`. */
export function describeDiff(d: PropDiff): string {
  switch (d.change) {
    case "added":
      return `+ ${d.name}: ${d.after}`;
    case "removed":
      return `− ${d.name}: ${d.before}`;
    case "type-changed":
      return `~ ${d.name}: ${d.before} → ${d.after}`;
    case "required-changed":
      return `~ ${d.name}: required ${d.before} → ${d.after}`;
  }
}
