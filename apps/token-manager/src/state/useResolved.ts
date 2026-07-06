import { useMemo } from "react";
import { mergeSets, resolve, selectSetsForMode, type ResolveResult } from "@ui-organized/resolver";
import { applyOverrides } from "@ui-organized/token-io";
import { readProjectDocument, useDocVersion } from "../yjs/store.js";

/** Mode-aware set selection now lives in the resolver (shared with the export). */
export { selectSetsForMode };

export interface ResolvedView {
  result: ResolveResult;
  /** Every token path available in the merged document (for reference pickers). */
  paths: string[];
}

/** Merges + resolves the active theme/mode, re-running whenever the doc changes. */
export function useResolved(themeName: string, mode: string): ResolvedView {
  const version = useDocVersion();
  return useMemo(() => {
    const doc = readProjectDocument();
    const overrides = doc.overrides ?? {};
    const theme = doc.themes.find((t) => t.name === themeName);
    const active = (theme ? selectSetsForMode(doc, theme, mode) : []).map((set) => ({
      ...set,
      tokens: applyOverrides(set.tokens, overrides),
    }));
    const effective = mergeSets(active);
    const result = resolve(effective, { mode });
    const paths = [...effective.tokens.keys()].sort();
    return { result, paths };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, themeName, mode]);
}
