import {
  parseProjectDocument,
  SCHEMA_VERSION,
  type DtcgGroup,
  type DtcgToken,
  type DtcgType,
  type ProjectDocument,
  type Result,
  type Theme,
} from "@ui-organized/schema";
import type { ImportOptions } from "./import.js";

/**
 * Tokens Studio import / export. TS files are `$metadata` (set order) + `$themes`
 * (set-status combos) + one tree per set, with tokens in `{ value, type }` form
 * and TS-specific type names. We map TS types to DTCG, remap `boxShadow`
 * sub-fields, and **preserve everything we don't model** under
 * `$extensions["tokens-studio"]` so re-export is lossless on known fields.
 *
 * The provenance namespace is `tokens-studio` (neutral) — never `uiorganized`.
 */

const EXT = "tokens-studio";

export interface TokensStudioTheme {
  id?: string;
  name: string;
  group?: string;
  selectedTokenSets: Record<string, "enabled" | "disabled" | "source">;
  [key: string]: unknown;
}

export interface TokensStudioFile {
  $metadata?: { tokenSetOrder?: string[] };
  $themes?: TokensStudioTheme[];
  [setName: string]: unknown;
}

const TS_TO_DTCG: Record<string, DtcgType> = {
  color: "color",
  dimension: "dimension",
  spacing: "dimension",
  sizing: "dimension",
  borderRadius: "dimension",
  borderWidth: "dimension",
  fontSizes: "dimension",
  lineHeights: "dimension",
  letterSpacing: "dimension",
  paragraphSpacing: "dimension",
  fontWeights: "fontWeight",
  fontFamilies: "fontFamily",
  opacity: "number",
  number: "number",
  duration: "duration",
  cubicBezier: "cubicBezier",
  boxShadow: "shadow",
  typography: "typography",
  border: "border",
  borderStyle: "strokeStyle",
};

const DTCG_TO_TS: Record<DtcgType, string> = {
  color: "color",
  dimension: "dimension",
  fontWeight: "fontWeights",
  fontFamily: "fontFamilies",
  number: "number",
  duration: "duration",
  cubicBezier: "cubicBezier",
  shadow: "boxShadow",
  typography: "typography",
  border: "border",
  strokeStyle: "borderStyle",
  gradient: "other",
  transition: "other",
};

const TOKEN_FIELDS = new Set(["value", "$value", "type", "$type", "description", "$description"]);

function isTsToken(node: object): boolean {
  return "value" in node || "$value" in node;
}

// ─── boxShadow sub-field remap (TS x/y/type ↔ DTCG offsetX/offsetY/inset) ────

function remapShadow(value: unknown, toDtcg: boolean): unknown {
  const one = (shadow: unknown): unknown => {
    if (shadow === null || typeof shadow !== "object") return shadow;
    const s = shadow as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    if ("color" in s) out.color = s.color;
    if ("blur" in s) out.blur = s.blur;
    if ("spread" in s) out.spread = s.spread;
    if (toDtcg) {
      if ("x" in s) out.offsetX = s.x;
      if ("y" in s) out.offsetY = s.y;
      if (s.type === "innerShadow") out.inset = true;
    } else {
      if ("offsetX" in s) out.x = s.offsetX;
      if ("offsetY" in s) out.y = s.offsetY;
      out.type = s.inset ? "innerShadow" : "dropShadow";
    }
    return out;
  };
  return Array.isArray(value) ? value.map(one) : one(value);
}

// ─── Import ──────────────────────────────────────────────────────────────────

function convertToken(node: Record<string, unknown>): DtcgToken {
  const rawValue = "$value" in node ? node.$value : node.value;
  const tsType = ("$type" in node ? node.$type : node.type) as string | undefined;
  const dtcgType = tsType ? TS_TO_DTCG[tsType] : undefined;

  const token: DtcgToken = {
    $value: dtcgType === "shadow" ? remapShadow(rawValue, true) : rawValue,
  };
  if (dtcgType) token.$type = dtcgType;
  const description = ("$description" in node ? node.$description : node.description) as unknown;
  if (typeof description === "string") token.$description = description;

  const preserved: Record<string, unknown> = {};
  // Keep the original TS type when it doesn't round-trip via the DTCG mapping.
  if (tsType && (dtcgType === undefined || DTCG_TO_TS[dtcgType] !== tsType)) preserved.type = tsType;
  for (const [key, value] of Object.entries(node)) {
    if (!TOKEN_FIELDS.has(key)) preserved[key] = value;
  }
  if (Object.keys(preserved).length > 0) token.$extensions = { [EXT]: preserved };
  return token;
}

