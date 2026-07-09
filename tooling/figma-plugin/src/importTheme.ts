/**
 * Imports a theme.json into Figma Variables across four collections:
 *
 *   Primitives  (1 mode "Value")          the used global color steps
 *   Semantic    (modes "Light" / "Dark")  one variable per semantic token,
 *                                          aliasing a Primitive (or a raw color)
 *   Scale       (1 mode "Value")          spacing / radius / component dimensions
 *   Typography  (1 mode "Value")          font families, weights, sizes, leading
 *
 * Collections and variables are matched by name: existing ones are updated in
 * place (the user's "override if present" requirement) and missing ones are
 * created. Primitives are imported first so the semantic aliases can resolve.
 */

import { adjustStrokeWidth, shouldAdjustStroke } from "@ui-organized/utils";
import { parseColor, toFloat, type RGBA } from "./color";
import { flattenTokens, type DtcgNode, type DtcgToken, type ThemeDoc } from "./types";

const PRIMITIVES = "Primitives";
const SEMANTIC = "Semantic";
const SCALE = "Scale";
const TYPOGRAPHY = "Typography";
const ICONS = "Icons";

/**
 * Icon sizes materialised in the Icons collection — the canonical set the
 * stroke-scaling algorithm documents. For each, we emit the size and its
 * optically-corrected stroke weight.
 */
const ICON_SIZES = [12, 16, 20, 24, 32, 40, 48, 64];

/** A primitive alias reference: `{primitive.color.<group>.<step>}`. */
const ALIAS_RE = /^\{primitive\.color\.([^.]+)\.([^.}]+)\}$/;
/** Figma's placeholder name for a brand-new collection's only mode. */
const DEFAULT_MODE_RE = /^Mode( 1)?$/;

/**
 * Infer Figma variable scopes from the collection + variable name the importer
 * already assigns. Scopes restrict where a variable surfaces in the UI: a radius
 * float only offers itself in corner-radius fields, a text colour only in text
 * fills, and so on. Without this, every variable defaults to ["ALL_SCOPES"] and
 * clutters every picker.
 *
 * Every branch returns scopes valid for `type` — Figma's setter throws if a
 * COLOR scope lands on a FLOAT (or vice-versa) — and anything unrecognised falls
 * back to ["ALL_SCOPES"], i.e. the previous behaviour.
 */
function scopesFor(
  collection: string,
  name: string,
  type: VariableResolvedDataType,
): VariableScope[] {
  const group = name.split("/")[0];

  if (type === "COLOR") {
    // Primitives are the raw palette and only exist to be aliased by the
    // semantic tokens. Empty scopes hide them from every picker so designers
    // reach for the semantic colours instead.
    if (collection === PRIMITIVES) return [];
    // Focus rings are drawn as effects (shadows/outlines) in Figma, not fills or
    // strokes, so the focus colours only surface in the effect-colour picker.
    if (name.toLowerCase().includes("focus")) return ["EFFECT_COLOR"];
    // Semantic colours, scoped by role (the first path segment).
    switch (group) {
      case "surface":
        return ["FRAME_FILL", "SHAPE_FILL"];
      case "text":
        return ["TEXT_FILL"];
      case "border":
        return ["STROKE_COLOR"];
      case "icon":
        // Icons render with either a fill (solid) or a stroke (line icons).
        return ["ALL_FILLS", "STROKE_COLOR"];
      case "interactive":
      case "status":
        // Buttons (fills), links (text) and focus rings (strokes) all draw here.
        // ALL_FILLS already covers text fills — Figma rejects it alongside other
        // fill scopes, so we don't add TEXT_FILL.
        return ["ALL_FILLS", "STROKE_COLOR"];
      default:
        return ["ALL_FILLS", "STROKE_COLOR"];
    }
  }

  if (type === "STRING") {
    if (group === "font") return ["FONT_FAMILY"];
    return ["ALL_SCOPES"];
  }

  if (type === "FLOAT") {
    // Scale collection — spacing / radius / component dimensions.
    if (group === "radius") return ["CORNER_RADIUS"];
    if (group === "spacing") return ["GAP", "WIDTH_HEIGHT"];
    if (group === "component") {
      const n = name.toLowerCase();
      if (n.includes("radius")) return ["CORNER_RADIUS"];
      if (n.includes("height") || n.includes("width") || n.includes("size")) return ["WIDTH_HEIGHT"];
      if (n.includes("horizontal") || n.includes("vertical") || n.includes("gap") || n.includes("padding"))
        return ["GAP"];
      return ["GAP", "WIDTH_HEIGHT", "CORNER_RADIUS"];
    }
    // Typography numeric tokens (weight / size / leading).
    if (group === "weight") return ["FONT_WEIGHT"];
    if (group === "size") return ["FONT_SIZE"];
    if (group === "leading") return ["LINE_HEIGHT"];
    // Icons collection — `<size>px/size` and `<size>px/stroke`.
    if (collection === ICONS) {
      if (name.endsWith("/stroke")) return ["STROKE_FLOAT"];
      if (name.endsWith("/size")) return ["WIDTH_HEIGHT"];
    }
  }

  return ["ALL_SCOPES"];
}

