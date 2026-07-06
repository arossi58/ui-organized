/**
 * Pure prop-set diffing (Connect.md §4.4, §6.2). Browser-safe — shared by the MCP
 * server's staleness/validate paths and the Figma plugin's "what changed" view, so
 * both describe drift identically.
 */

import type { PropDefinition, PropDiff } from "./schema.js";

/** What changed going from `stored` props to `current` props. Sorted by name. */
export function diffProps(stored: PropDefinition[], current: PropDefinition[]): PropDiff[] {
  const byName = (list: PropDefinition[]) => new Map(list.map((p) => [p.name, p]));
  const s = byName(stored);
  const c = byName(current);
  const diffs: PropDiff[] = [];

  for (const [name, cur] of c) {
    const old = s.get(name);
    if (!old) {
      diffs.push({ name, change: "added", after: cur.type });
    } else if (old.type !== cur.type) {
      diffs.push({ name, change: "type-changed", before: old.type, after: cur.type });
    } else if (old.required !== cur.required) {
      diffs.push({
        name,
        change: "required-changed",
        before: String(old.required),
        after: String(cur.required),
      });
    }
  }
  for (const [name, old] of s) {
    if (!c.has(name)) diffs.push({ name, change: "removed", before: old.type });
  }
  return diffs.sort((a, b) => a.name.localeCompare(b.name));
}

export function changedPropNames(stored: PropDefinition[], current: PropDefinition[]): string[] {
  return diffProps(stored, current).map((d) => d.name);
}
