/**
 * Reverse of importTheme: read the local variable collections back into a DTCG
 * `theme.json` matching the theme builder's format, so a designer can edit
 * variables in Figma and pull the result into the builder or code.
 *
 * Reconstructs:
 *   Primitives  → primitive.color.<group>.<step>   (resolved hex)
 *   Semantic    → color.light / color.dark          (aliases → {primitive.color…}, else raw)
 *   Scale       → spacing / border-radius / component (dimensions)
 *   Typography  → type.font / weight / size / leading
 *
 * Parametric metadata the variables can't express ($extensions: brand family,
 * type-scale ratio, line-height, icons, …) is read from the document plugin data
 * that importTheme stashed; absent that, a minimal best-effort block is emitted.
 */

import { rgbaToCss } from "./color";
import type { InventoryRow, PlanCell } from "./plan";

const PRIMITIVES = "Primitives";
const SEMANTIC = "Semantic";
const SCALE = "Scale";
const TYPOGRAPHY = "Typography";

/** Document plugin-data key holding the original `{ $description, $extensions }`. */
export const META_KEY = "themeMeta";

export interface ExportResult {
  /** Pretty-printed theme.json. */
  json: string;
  warnings: string[];
  /** Every variable read, with its resolved value(s) — drives the export table. */
  inventory: InventoryRow[];
}

interface DtcgToken {
  $type: string;
  $value: string | number;
}

function isAlias(v: VariableValue): v is VariableAlias {
  return typeof v === "object" && v !== null && (v as { type?: string }).type === "VARIABLE_ALIAS";
}
function isRgba(v: VariableValue): v is RGBA {
  return typeof v === "object" && v !== null && "r" in v && "g" in v && "b" in v;
}

/** Assign `token` at a slash-delimited path inside a nested DTCG group. */
function setPath(root: Record<string, unknown>, parts: string[], token: DtcgToken): void {
  let node = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!;
    node[key] = (node[key] as Record<string, unknown>) ?? {};
    node = node[key] as Record<string, unknown>;
  }
  node[parts[parts.length - 1]!] = token;
}

