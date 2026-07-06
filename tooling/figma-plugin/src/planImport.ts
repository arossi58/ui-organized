/**
 * Read-only dry run for importTheme: given a parsed theme.json, work out which
 * variables would be created, overwritten, or left unchanged — without mutating
 * anything. The result drives the import preview table in the UI ("what WILL be
 * added and overwritten"), and Apply then runs the real importTheme.
 *
 * This deliberately mirrors importTheme's traversal (same collections, names,
 * types, alias resolution) so the preview matches what Apply does. It does NOT
 * touch scopes, modes, or values — it only reads existing variables to compute
 * each row's `before`, and re-derives each `after` from the incoming theme.
 */

import { adjustStrokeWidth, shouldAdjustStroke } from "@ui-organized/utils";
import { parseColor, rgbaToCss, toFloat, type RGBA } from "./color";
import type { ChangeStatus, ImportPlan, PlanCell, PlanRow } from "./plan";
import { flattenTokens, type DtcgToken, type DtcgNode, type ThemeDoc } from "./types";

const PRIMITIVES = "Primitives";
const SEMANTIC = "Semantic";
const SCALE = "Scale";
const TYPOGRAPHY = "Typography";
const ICONS = "Icons";

const ICON_SIZES = [12, 16, 20, 24, 32, 40, 48, 64];
const ALIAS_RE = /^\{primitive\.color\.([^.]+)\.([^.}]+)\}$/;

function isAlias(v: VariableValue): v is VariableAlias {
  return typeof v === "object" && v !== null && (v as { type?: string }).type === "VARIABLE_ALIAS";
}
function isRgba(v: VariableValue): v is RGBA {
  return typeof v === "object" && v !== null && "r" in v && "g" in v && "b" in v;
}

/** Format a numeric value the way the preview shows it (trim float noise). */
function fmtNum(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 1000) / 1000);
}

/** Case-fold hex so `#FFF` and `#ffffff`-style differences don't read as changes. */
function normDisplay(s: string): string {
  return s.trim().toLowerCase();
}