function convertTree(node: unknown): DtcgGroup {
  const out: Record<string, unknown> = {};
  if (node === null || typeof node !== "object") return out as DtcgGroup;
  for (const [key, child] of Object.entries(node)) {
    if (child === null || typeof child !== "object") continue;
    out[key] = isTsToken(child) ? convertToken(child as Record<string, unknown>) : convertTree(child);
  }
  return out as DtcgGroup;
}

function convertTheme(theme: TokensStudioTheme): Theme {
  const out: Theme = { name: theme.name, selectedTokenSets: theme.selectedTokenSets };
  if (theme.id) out.id = theme.id;
  if (theme.group) out.group = theme.group;
  const extras: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(theme)) {
    if (!["id", "name", "group", "selectedTokenSets"].includes(key)) extras[key] = value;
  }
  if (Object.keys(extras).length > 0) out.$extensions = { [EXT]: extras };
  return out;
}

export function importTokensStudio(
  file: TokensStudioFile,
  options: ImportOptions = {},
): Result<ProjectDocument, Error> {
  const order = file.$metadata?.tokenSetOrder;
  const setNames = (order && order.length > 0
    ? order
    : Object.keys(file).filter((k) => k !== "$metadata" && k !== "$themes")
  ).filter((name) => name in file);

  const sets = setNames.map((name) => ({ name, tokens: convertTree(file[name]) }));
  const themes = (file.$themes ?? []).map(convertTheme);
  const finalThemes: Theme[] = themes.length
    ? themes
    : [{ name: "Default", selectedTokenSets: Object.fromEntries(setNames.map((n) => [n, "enabled"])) }];

  const created = options.createdAt ?? "";
  const candidate = {
    version: SCHEMA_VERSION,
    meta: { name: options.name ?? "Imported", createdAt: created, updatedAt: options.updatedAt ?? created, schemaVersion: SCHEMA_VERSION },
    sets,
    themes: finalThemes,
    modes: {},
  };
  const parsed = parseProjectDocument(candidate);
  return parsed.ok ? { ok: true, value: parsed.value } : { ok: false, error: parsed.error };
}

// ─── Export (re-export to Tokens Studio shape) ───────────────────────────────

function exportToken(token: DtcgToken): Record<string, unknown> {
  const preserved = (token.$extensions?.[EXT] ?? {}) as Record<string, unknown>;
  const tsType =
    (preserved.type as string | undefined) ?? (token.$type ? DTCG_TO_TS[token.$type] : undefined);

  const out: Record<string, unknown> = {
    value: token.$type === "shadow" ? remapShadow(token.$value, false) : token.$value,
  };
  if (tsType) out.type = tsType;
  if (typeof token.$description === "string") out.description = token.$description;
  for (const [key, value] of Object.entries(preserved)) {
    if (key !== "type") out[key] = value;
  }
  return out;
}

function exportTree(group: DtcgGroup): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, node] of Object.entries(group)) {
    if (key.startsWith("$") || node === null || typeof node !== "object") continue;
    out[key] = "$value" in node ? exportToken(node as DtcgToken) : exportTree(node as DtcgGroup);
  }
  return out;
}

function exportTheme(theme: Theme): TokensStudioTheme {
  const extras = (theme.$extensions?.[EXT] ?? {}) as Record<string, unknown>;
  const out: TokensStudioTheme = { name: theme.name, selectedTokenSets: theme.selectedTokenSets };
  if (theme.id) out.id = theme.id;
  if (theme.group) out.group = theme.group;
  for (const [key, value] of Object.entries(extras)) out[key] = value;
  return out;
}

export function exportTokensStudio(doc: ProjectDocument): TokensStudioFile {
  const file: TokensStudioFile = {};
  for (const set of doc.sets) file[set.name] = exportTree(set.tokens);
  file.$metadata = { tokenSetOrder: doc.sets.map((s) => s.name) };
  file.$themes = doc.themes.map(exportTheme);
  return file;
}
