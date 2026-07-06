import type {
  DtcgGroup,
  DtcgToken,
  DtcgType,
  ProjectDocument,
  Theme,
  TokenSet,
} from "@ui-organized/schema";
import type { EffectiveDocument, EffectiveToken } from "./types.js";

/**
 * Merging token sets into a flat, mode-selected {@link EffectiveDocument}.
 *
 * Flattening walks the DTCG tree to dot-joined paths, applying group `$type`
 * inheritance. Merging overlays sets in array order — later sets win by path.
 * Per-mode divergence is expressed by passing a different ordered set list per
 * mode (e.g. `[primitives, semantic-light]` vs `[primitives, semantic-dark]`).
 */

const META_KEYS = new Set(["$type", "$description", "$extensions"]);

/** Flattens one set's DTCG tree into effective tokens (paths exclude the set name). */
export function flattenSet(set: TokenSet): EffectiveToken[] {
  const out: EffectiveToken[] = [];
  walk(set.tokens, "", undefined, out);
  return out;
}

function walk(
  group: DtcgGroup,
  prefix: string,
  inheritedType: DtcgType | undefined,
  out: EffectiveToken[],
): void {
  const groupType = (group.$type as DtcgType | undefined) ?? inheritedType;

  for (const [key, child] of Object.entries(group)) {
    if (META_KEYS.has(key)) continue;
    if (child === null || typeof child !== "object") continue;

    const path = prefix ? `${prefix}.${key}` : key;

    if ("$value" in child) {
      const token = child as DtcgToken;
      const type = (token.$type ?? groupType) as DtcgType | undefined;
      const eff: EffectiveToken = { path, $value: token.$value };
      if (type) eff.$type = type;
      if (token.$extensions) eff.$extensions = token.$extensions;
      out.push(eff);
    } else {
      walk(child as DtcgGroup, path, groupType, out);
    }
  }
}

/**
 * Merges an ordered list of sets into a flat effective document. Later sets
 * override earlier ones by token path; disabled sets are simply not passed in.
 */
export function mergeSets(sets: TokenSet[]): EffectiveDocument {
  const tokens = new Map<string, EffectiveToken>();
  for (const set of sets) {
    for (const token of flattenSet(set)) {
      tokens.set(token.path, token);
    }
  }
  return { tokens };
}

/**
 * Returns the sets active for a theme, in document (precedence) order. Both
 * `enabled` and `source` sets participate in resolution; `disabled` and
 * unlisted sets are excluded. (Filtering `source` out of *exports* is a separate,
 * later concern.)
 */
export function selectActiveSets(doc: ProjectDocument, theme: Theme): TokenSet[] {
  return doc.sets.filter((set) => {
    const status = theme.selectedTokenSets[set.name];
    return status === "enabled" || status === "source";
  });
}

/**
 * Like {@link selectActiveSets} but mode-aware: a set tagged `$extensions.mode`
 * participates only when its mode matches `mode`; untagged sets always do. This
 * is the neutral, set-list-per-mode way to express per-mode divergence — shared
 * by the editor and the export pipeline so they never diverge.
 */
export function selectSetsForMode(doc: ProjectDocument, theme: Theme, mode: string): TokenSet[] {
  return selectActiveSets(doc, theme).filter((set) => {
    const setMode = (set.$extensions as { mode?: string } | undefined)?.mode;
    return !setMode || setMode === mode;
  });
}

/** Convenience: merge the sets active for a named theme into an effective document. */
export function mergeProjectDocument(doc: ProjectDocument, themeName: string): EffectiveDocument {
  const theme = doc.themes.find((t) => t.name === themeName);
  return mergeSets(theme ? selectActiveSets(doc, theme) : []);
}
