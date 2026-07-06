/**
 * In-plugin match assist (Connect.md §4.3) — suggest likely manifest entries for
 * the selected Figma component by comparing its name and variant properties. A
 * convenience layer only: it NEVER auto-confirms a mapping (§4.3).
 *
 * Reuses the same `similarity` scoring as the MCP server so suggestions rank the
 * way search does.
 */

import { similarity, type ComponentManifestEntry } from "@ui-organized/code-connect/browser";

export interface Suggestion {
  entry: ComponentManifestEntry;
  score: number;
  /** Why it was suggested — shown to the user so a weak match is obviously weak. */
  reason: string;
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Fraction of the Figma component's variant props that appear in the entry. */
function variantOverlap(entry: ComponentManifestEntry, variantProps: string[]): number {
  if (variantProps.length === 0) return 0;
  const known = new Set<string>();
  for (const p of entry.props) {
    known.add(norm(p.name));
    if (p.figmaVariantMapping) known.add(norm(p.figmaVariantMapping));
  }
  const hits = variantProps.filter((v) => known.has(norm(v))).length;
  return hits / variantProps.length;
}

/**
 * Top-N suggestions for a selection, best first. Name similarity dominates; variant
 * overlap is a tie-breaking boost. Deprecated entries are down-weighted, not hidden.
 */
export function suggest(
  entries: ComponentManifestEntry[],
  figmaName: string,
  variantProps: string[],
  limit = 3,
): Suggestion[] {
  const scored: Suggestion[] = [];
  for (const entry of entries) {
    const nameScore = Math.max(
      similarity(figmaName, entry.figmaComponentName),
      similarity(figmaName, entry.codeName),
    );
    const overlap = variantOverlap(entry, variantProps);
    let score = nameScore * 0.8 + overlap * 0.2;
    if (entry.status === "deprecated") score *= 0.5;
    if (score <= 0) continue;

    const reasons: string[] = [`name ${(nameScore * 100) | 0}%`];
    if (overlap > 0) reasons.push(`${(overlap * 100) | 0}% variant match`);
    if (entry.status === "deprecated") reasons.push("deprecated");
    scored.push({ entry, score: Number(score.toFixed(3)), reason: reasons.join(" · ") });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
