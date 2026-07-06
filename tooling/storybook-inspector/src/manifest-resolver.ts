/**
 * Story ↔ manifest linking (INSPECTOR.md §3). Pure and unit-testable.
 *
 * Priority:
 *  3.1 Explicit `parameters.figmaCodeConnect.componentKey` → `confidence: "exact"`
 *      by construction (no guessing).
 *  3.2 Implicit fallback → similarity match on the story's component name / import
 *      path, using the SAME `similarity` + threshold as the MCP server's
 *      `search_components` (§6). Never promoted to "exact".
 *  3.3 No match → the "Unmapped" state (§7); we never fabricate a panel from
 *      Storybook's own inferred argTypes.
 */

import {
  similarity,
  FUZZY_THRESHOLD,
  type ComponentManifestEntry,
  type Confidence,
} from "@ui-organized/code-connect/browser";

export type ResolveSource = "explicit" | "fallback" | "none";

export interface StoryLink {
  /** From `parameters.figmaCodeConnect.componentKey`. */
  componentKey?: string;
  /** Display name for the current story's component (e.g. story title leaf). */
  componentName?: string;
  /** The story/component import path Storybook knows about. */
  importPath?: string;
}

export interface Resolution {
  entry: ComponentManifestEntry | null;
  confidence: Confidence;
  source: ResolveSource;
  /** Similarity score for a fallback match, surfaced so weak matches show weak. */
  score?: number;
}

function basename(path: string): string {
  const leaf = path.split(/[\\/]/).pop() ?? path;
  return leaf.replace(/\.(stories|component)\.[tj]sx?$/i, "").replace(/\.[tj]sx?$/i, "");
}

export function resolveStory(
  entries: ComponentManifestEntry[],
  link: StoryLink,
): Resolution {
  // 3.1 explicit key.
  if (link.componentKey) {
    const entry = entries.find((e) => e.figmaComponentKey === link.componentKey);
    if (entry) return { entry, confidence: "exact", source: "explicit" };
    // A key that doesn't resolve is not "exact" — fall through to fallback.
  }

  // 3.2 fallback by name/path similarity.
  const query = link.componentName || (link.importPath ? basename(link.importPath) : "");
  if (query) {
    let best: ComponentManifestEntry | null = null;
    let bestScore = 0;
    for (const e of entries) {
      const score = Math.max(similarity(query, e.codeName), similarity(query, e.figmaComponentName));
      if (score > bestScore) {
        bestScore = score;
        best = e;
      }
    }
    if (best && bestScore >= FUZZY_THRESHOLD) {
      return { entry: best, confidence: "fuzzy", source: "fallback", score: Number(bestScore.toFixed(3)) };
    }
  }

  // 3.3 no match.
  return { entry: null, confidence: "none", source: "none" };
}
