/**
 * Confidence scoring (Connect.md §6.5) — deterministic, not vibes-based.
 *
 *  - `exact`: a pluginData pointer (component key) resolves directly to a manifest
 *    entry. (Hash currency is reported separately via staleness — a stale-but-real
 *    mapping is still an exact *identity* match, just flagged.)
 *  - `fuzzy`: name-similarity match only (used by `search_components` when there's
 *    no direct pointer) — ALWAYS surfaced with its similarity score so a human or
 *    agent can judge it. Never used to paper over a weak match (§6.4.3).
 *  - `none`: nothing scored above threshold.
 *
 * The fuzzy threshold starts conservative (Connect.md §12) and is overridable via
 * `CODE_CONNECT_FUZZY_THRESHOLD` so it can be loosened only if testing shows it
 * rejecting genuinely good matches.
 */

import type {
  ComponentManifestEntry,
  SearchComponentsInput,
  SearchResult,
} from "../schema.js";
// Type-only — erased at build time, so this module stays browser-safe (no fs).
import type { ManifestLoader } from "./manifest-loader.js";

export const FUZZY_THRESHOLD = (() => {
  // Guarded so this module stays importable in a browser bundle (the Figma plugin
  // and the Storybook inspector both pull it in via `/browser`), where `process`
  // may be undefined.
  const env = typeof process !== "undefined" ? process.env?.CODE_CONNECT_FUZZY_THRESHOLD : undefined;
  const raw = Number(env);
  return Number.isFinite(raw) && raw > 0 && raw <= 1 ? raw : 0.55;
})();

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Character-bigram Dice coefficient in [0,1]. */
function diceBigram(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const bigrams = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i++) {
    const g = a.slice(i, i + 2);
    bigrams.set(g, (bigrams.get(g) ?? 0) + 1);
  }
  let overlap = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const g = b.slice(i, i + 2);
    const count = bigrams.get(g) ?? 0;
    if (count > 0) {
      bigrams.set(g, count - 1);
      overlap++;
    }
  }
  return (2 * overlap) / (a.length - 1 + (b.length - 1));
}

/**
 * Similarity of a query against a candidate name/path, in [0,1]. Full-string
 * containment is boosted (searching "button" should strongly match "IconButton")
 * but never reaches 1 unless the normalized strings are equal — 1 is reserved for
 * a true exact name match so callers can trust it.
 */
export function similarity(query: string, candidate: string): number {
  const q = normalize(query);
  const c = normalize(candidate);
  if (!q || !c) return 0;
  if (q === c) return 1;
  const dice = diceBigram(q, c);
  const contains = c.includes(q) || q.includes(c) ? 0.85 : 0;
  return Math.max(dice, contains);
}

/**
 * Pure fuzzy search over an in-memory entry list — browser-safe, so the Figma
 * plugin's autocomplete (§4.2) uses the exact same scoring as the MCP server. Only
 * entries scoring above threshold appear; each carries its score so weak matches
 * are self-evidently weak. Also matches on `codeName` so searching "CardHeader"
 * finds it even before it's given a Figma name.
 */
export function searchEntries(
  entries: ComponentManifestEntry[],
  input: SearchComponentsInput,
): SearchResult[] {
  const { query, framework, status } = input;
  const scored: SearchResult[] = [];

  for (const entry of entries) {
    if (framework && entry.framework !== framework) continue;
    if (status && entry.status !== status) continue;

    const nameScore = Math.max(
      similarity(query, entry.figmaComponentName),
      similarity(query, entry.codeName),
    );
    const pathScore = similarity(query, entry.codePath) * 0.6; // path is a weaker signal
    const score = Math.max(nameScore, pathScore);
    if (score < FUZZY_THRESHOLD) continue;

    scored.push({
      componentKey: entry.figmaComponentKey,
      name: entry.figmaComponentName || entry.codeName,
      codePath: entry.codePath,
      confidence: score === 1 ? "exact" : "fuzzy",
      score: Number(score.toFixed(3)),
    });
  }

  return scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

/**
 * `search_components` implementation — the MCP server's wrapper over
 * {@link searchEntries}, reading the loaded manifest (§6.2).
 */
export function searchComponents(
  loader: ManifestLoader,
  input: SearchComponentsInput,
): SearchResult[] {
  return searchEntries(loader.all(), input);
}

/** Resolve a direct pointer (component key) to an entry — the `exact` path. */
export function resolveByKey(
  loader: ManifestLoader,
  figmaComponentKey: string,
): ComponentManifestEntry | undefined {
  return loader.byKey(figmaComponentKey);
}