export async function exportTheme(): Promise<ExportResult> {
  const warnings: string[] = [];
  const inventory: InventoryRow[] = [];

  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const byName = new Map(collections.map((c) => [c.name, c]));
  const allVars = await figma.variables.getLocalVariablesAsync();
  const byId = new Map(allVars.map((v) => [v.id, v]));
  const inCollection = (id: string | undefined) =>
    id ? allVars.filter((v) => v.variableCollectionId === id) : [];

  const firstMode = (name: string): string | undefined => byName.get(name)?.defaultModeId;

  // ─── Primitives → primitive.color (+ alias lookup) ──────────────────────────
  const primColor: Record<string, Record<string, DtcgToken>> = {};
  const primRef = new Map<string, string>(); // varId → "group.step"
  const primCol = byName.get(PRIMITIVES);
  if (!primCol) warnings.push(`No "${PRIMITIVES}" collection found.`);
  const primMode = primCol?.defaultModeId;
  for (const v of inCollection(primCol?.id)) {
    const [group, step] = v.name.split("/");
    if (!group || !step) continue;
    primRef.set(v.id, `${group}.${step}`);
    const val = primMode ? v.valuesByMode[primMode] : undefined;
    if (val !== undefined && isRgba(val)) {
      const css = rgbaToCss(val);
      (primColor[group] ??= {})[step] = { $type: "color", $value: css };
      inventory.push({
        collection: PRIMITIVES,
        name: v.name,
        kind: "color",
        cells: [{ mode: "Value", display: css, color: css }],
      });
    }
  }
  // Stable order: groups alphabetical, steps numeric (matches the builder).
  const primitiveColor: Record<string, Record<string, DtcgToken>> = {};
  for (const group of Object.keys(primColor).sort()) {
    const steps = primColor[group]!;
    const ordered: Record<string, DtcgToken> = {};
    for (const step of Object.keys(steps).sort((a, b) => Number(a) - Number(b))) ordered[step] = steps[step]!;
    primitiveColor[group] = ordered;
  }

  // ─── Semantic → color.light / color.dark ────────────────────────────────────
  const colorModes: Record<"light" | "dark", Record<string, unknown>> = { light: {}, dark: {} };
  const semCol = byName.get(SEMANTIC);
  if (!semCol) warnings.push(`No "${SEMANTIC}" collection found.`);
  const modeId = (label: string) => semCol?.modes.find((m) => m.name.toLowerCase() === label)?.modeId;
  const semModes: Array<["light" | "dark", string | undefined]> = [
    ["light", modeId("light")],
    ["dark", modeId("dark")],
  ];
  for (const v of inCollection(semCol?.id)) {
    const parts = v.name.split("/");
    const cells: PlanCell[] = [];
    for (const [key, mid] of semModes) {
      if (!mid) continue;
      const val = v.valuesByMode[mid];
      if (val === undefined) continue;
      let $value: string | undefined;
      let swatch: string | undefined;
      let tokenName: string | undefined;
      if (isAlias(val)) {
        const ref = primRef.get(val.id);
        if (ref) {
          $value = `{primitive.color.${ref}}`;
          const [group, step] = ref.split(".");
          swatch = primColor[group!]?.[step!]?.$value as string | undefined;
          tokenName = `${group}/${step}`;
        } else warnings.push(`${v.name} (${key}) aliases a non-primitive variable; skipped.`);
      } else if (isRgba(val)) {
        $value = rgbaToCss(val);
        swatch = $value;
      }
      if ($value !== undefined) {
        setPath(colorModes[key], parts, { $type: "color", $value });
        cells.push({
          mode: key === "light" ? "Light" : "Dark",
          display: tokenName ?? swatch ?? $value,
          color: swatch,
          token: tokenName,
        });
      }
    }
    if (cells.length > 0) inventory.push({ collection: SEMANTIC, name: v.name, kind: "color", cells });
  }

  // ─── Scale → spacing / border-radius / component ────────────────────────────
  const spacing: Record<string, DtcgToken> = {};
  const borderRadius: Record<string, DtcgToken> = {};
  const component: Record<string, unknown> = {};
  const scaleMode = firstMode(SCALE);
  for (const v of inCollection(byName.get(SCALE)?.id)) {
    const val = scaleMode ? v.valuesByMode[scaleMode] : undefined;
    if (typeof val !== "number") continue;
    const token: DtcgToken = { $type: "dimension", $value: `${val}px` };
    let matched = true;
    if (v.name.startsWith("spacing/")) spacing[v.name.slice("spacing/".length)] = token;
    else if (v.name.startsWith("radius/")) borderRadius[v.name.slice("radius/".length)] = token;
    else if (v.name.startsWith("component/")) setPath(component, v.name.slice("component/".length).split("/"), token);
    else matched = false;
    if (matched) inventory.push({ collection: SCALE, name: v.name, kind: "number", cells: [{ mode: "Value", display: `${val}px` }] });
  }

  // ─── Typography → type.{font,weight,size,leading} ───────────────────────────
  const type: Record<string, unknown> = {};
  const typoMode = firstMode(TYPOGRAPHY);
  for (const v of inCollection(byName.get(TYPOGRAPHY)?.id)) {
    const val = typoMode ? v.valuesByMode[typoMode] : undefined;
    if (val === undefined) continue;
    const parts = v.name.split("/");
    const kind = parts[0];
    let token: DtcgToken | undefined;
    if (kind === "font" && typeof val === "string") token = { $type: "fontFamily", $value: val };
    else if (kind === "weight" && typeof val === "number") token = { $type: "fontWeight", $value: val };
    else if ((kind === "size" || kind === "leading") && typeof val === "number")
      token = { $type: "dimension", $value: `${val}px` };
    if (token) {
      setPath(type, parts, token);
      inventory.push({
        collection: TYPOGRAPHY,
        name: v.name,
        kind: kind === "font" ? "string" : "number",
        cells: [{ mode: "Value", display: String(token.$value) }],
      });
    }
  }

  // ─── Metadata ($extensions) — stashed on import, else best-effort ───────────
  let meta: { $description?: string; $extensions?: unknown } | null = null;
  try {
    const raw = figma.root.getPluginData(META_KEY);
    if (raw) meta = JSON.parse(raw);
  } catch {
    /* ignore malformed stash */
  }
  let $description: string;
  let $extensions: unknown;
  if (meta?.$extensions) {
    $description = meta.$description ?? "Exported from Figma via UI Organized - Theme Import";
    $extensions = meta.$extensions;
  } else {
    warnings.push(
      "No builder metadata stored in this file — exported with default $extensions. " +
        "The theme builder will fall back to defaults for brand family, type-scale ratio and icons.",
    );
    $description = "Exported from Figma via UI Organized - Theme Import";
    $extensions = { "com.ui-organized.theme-builder": { themeName: "Figma Theme" } };
  }

  // Assemble in the builder's key order.
  const theme: Record<string, unknown> = {
    $description,
    $extensions,
    primitive: { color: primitiveColor },
    color: colorModes,
    type,
    spacing,
    "border-radius": borderRadius,
    component,
  };

  return { json: JSON.stringify(theme, null, 2) + "\n", warnings, inventory };
}