export interface CollectionReport {
  name: string;
  created: number;
  updated: number;
}

export interface ImportReport {
  collections: CollectionReport[];
  warnings: string[];
  variableCount: number;
}

export async function importTheme(theme: ThemeDoc): Promise<ImportReport> {
  const warnings: string[] = [];
  const report = new Map<string, CollectionReport>();

  // Index existing collections + variables once, up front.
  const collectionsByName = new Map<string, VariableCollection>();
  for (const c of await figma.variables.getLocalVariableCollectionsAsync()) {
    collectionsByName.set(c.name, c);
  }
  const varsByCollection = new Map<string, Map<string, Variable>>();
  for (const v of await figma.variables.getLocalVariablesAsync()) {
    let m = varsByCollection.get(v.variableCollectionId);
    if (!m) {
      m = new Map();
      varsByCollection.set(v.variableCollectionId, m);
    }
    m.set(v.name, v);
  }

  function ensureCollection(name: string): VariableCollection {
    let c = collectionsByName.get(name);
    if (!c) {
      c = figma.variables.createVariableCollection(name);
      collectionsByName.set(name, c);
      varsByCollection.set(c.id, new Map());
    }
    if (!report.has(name)) report.set(name, { name, created: 0, updated: 0 });
    return c;
  }

  function ensureMode(c: VariableCollection, name: string): string {
    const found = c.modes.find((m) => m.name === name);
    if (found) return found.modeId;
    // Claim the unnamed default mode for the first requested mode.
    const first = c.modes[0];
    if (c.modes.length === 1 && first && DEFAULT_MODE_RE.test(first.name)) {
      c.renameMode(first.modeId, name);
      return first.modeId;
    }
    try {
      return c.addMode(name);
    } catch {
      // Free/Starter files are limited to a single mode — degrade gracefully.
      warnings.push(
        `Couldn't add mode "${name}" to ${c.name} (this Figma plan limits modes); ` +
          `writing to "${first?.name ?? "default"}" instead.`,
      );
      return first?.modeId ?? c.defaultModeId;
    }
  }

  /** Reuse an existing same-named variable (update) or create a new one. */
  function ensureVariable(
    c: VariableCollection,
    name: string,
    type: VariableResolvedDataType,
  ): Variable | null {
    const m = varsByCollection.get(c.id)!;
    const existing = m.get(name);
    if (existing) {
      if (existing.resolvedType !== type) {
        warnings.push(
          `Skipped "${c.name} / ${name}": exists as ${existing.resolvedType}, expected ${type}.`,
        );
        return null;
      }
      existing.scopes = scopesFor(c.name, name, type);
      report.get(c.name)!.updated++;
      return existing;
    }
    const v = figma.variables.createVariable(name, c, type);
    v.scopes = scopesFor(c.name, name, type);
    m.set(name, v);
    report.get(c.name)!.created++;
    return v;
  }

  // ─── 1. Primitives ────────────────────────────────────────────────────────
  const primCol = ensureCollection(PRIMITIVES);
  const primMode = ensureMode(primCol, "Value");
  const primIndex = new Map<string, Variable>(); // "group.step" → Variable
  const primValue = new Map<string, RGBA>(); // "group.step" → resolved color (alias fallback)

  for (const [group, steps] of Object.entries(theme.primitive?.color ?? {})) {
    for (const [step, token] of Object.entries(steps)) {
      const rgba = parseColor(String(token.$value));
      if (!rgba) {
        warnings.push(`Bad primitive color ${group}.${step}: "${token.$value}".`);
        continue;
      }
      const v = ensureVariable(primCol, `${group}/${step}`, "COLOR");
      if (!v) continue;
      v.setValueForMode(primMode, rgba);
      primIndex.set(`${group}.${step}`, v);
      primValue.set(`${group}.${step}`, rgba);
    }
  }

  // ─── 2. Semantic (Light / Dark, aliasing Primitives) ────────────────────────
  const semCol = ensureCollection(SEMANTIC);
  const lightMode = ensureMode(semCol, "Light");
  const darkMode = ensureMode(semCol, "Dark");

  // Union the leaf tokens of both modes so each variable is created once.
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

  const setSemantic = (v: Variable, modeId: string, token: DtcgToken | undefined, path: string) => {
    if (!token) return;
    const raw = String(token.$value);
    const alias = ALIAS_RE.exec(raw);
    if (alias) {
      const refKey = `${alias[1]}.${alias[2]}`;
      const target = primIndex.get(refKey);
      // Official alias helper — a raw `{ type: "VARIABLE_ALIAS", id }` literal
      // isn't reliably honoured by setValueForMode.
      if (target) {
        v.setValueForMode(modeId, figma.variables.createVariableAlias(target));
        return;
      }
      // Never leave a semantic blank — fall back to the primitive's resolved color.
      const fallback = primValue.get(refKey);
      if (fallback) v.setValueForMode(modeId, fallback);
      else warnings.push(`Unresolved alias "${raw}" for ${path}.`);
      return;
    }
    const rgba = parseColor(raw);
    if (rgba) v.setValueForMode(modeId, rgba);
    else warnings.push(`Unparseable color "${raw}" for ${path}.`);
  };

  for (const [path, { light, dark }] of merged) {
    const v = ensureVariable(semCol, path, "COLOR");
    if (!v) continue;
    setSemantic(v, lightMode, light, path);
    setSemantic(v, darkMode, dark, path);
  }

  // ─── 3. Scale (spacing / radius / component dimensions) ──────────────────────
  const scaleCol = ensureCollection(SCALE);
  const scaleMode = ensureMode(scaleCol, "Value");
  const importDimensions = (node: Record<string, DtcgNode> | undefined, prefix: string) => {
    for (const { path, token } of flattenTokens(node)) {
      const num = toFloat(token.$value);
      if (num === null) {
        warnings.push(`Bad dimension ${prefix}${path}: "${token.$value}".`);
        continue;
      }
      const v = ensureVariable(scaleCol, `${prefix}${path}`, "FLOAT");
      if (v) v.setValueForMode(scaleMode, num);
    }
  };
  importDimensions(theme.spacing, "spacing/");
  importDimensions(theme["border-radius"], "radius/");
  importDimensions(theme.component, "component/");

  // ─── 4. Typography ──────────────────────────────────────────────────────────
  const typoCol = ensureCollection(TYPOGRAPHY);
  const typoMode = ensureMode(typoCol, "Value");

  // A FONT_FAMILY-scoped string variable makes Figma validate the family on
  // setValueForMode, which requires the font's styles to be loaded first. Fetch
  // the file's available fonts once, then load (or, if the family isn't
  // installed, relax the scope) before assigning each font value.
  const availableFonts = await figma.listAvailableFontsAsync();
  const setFontFamily = async (v: Variable, family: string, path: string) => {
    try {
      await Promise.all(
        availableFonts
          .filter((f) => f.fontName.family === family)
          .map((f) => figma.loadFontAsync(f.fontName)),
      );
      v.setValueForMode(typoMode, family);
      return;
    } catch {
      // Font isn't available in this file — fall through and relax the scope.
    }
    try {
      v.scopes = ["ALL_SCOPES"];
      v.setValueForMode(typoMode, family);
      warnings.push(
        `Font "${family}" isn't available in this file; imported ${path} without a font-family scope.`,
      );
    } catch {
      warnings.push(`Couldn't set font "${family}" for ${path}.`);
    }
  };

  for (const { path, token } of flattenTokens(theme.type)) {
    if (token.$type === "fontFamily") {
      const v = ensureVariable(typoCol, path, "STRING");
      if (v) await setFontFamily(v, String(token.$value), path);
      continue;
    }
    // fontWeight + dimensions (size/leading) are all numeric floats in Figma.
    const num = toFloat(token.$value);
    if (num === null) {
      warnings.push(`Bad typography value ${path}: "${token.$value}".`);
      continue;
    }
    const v = ensureVariable(typoCol, path, "FLOAT");
    if (v) v.setValueForMode(typoMode, num);
  }

  // ─── 5. Icons (Figma-only; dynamic stroke scaling) ──────────────────────────
  // Strokes scale with size in code, so the design system has no static stroke
  // tokens. Figma can't compute, so when adjustment is on we materialise the
  // size→stroke pairs here using the same algorithm the <Icon> component uses.
  const icons = theme.$extensions?.["com.ui-organized.theme-builder"]?.icons;
  if (icons && shouldAdjustStroke(!!icons.strokeAdjustment, icons.style ?? "outline")) {
    const baseSize = icons.baseSize ?? 24;
    const baseStroke = icons.baseStroke ?? 2;
    const iconCol = ensureCollection(ICONS);
    const iconMode = ensureMode(iconCol, "Value");
    for (const size of ICON_SIZES) {
      const sizeVar = ensureVariable(iconCol, `${size}px/size`, "FLOAT");
      if (sizeVar) sizeVar.setValueForMode(iconMode, size);
      const strokeVar = ensureVariable(iconCol, `${size}px/stroke`, "FLOAT");
      if (strokeVar) strokeVar.setValueForMode(iconMode, adjustStrokeWidth(size, baseStroke, baseSize));
    }
  }

  const collections = [...report.values()];
  return {
    collections,
    warnings,
    variableCount: collections.reduce((sum, c) => sum + c.created + c.updated, 0),
  };
}
