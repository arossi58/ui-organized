import type { ProjectDocument } from "@ui-organized/schema";
import {
  mergeSets,
  resolve,
  selectSetsForMode,
  type ResolvedColor,
  type ResolvedDimension,
  type ResolvedValue,
  type TokenResolution,
} from "@ui-organized/resolver";
import { applyOverrides } from "@ui-organized/token-io";

/**
 * Resolves a project document into CSS custom properties.
 *
 * The **resolver is authoritative** (per `11-export.md`): every value comes from
 * `@ui-organized/resolver`, so math/references/composites/color modifiers are
 * resolved exactly once, deterministically. Naming is `--<dot.path → dash>`
 * (e.g. `spacing.space-04` → `--spacing-space-04`).
 *
 * Per-mode semantics: a token whose resolved value is identical across all modes
 * is emitted once on `:root` (mode-constant, like primitive ramps); a token that
 * differs by mode is emitted per mode under `[data-theme="<mode>"]`.
 */

export interface ExportCssOptions {
  /** Theme to export. Defaults to the first theme. */
  themeName?: string;
}

export function exportCss(doc: ProjectDocument, options: ExportCssOptions = {}): string {
  const themeName = options.themeName ?? doc.themes[0]?.name;
  const theme = doc.themes.find((t) => t.name === themeName);
  const modes = Object.keys(doc.modes).length > 0 ? Object.keys(doc.modes) : ["default"];
  const overrides = doc.overrides ?? {};

  const byMode = new Map<string, Map<string, TokenResolution>>();
  for (const mode of modes) {
    const active = (theme ? selectSetsForMode(doc, theme, mode) : doc.sets).map((set) => ({
      ...set,
      tokens: applyOverrides(set.tokens, overrides),
    }));
    byMode.set(mode, resolve(mergeSets(active), { mode }).tokens);
  }

  const allPaths = new Set<string>();
  for (const map of byMode.values()) for (const path of map.keys()) allPaths.add(path);

  const root: string[] = [];
  const perMode = new Map<string, string[]>(modes.map((m) => [m, []]));

  for (const path of [...allPaths].sort()) {
    const cssName = "--" + path.replace(/\./g, "-");
    const values = modes.map((mode) => {
      const resolution = byMode.get(mode)?.get(path);
      return resolution ? cssValue(resolution) : undefined;
    });
    const present = values.filter((v): v is string => v !== undefined);
    if (present.length === 0) continue;

    const constant = present.length === modes.length && present.every((v) => v === present[0]);
    if (constant) {
      root.push(`  ${cssName}: ${present[0]};`);
    } else {
      modes.forEach((mode, i) => {
        const v = values[i];
        if (v !== undefined) perMode.get(mode)!.push(`  ${cssName}: ${v};`);
      });
    }
  }

  let css = `:root {\n${root.join("\n")}\n}\n`;
  for (const mode of modes) {
    const decls = perMode.get(mode)!;
    if (decls.length > 0) css += `\n[data-theme="${mode}"] {\n${decls.join("\n")}\n}\n`;
  }
  return css;
}

/** Renders one resolved token as a CSS value, or `undefined` if not expressible. */
export function cssValue(resolution: TokenResolution): string | undefined {
  const raw = resolution.raw;
  switch (resolution.$type) {
    case "color":
      return isColor(raw) ? raw.hex : undefined;
    case "dimension":
    case "duration":
      return isDimension(raw) ? `${raw.value}${raw.unit}` : undefined;
    case "number":
      return typeof raw === "number" ? String(raw) : undefined;
    case "fontWeight":
      return typeof raw === "number" ? String(raw) : undefined;
    case "fontFamily":
      if (Array.isArray(raw)) return raw.map((v) => quoteFont(String(v))).join(", ");
      return typeof raw === "string" ? quoteFont(raw) : undefined;
    case "shadow":
      return shadowCss(raw);
    default:
      // typography/border/transition/gradient/cubicBezier/strokeStyle are not
      // single CSS custom properties; consumers read them via resolved tokens.
      return undefined;
  }
}

function isColor(raw: ResolvedValue): raw is ResolvedColor {
  return raw !== null && typeof raw === "object" && "hex" in raw && "oklch" in raw;
}

function isDimension(raw: ResolvedValue): raw is ResolvedDimension {
  return raw !== null && typeof raw === "object" && "value" in raw && "unit" in raw;
}

function quoteFont(family: string): string {
  return /\s/.test(family) ? `"${family}"` : family;
}

function shadowCss(raw: ResolvedValue): string | undefined {
  const layers = Array.isArray(raw) ? raw : [raw];
  const dim = (d: unknown): string => (isDimension(d as ResolvedValue) ? `${(d as ResolvedDimension).value}${(d as ResolvedDimension).unit}` : "0");
  const parts: string[] = [];
  for (const layer of layers) {
    if (layer === null || typeof layer !== "object" || Array.isArray(layer)) continue;
    const o = layer as Record<string, ResolvedValue>;
    const color = isColor(o.color as ResolvedValue) ? (o.color as ResolvedColor).hex : "#000000";
    const inset = o.inset ? "inset " : "";
    parts.push(`${inset}${dim(o.offsetX)} ${dim(o.offsetY)} ${dim(o.blur)} ${dim(o.spread)} ${color}`.trim());
  }
  return parts.length > 0 ? parts.join(", ") : undefined;
}