function cellsEqual(a: PlanCell[], b: PlanCell[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((c, i) => c.mode === b[i]!.mode && normDisplay(c.display) === normDisplay(b[i]!.display));
}

export async function planImport(theme: ThemeDoc): Promise<ImportPlan> {
  const warnings: string[] = [];
  const rows: PlanRow[] = [];

  // Index existing collections + variables once (read-only).
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const colByName = new Map(collections.map((c) => [c.name, c] as const));
  const colById = new Map(collections.map((c) => [c.id, c] as const));
  const colDefaultMode = new Map(collections.map((c) => [c.id, c.defaultModeId] as const));
  const allVars = await figma.variables.getLocalVariablesAsync();
  const byId = new Map(allVars.map((v) => [v.id, v] as const));
  const varsByCollection = new Map<string, Map<string, Variable>>();
  for (const v of allVars) {
    let m = varsByCollection.get(v.variableCollectionId);
    if (!m) {
      m = new Map();
      varsByCollection.set(v.variableCollectionId, m);
    }
    m.set(v.name, v);
  }

  const existingVar = (collection: string, name: string): Variable | undefined => {
    const c = colByName.get(collection);
    return c ? varsByCollection.get(c.id)?.get(name) : undefined;
  };

  /** Resolve a stored variable value to a CSS color, following aliases. */
  const resolveColorCss = (val: VariableValue | undefined, depth = 0): string | null => {
    if (val === undefined || depth > 4) return null;
    if (isAlias(val)) {
      const target = byId.get(val.id);
      if (!target) return null;
      const mode = colDefaultMode.get(target.variableCollectionId);
      return resolveColorCss(mode ? target.valuesByMode[mode] : undefined, depth + 1);
    }
    if (isRgba(val)) return rgbaToCss(val);
    return null;
  };

  /**
   * Resolve a stored value into a display cell: an alias keeps the referenced
   * token's name (and resolves the hex behind it for the swatch/tooltip); a raw
   * color just carries its hex.
   */
  const resolveColorCell = (val: VariableValue | undefined): { color?: string; token?: string } => {
    if (val === undefined) return {};
    if (isAlias(val)) {
      const target = byId.get(val.id);
      if (!target) return {};
      const mode = colDefaultMode.get(target.variableCollectionId);
      const color = resolveColorCss(mode ? target.valuesByMode[mode] : undefined) ?? undefined;
      return { color, token: target.name };
    }
    if (isRgba(val)) return { color: rgbaToCss(val) };
    return {};
  };

  const statusOf = (before: PlanCell[] | null, after: PlanCell[]): ChangeStatus =>
    before === null ? "add" : cellsEqual(before, after) ? "unchanged" : "update";

  /**
   * Push a color row. `beforeModeId` maps an after-cell's mode label to the
   * existing variable's matching mode id (single-mode collections ignore the
   * label and use the collection default).
   */
  const colorRow = (
    collection: string,
    name: string,
    after: PlanCell[],
    beforeModeId: (mode: string, existing: Variable) => string | undefined,
  ) => {
    const ex = existingVar(collection, name);
    if (ex && ex.resolvedType !== "COLOR") {
      warnings.push(`Skipped "${collection} / ${name}": exists as ${ex.resolvedType}, expected COLOR.`);
      return;
    }
    const before = ex
      ? after.map((cell): PlanCell => {
          const mid = beforeModeId(cell.mode, ex);
          const r = mid ? resolveColorCell(ex.valuesByMode[mid]) : {};
          return { mode: cell.mode, display: r.token ?? r.color ?? "—", color: r.color, token: r.token };
        })
      : null;
    rows.push({ collection, name, kind: "color", status: statusOf(before, after), before: before ?? [], after });
  };

  const floatRow = (collection: string, name: string, num: number) => {
    const ex = existingVar(collection, name);
    if (ex && ex.resolvedType !== "FLOAT") {
      warnings.push(`Skipped "${collection} / ${name}": exists as ${ex.resolvedType}, expected FLOAT.`);
      return;
    }
    const after: PlanCell[] = [{ mode: "Value", display: fmtNum(num) }];
    let before: PlanCell[] | null = null;
    if (ex) {
      const cur = ex.valuesByMode[colDefaultMode.get(ex.variableCollectionId)!];
      before = [{ mode: "Value", display: typeof cur === "number" ? fmtNum(cur) : "—" }];
    }
    rows.push({ collection, name, kind: "number", status: statusOf(before, after), before: before ?? [], after });
  };

  const stringRow = (collection: string, name: string, value: string) => {
    const ex = existingVar(collection, name);
    if (ex && ex.resolvedType !== "STRING") {
      warnings.push(`Skipped "${collection} / ${name}": exists as ${ex.resolvedType}, expected STRING.`);
      return;
    }
    const after: PlanCell[] = [{ mode: "Value", display: value }];
    let before: PlanCell[] | null = null;
    if (ex) {
      const cur = ex.valuesByMode[colDefaultMode.get(ex.variableCollectionId)!];
      before = [{ mode: "Value", display: typeof cur === "string" ? cur : "—" }];
    }
    rows.push({ collection, name, kind: "string", status: statusOf(before, after), before: before ?? [], after });
  };

  // ─── 1. Primitives ──────────────────────────────────────────────────────────
  const primValue = new Map<string, RGBA>(); // "group.step" → incoming color (for semantic aliases)
  const primDefaultMode = (_mode: string, ex: Variable) => colDefaultMode.get(ex.variableCollectionId);
  for (const [group, steps] of Object.entries(theme.primitive?.color ?? {})) {
    for (const [step, token] of Object.entries(steps)) {
      const rgba = parseColor(String(token.$value));
      if (!rgba) {
        warnings.push(`Bad primitive color ${group}.${step}: "${token.$value}".`);
        continue;
      }
      primValue.set(`${group}.${step}`, rgba);
      const css = rgbaToCss(rgba);
      colorRow(PRIMITIVES, `${group}/${step}`, [{ mode: "Value", display: css, color: css }], primDefaultMode);
    }
  }

  // ─── 2. Semantic (Light / Dark, aliasing Primitives) ─────────────────────────
  const semCol = colByName.get(SEMANTIC);
  const semModeId = (label: string) =>
    semCol?.modes.find((m) => m.name.toLowerCase() === label)?.modeId;
  const lightId = semModeId("light");
  const darkId = semModeId("dark");
  const semBeforeMode = (mode: string) => (mode === "Light" ? lightId : darkId);

  const merged = new Map<string, { light?: DtcgToken; dark?: DtcgToken }>();
  const collect = (node: Record<string, DtcgNode> | undefined, mode: "light" | "dark") => {
    for (const { path, token } of flattenTokens(node)) {
      let e = merged.get(path);
      if (!e) {
        e = {};
        merged.set(path, e);
      }
      e[mode] = token;
    }
  };
  collect(theme.color?.light, "light");
  collect(theme.color?.dark, "dark");

  const semanticCell = (label: string, token: DtcgToken | undefined, path: string): PlanCell | null => {
    if (!token) return null;
    const raw = String(token.$value);
    const alias = ALIAS_RE.exec(raw);
    if (alias) {
      // Show the referenced primitive token (its Figma variable name), not the hex.
      const tokenName = `${alias[1]}/${alias[2]}`;
      const rgba = primValue.get(`${alias[1]}.${alias[2]}`);
      const css = rgba ? rgbaToCss(rgba) : undefined;
      if (!css) warnings.push(`Unresolved alias "${raw}" for ${path}.`);
      return { mode: label, display: tokenName, color: css, token: tokenName };
    }
    const rgba = parseColor(raw);
    const css = rgba ? rgbaToCss(rgba) : undefined;
    if (!css) warnings.push(`Unparseable color "${raw}" for ${path}.`);
    return { mode: label, display: css ?? raw, color: css };
  };

  for (const [path, { light, dark }] of merged) {
    const after: PlanCell[] = [];
    const lc = semanticCell("Light", light, path);
    const dc = semanticCell("Dark", dark, path);
    if (lc) after.push(lc);
    if (dc) after.push(dc);
    if (after.length === 0) continue;
    colorRow(SEMANTIC, path, after, semBeforeMode);
  }

  // ─── 3. Scale (spacing / radius / component) ─────────────────────────────────
  const planDimensions = (node: Record<string, DtcgNode> | undefined, prefix: string) => {
    for (const { path, token } of flattenTokens(node)) {
      const num = toFloat(token.$value);
      if (num === null) {
        warnings.push(`Bad dimension ${prefix}${path}: "${token.$value}".`);
        continue;
      }
      floatRow(SCALE, `${prefix}${path}`, num);
    }
  };
  planDimensions(theme.spacing, "spacing/");
  planDimensions(theme["border-radius"], "radius/");
  planDimensions(theme.component, "component/");

  // ─── 4. Typography ───────────────────────────────────────────────────────────
  for (const { path, token } of flattenTokens(theme.type)) {
    if (token.$type === "fontFamily") {
      stringRow(TYPOGRAPHY, path, String(token.$value));
      continue;
    }
    const num = toFloat(token.$value);
    if (num === null) {
      warnings.push(`Bad typography value ${path}: "${token.$value}".`);
      continue;
    }
    floatRow(TYPOGRAPHY, path, num);
  }

  // ─── 5. Icons (materialised size → stroke pairs) ─────────────────────────────
  const icons = theme.$extensions?.["com.ui-organized.theme-builder"]?.icons;
  if (icons && shouldAdjustStroke(!!icons.strokeAdjustment, icons.style ?? "outline")) {
    const baseSize = icons.baseSize ?? 24;
    const baseStroke = icons.baseStroke ?? 2;
    for (const size of ICON_SIZES) {
      floatRow(ICONS, `${size}px/size`, size);
      floatRow(ICONS, `${size}px/stroke`, adjustStrokeWidth(size, baseStroke, baseSize));
    }
  }

  const counts = { add: 0, update: 0, unchanged: 0, total: rows.length };
  for (const r of rows) counts[r.status]++;

  return { rows, warnings, counts };
}
