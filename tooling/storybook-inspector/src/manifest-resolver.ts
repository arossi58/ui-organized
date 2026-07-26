/**
 * Story ↔ manifest linking (INSPECTOR.md §3). Pure and unit-testable.
 *
 * Priority:
 *  3.1  Explicit `parameters.figmaCodeConnect.componentKey` → `confidence: "exact"`
 *       by construction (no guessing).
 *  3.1b An unambiguous exact code-name match → also "exact". `similarity` returns
 *       1 only for normalized string equality and reserves that for a true exact
 *       match, so this is a fact about the code mapping, not a guess. Guarded on
 *       a single hit. (This case used to be reported as "fuzzy"; once the AI
 *       context block started rendering confidence as a warning, that put an
 *       "unverified" caveat on 42 of 45 stories and devalued the real ones.)
 *  3.2  Implicit fallback → similarity match on the story's component name /
 *       import path, using the SAME `similarity` + threshold as the MCP server's
 *       `search_components` (§6), and only when it beats the runner-up by a
 *       clear margin. Never promoted to "exact".
 *  3.3  No match, or an ambiguous one → the "Unmapped" state (§7); we never
 *       fabricate a panel from Storybook's own inferred argTypes.
 */

import {
  similarity,
  FUZZY_THRESHOLD,
  type ComponentManifestEntry,
  type Confidence,
} from "@ui-organized/code-connect/browser";

export type ResolveSource = "explicit" | "code-name" | "fallback" | "none";

/**
 * How much better than the runner-up a fallback match must be to be trusted.
 * Without this, "Navigation" scores 0.556 against `Pagination` — over threshold,
 * and the panel confidently shows Pagination's props on the Navigation story.
 */
const AMBIGUITY_MARGIN = 0.1;

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

  const query = link.componentName || (link.importPath ? basename(link.importPath) : "");
  if (query) {
    // 3.1b exact code-name match. `similarity` returns exactly 1 only when the
    // normalized strings are equal — its contract reserves 1 for a true exact
    // name match "so callers can trust it" (mcp/confidence.ts). Treating that as
    // merely "fuzzy" put a scary unverified warning on 42 of the 45 stories,
    // which teaches people to ignore the warning that actually matters. Guarded
    // on a single hit so a future duplicate `codeName` degrades to the fallback
    // rather than silently picking one.
    const exact = entries.filter((e) => similarity(query, e.codeName) === 1);
    if (exact.length === 1) {
      return { entry: exact[0]!, confidence: "exact", source: "code-name", score: 1 };
    }

    // 3.2 fallback by name/path similarity.
    let best: ComponentManifestEntry | null = null;
    let bestScore = 0;
    let runnerUp = 0;
    for (const e of entries) {
      const score = Math.max(similarity(query, e.codeName), similarity(query, e.figmaComponentName));
      if (score > bestScore) {
        runnerUp = bestScore;
        bestScore = score;
        best = e;
      } else if (score > runnerUp) {
        runnerUp = score;
      }
    }
    // A win that isn't clearly a win is a coin flip dressed up as an answer.
    const decisive = bestScore - runnerUp >= AMBIGUITY_MARGIN;
    if (best && bestScore >= FUZZY_THRESHOLD && decisive) {
      return { entry: best, confidence: "fuzzy", source: "fallback", score: Number(bestScore.toFixed(3)) };
    }
  }

  // 3.3 no match.
  return { entry: null, confidence: "none", source: "none" };
}
