import type { DtcgType, ProjectDocument } from "@ui-organized/schema";
import {
  mergeSets,
  resolve,
  selectSetsForMode,
  type ResolvedValue,
} from "@ui-organized/resolver";
import { applyOverrides } from "@ui-organized/token-io";
import { cssValue } from "./css.js";

/**
 * Flat list of resolved tokens for one theme/mode — the single data source the
 * Storybook docs (ColorPalette, Typeset, spacing/radius/elevation matrices) read
 * from. Tokens and their documentation are one pipeline; no separate doc source.
 */
export interface ResolvedTokenEntry {
  path: string;
  type: DtcgType;
  value: ResolvedValue;
  references: string[];
  /** CSS value when expressible as a custom property. */
  css?: string;
}

export interface ExportTokensOptions {
  themeName?: string;
  mode?: string;
}

export function exportResolvedTokens(
  doc: ProjectDocument,
  options: ExportTokensOptions = {},
): ResolvedTokenEntry[] {
  const themeName = options.themeName ?? doc.themes[0]?.name;
  const theme = doc.themes.find((t) => t.name === themeName);
  const mode = options.mode ?? Object.keys(doc.modes)[0] ?? "default";
  const overrides = doc.overrides ?? {};

  const active = (theme ? selectSetsForMode(doc, theme, mode) : doc.sets).map((set) => ({
    ...set,
    tokens: applyOverrides(set.tokens, overrides),
  }));
  const result = resolve(mergeSets(active), { mode });

  const entries: ResolvedTokenEntry[] = [];
  for (const [path, resolution] of result.tokens) {
    const css = cssValue(resolution);
    const entry: ResolvedTokenEntry = {
      path,
      type: resolution.$type,
      value: resolution.raw,
      references: resolution.references,
    };
    if (css !== undefined) entry.css = css;
    entries.push(entry);
  }
  return entries.sort((a, b) => a.path.localeCompare(b.path));
}
