import { create } from "zustand";
import {
  generateColorRamp,
  parseToOklch,
  getCoreFamily,
  calculateTypeScale,
  generateSpacingScale,
  type ColorRamp,
} from "@ui-organized/utils";
import {
  typeSizeTokens,
  typeLeadingTokens,
  typeFontTokens,
  typeWeightTokens,
} from "@ui-organized/tokens";
import { pickAccessibleShade } from "../utils/accessibleShades";

/**
 * Starting line-height multiplier for the slider once the user switches the
 * line height off the design-system default and into a uniform custom value.
 * The default state itself uses the per-step canonical leadings (see
 * `typeLeadingTokens`), which a single multiplier can't reproduce.
 */
export const DEFAULT_LINE_HEIGHT = 1.5;

// ─── Default values ───────────────────────────────────────────────────────────
// Typography defaults are sourced from `@ui-organized/tokens` (the canonical
// DTCG token JSON the design system ships), so the builder opens 1:1 with the
// shipped type scale and auto-syncs when those tokens change. The parametric
// base/ratio/line-height controls only take effect once the user edits them,
// flipping that aspect from "system" to "custom".

const DEFAULT_BRAND_FAMILY = "mars";
const DEFAULT_BRAND_HEX    = "#bc4900"; // mars.1400
const DEFAULT_NEUTRAL      = "grey";
const DEFAULT_HEADING_FAMILY = typeFontTokens.heading;
const DEFAULT_BODY_FAMILY = typeFontTokens.body;
/** Sample strings the typography specs preview shows when the user hasn't typed their own. */
export const DEFAULT_HEADING_PREVIEW = "Almost before we knew it, we had left the ground";
export const DEFAULT_BODY_PREVIEW = "The quick brown fox jumps over the lazy dog";
/** Base/ratio the size slider jumps to when the user first customizes the scale. */
const DEFAULT_TYPE_BASE = 16;
const DEFAULT_TYPE_RATIO = 1.25;
const DEFAULT_SPACING_BASE = 4;
const DEFAULT_RADIUS_BASE = 4;

const DEFAULT_HEADING_WEIGHTS = { ...typeWeightTokens.heading };
const DEFAULT_BODY_WEIGHTS = { ...typeWeightTokens.body };

/** Display + heading steps follow the heading line height; body + caption the body one. */
function isHeadingStep(stepName: string): boolean {
  return stepName.startsWith("display") || stepName.startsWith("heading");
}

/**
 * Resolve per-step line-heights (px) for the current mode.
 * - "system": the canonical per-step leadings shipped by the design system.
 * - "custom": each size scaled by its role's uniform multiplier.
 */
export function resolveLeadings(
  sizes: Record<string, number>,
  mode: "system" | "custom",
  headingMultiplier: number,
  bodyMultiplier: number,
): Record<string, number> {
  if (mode === "system") return { ...typeLeadingTokens };
  const out: Record<string, number> = {};
  for (const [step, px] of Object.entries(sizes)) {
    const mult = isHeadingStep(step) ? headingMultiplier : bodyMultiplier;
    out[step] = Math.round(px * mult * 100) / 100;
  }
  return out;
}

// ─── Radius scale ─────────────────────────────────────────────────────────────

/**
 * Fixed multipliers for the radius scale relative to the base unit.
 * At base=4: 2, 4, 6, 8, 12, 16, 20, 24, 28, 32, 40, 48 — matches the
 * canonical token values from the design library.
 */
export const RADIUS_MULTIPLIERS: Record<string, number> = {
  "radius-01": 0.5,
  "radius-02": 1,
  "radius-03": 1.5,
  "radius-04": 2,
  "radius-05": 3,
  "radius-06": 4,
  "radius-07": 5,
  "radius-08": 6,
  "radius-09": 7,
  "radius-10": 8,
  "radius-11": 10,
  "radius-12": 12,
};

export function generateRadiusScale(base: number): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [key, mult] of Object.entries(RADIUS_MULTIPLIERS)) {
    result[key] = Math.round(base * mult);
  }
  result["radius-full"] = 99999;
  return result;
}

export type IconLibrary = "lucide" | "tabler" | "heroicons";
export type IconStyle   = "outline" | "solid";

export interface IconsConfig {
  library: IconLibrary;
  style: IconStyle;
  strokeAdjustment: boolean;
  /** Reference size in px — stroke is unchanged at this size. Default 24. */
  baseSize: number;
  /** Stroke width at the reference size. Default 2 (Lucide/Tabler native). */
  baseStroke: number;
}

export type ActivePanel = "color" | "typography" | "sizing" | "icons" | "examples" | "export";

/** Real-world layout shown in the Examples tab. */
export type ExampleId = "dashboard" | "form" | "ecommerce" | "marketing";

// ─── State shape ──────────────────────────────────────────────────────────────

export interface BuilderState {
  // Color
  /** "family" = brand is a named core family; "custom" = generated from brandHex. */
  brandMode: "family" | "custom";
  /** Selected core family name when brandMode === "family". */
  brandFamily: string;
  brandHex: string;
  brandRamp: ColorRamp;
  /** Which step of the brand ramp is the primary interactive color. Default "1400". */
  brandShade: string;
  /** Selected neutral (tinted-grey) core family name. */
  neutralFamily: string;
  neutralRamp: ColorRamp;

  // Typography
  headingFamily: string;
  headingWeights: Record<string, number>;
  bodyFamily: string;
  bodyWeights: Record<string, number>;
  typeScaleBase: number;
  typeScaleRatio: number;
  typeScaleSteps: Record<string, number>;
  /** "system" = canonical design-system sizes; "custom" = generated from base/ratio. */
  typeScaleMode: "system" | "custom";
  /** Line-height multiplier for display + heading steps (used in custom mode). */
  headingLineHeight: number;
  /** Line-height multiplier for body + caption steps (used in custom mode). */
  bodyLineHeight: number;
  /** "system" = canonical per-step leadings; "custom" = uniform multipliers. */
  lineHeightMode: "system" | "custom";
  /** Resolved per-step line-heights (px) — the single source the preview/export read. */
  leadingSteps: Record<string, number>;
  /** Custom sample text for the heading rows of the typography specs preview. */
  headingPreviewText: string;
  /** Custom sample text for the body/caption rows of the typography specs preview. */
  bodyPreviewText: string;

  // Border radius
  radiusBase: number;
  borderRadius: Record<string, number>;

  // Spacing
  spacingBaseUnit: number;
  spacingScale: Record<string, number>;

  // Icons
  icons: IconsConfig;

  // UI state
  activePanel: ActivePanel;
  themeName: string;
  previewMode: "light" | "dark";
  /** Typography preview: draw top/bottom guides on each line's line-height box. */
  lineHeightGuides: boolean;
  /** Which real-world layout the Examples tab shows. */
  activeExample: ExampleId;

  // Actions
  setBrandFamily: (name: string) => void;
  setBrandColor: (hex: string) => void;
  setBrandShade: (shade: string) => void;
  setNeutralFamily: (name: string) => void;
  setHeadingFont: (family: string, weights: Record<string, number>) => void;
  setBodyFont: (family: string, weights: Record<string, number>) => void;
  setTypeScale: (base: number, ratio: number) => void;
  setHeadingLineHeight: (scale: number) => void;
  setBodyLineHeight: (scale: number) => void;
  setHeadingPreviewText: (text: string) => void;
  setBodyPreviewText: (text: string) => void;
  /** Restore the canonical design-system sizes (mode → "system"). */
  resetTypeScale: () => void;
  /** Restore the canonical design-system line-heights (mode → "system"). */
  resetLineHeight: () => void;
  setRadiusBase: (base: number) => void;
  setSpacingBase: (base: number) => void;
  setIcons: (config: Partial<IconsConfig>) => void;
  setActivePanel: (panel: ActivePanel) => void;
  setThemeName: (name: string) => void;
  setPreviewMode: (mode: "light" | "dark") => void;
  setLineHeightGuides: (on: boolean) => void;
  setActiveExample: (id: ExampleId) => void;
  /** Reconstruct the full editor state from an exported theme.json (round-trip import). */
  loadFromThemeJson: (theme: unknown) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useBuilderStore = create<BuilderState>((set) => ({
  // Color
  brandMode: "family",
  brandFamily: DEFAULT_BRAND_FAMILY,
  brandHex: DEFAULT_BRAND_HEX,
  brandRamp: getCoreFamily(DEFAULT_BRAND_FAMILY),
  brandShade: "1400",
  neutralFamily: DEFAULT_NEUTRAL,
  neutralRamp: getCoreFamily(DEFAULT_NEUTRAL),

  // Typography — defaults mirror the shipped design-system tokens 1:1.
  headingFamily: DEFAULT_HEADING_FAMILY,
  headingWeights: { ...DEFAULT_HEADING_WEIGHTS },
  bodyFamily: DEFAULT_BODY_FAMILY,
  bodyWeights: { ...DEFAULT_BODY_WEIGHTS },
  typeScaleBase: DEFAULT_TYPE_BASE,
  typeScaleRatio: DEFAULT_TYPE_RATIO,
  typeScaleSteps: { ...typeSizeTokens },
  typeScaleMode: "system",
  headingLineHeight: DEFAULT_LINE_HEIGHT,
  bodyLineHeight: DEFAULT_LINE_HEIGHT,
  lineHeightMode: "system",
  leadingSteps: { ...typeLeadingTokens },
  headingPreviewText: DEFAULT_HEADING_PREVIEW,
  bodyPreviewText: DEFAULT_BODY_PREVIEW,

  // Border radius
  radiusBase: DEFAULT_RADIUS_BASE,
  borderRadius: generateRadiusScale(DEFAULT_RADIUS_BASE),

  // Spacing
  spacingBaseUnit: DEFAULT_SPACING_BASE,
  spacingScale: generateSpacingScale(DEFAULT_SPACING_BASE),

  // Icons
  icons: { library: "lucide", style: "outline", strokeAdjustment: false, baseSize: 24, baseStroke: 2 },

  // UI state
  activePanel: "color",
  themeName: "My Theme",
  previewMode: "light" as "light" | "dark", // matches the site's default theme (light)
  lineHeightGuides: true,
  activeExample: "dashboard" as ExampleId,

  // Actions
  setBrandFamily: (name: string) =>
    set((state) => {
      const ramp = getCoreFamily(name);
      return {
        brandMode: "family",
        brandFamily: name,
        brandRamp: ramp,
        brandHex: ramp["1400"]?.hex ?? DEFAULT_BRAND_HEX,
        // Keep the chosen primary accessible for the new ramp (snap if it isn't).
        brandShade: pickAccessibleShade(ramp, state.brandShade),
      };
    }),

  setBrandColor: (hex: string) =>
    set((state) => {
      const ramp = generateColorRamp(hex);
      return {
        brandMode: "custom",
        brandHex: hex,
        brandRamp: ramp,
        // A custom hue may push the current shade out of the accessible band —
        // snap to the nearest shade that still reads with white button text.
        brandShade: pickAccessibleShade(ramp, state.brandShade),
      };
    }),

  setBrandShade: (shade: string) => set(() => ({ brandShade: shade })),

  setNeutralFamily: (name: string) =>
    set(() => ({
      neutralFamily: name,
      neutralRamp: getCoreFamily(name),
    })),

  setHeadingFont: (family, weights) =>
    set(() => ({ headingFamily: family, headingWeights: weights })),

  setBodyFont: (family, weights) =>
    set(() => ({ bodyFamily: family, bodyWeights: weights })),

  setTypeScale: (base, ratio) =>
    set((state) => {
      const sizes = calculateTypeScale(base, ratio);
      return {
        typeScaleBase: base,
        typeScaleRatio: ratio,
        typeScaleMode: "custom",
        typeScaleSteps: sizes,
        // System leadings are fixed px (independent of size); custom leadings
        // track the new sizes via the active multipliers.
        leadingSteps: resolveLeadings(sizes, state.lineHeightMode, state.headingLineHeight, state.bodyLineHeight),
      };
    }),

  setHeadingLineHeight: (scale) =>
    set((state) => ({
      headingLineHeight: scale,
      lineHeightMode: "custom",
      leadingSteps: resolveLeadings(state.typeScaleSteps, "custom", scale, state.bodyLineHeight),
    })),

  setBodyLineHeight: (scale) =>
    set((state) => ({
      bodyLineHeight: scale,
      lineHeightMode: "custom",
      leadingSteps: resolveLeadings(state.typeScaleSteps, "custom", state.headingLineHeight, scale),
    })),

  setHeadingPreviewText: (text) => set(() => ({ headingPreviewText: text })),
  setBodyPreviewText: (text) => set(() => ({ bodyPreviewText: text })),

  resetTypeScale: () =>
    set((state) => {
      const sizes = { ...typeSizeTokens };
      return {
        typeScaleMode: "system",
        typeScaleBase: DEFAULT_TYPE_BASE,
        typeScaleRatio: DEFAULT_TYPE_RATIO,
        typeScaleSteps: sizes,
        leadingSteps: resolveLeadings(sizes, state.lineHeightMode, state.headingLineHeight, state.bodyLineHeight),
      };
    }),

  resetLineHeight: () =>
    set((state) => ({
      lineHeightMode: "system",
      headingLineHeight: DEFAULT_LINE_HEIGHT,
      bodyLineHeight: DEFAULT_LINE_HEIGHT,
      leadingSteps: resolveLeadings(state.typeScaleSteps, "system", DEFAULT_LINE_HEIGHT, DEFAULT_LINE_HEIGHT),
    })),

  setRadiusBase: (base) =>
    set(() => ({
      radiusBase: base,
      borderRadius: generateRadiusScale(base),
    })),

  setSpacingBase: (base) =>
    set(() => ({
      spacingBaseUnit: base,
      spacingScale: generateSpacingScale(base),
    })),

  setIcons: (config) =>
    set((state) => ({ icons: { ...state.icons, ...config } })),

  setActivePanel: (panel) => set(() => ({ activePanel: panel })),

  setThemeName: (name) => set(() => ({ themeName: name })),

  setPreviewMode: (mode) => set(() => ({ previewMode: mode })),

  setLineHeightGuides: (on) => set(() => ({ lineHeightGuides: on })),

  setActiveExample: (id) => set(() => ({ activeExample: id })),

  loadFromThemeJson: (theme) => set((state) => buildStateFromTheme(theme, state)),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse a dimension value (`"16px"` or a number) to a number, with a fallback. */
function pxToNum(value: unknown, fallback: number): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

/**
 * Read a DTCG dimension tree (`{ step: { $value: "20px" } }`) into `{ step: px }`,
 * keyed by the canonical step set. Missing steps fall back to `fallback[step]`.
 */
function readPxTree(
  tree: unknown,
  fallback: Record<string, number>,
): Record<string, number> {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const t = (tree ?? {}) as any;
  const out: Record<string, number> = {};
  for (const step of Object.keys(fallback)) {
    out[step] = pxToNum(t[step]?.$value, fallback[step]);
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return out;
}

/** Deep value-equality over the canonical step keys of `b`. */
function stepsEqual(a: Record<string, number>, b: Record<string, number>): boolean {
  return Object.keys(b).every((k) => a[k] === b[k]);
}

/**
 * Reconstruct the full builder state from an exported `theme.json` (the reverse
 * of `buildThemeTokens`). Parametric inputs (brand mode/family, type-scale
 * base/ratio, line-height, radius/spacing base, icons) come from
 * `$extensions["com.ui-organized.theme-builder"]`; fonts and weights come from
 * the `type` token tree; resolved scales are regenerated with the same
 * algorithms the editor uses. Anything missing falls back to the current state,
 * so a hand-built Figma theme (no metadata) still imports best-effort.
 */
function buildStateFromTheme(theme: unknown, state: BuilderState): Partial<BuilderState> {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const t = (theme ?? {}) as any;
  const ext = t.$extensions?.["com.ui-organized.theme-builder"] ?? {};

  // Brand — family preset or custom hex.
  let brand: Partial<BuilderState> = {};
  if (ext.brand?.mode === "custom" && typeof ext.brand.hex === "string") {
    brand = { brandMode: "custom", brandHex: ext.brand.hex, brandRamp: generateColorRamp(ext.brand.hex) };
  } else if (typeof ext.brand?.family === "string") {
    const ramp = getCoreFamily(ext.brand.family);
    brand = {
      brandMode: "family",
      brandFamily: ext.brand.family,
      brandRamp: ramp,
      brandHex: ramp["1400"]?.hex ?? state.brandHex,
    };
  }
  // Clamp the imported primary to the accessible band for the resolved ramp.
  const brandRamp = brand.brandRamp ?? state.brandRamp;
  const brandShade: string = pickAccessibleShade(brandRamp, ext.brand?.primaryShade ?? state.brandShade);

  // Neutral preset.
  const neutralFamily: string = ext.neutral?.family ?? state.neutralFamily;
  const neutralRamp = getCoreFamily(neutralFamily);

  // Type scale. Prefer the resolved `type.size` tree (authoritative, and present
  // even for hand-built Figma themes); fall back to the canonical tokens. The
  // base/ratio are slider positions for custom mode. Mode comes from metadata,
  // else is inferred from whether the sizes still match the design system.
  const typeScaleBase: number = ext.typeScale?.base ?? state.typeScaleBase;
  const typeScaleRatio: number = ext.typeScale?.ratio ?? state.typeScaleRatio;
  const typeScaleSteps = readPxTree(t.type?.size, typeSizeTokens);
  const typeScaleMode: "system" | "custom" =
    ext.typeScale?.mode === "custom" || ext.typeScale?.mode === "system"
      ? ext.typeScale.mode
      : stepsEqual(typeScaleSteps, typeSizeTokens)
        ? "system"
        : "custom";

  // Fonts + weights from the token tree.
  const weight = t.type?.weight ?? {};
  const wv = (key: string, fb: number): number =>
    typeof weight[key]?.$value === "number" ? weight[key].$value : fb;
  const headingFamily: string = t.type?.font?.heading?.$value ?? state.headingFamily;
  const bodyFamily: string = t.type?.font?.body?.$value ?? state.bodyFamily;
  const headingWeights = {
    default: wv("heading-default", state.headingWeights.default ?? 400),
    emphasis: wv("heading-emphasis", state.headingWeights.emphasis ?? 500),
    strong: wv("heading-strong", state.headingWeights.strong ?? 600),
    heavy: wv("heading-heavy", state.headingWeights.heavy ?? 700),
  };
  const bodyWeights = {
    default: wv("body-default", state.bodyWeights.default ?? 400),
    emphasis: wv("body-emphasis", state.bodyWeights.emphasis ?? 500),
    strong: wv("body-strong", state.bodyWeights.strong ?? 600),
    heavy: wv("body-heavy", state.bodyWeights.heavy ?? 700),
  };

  // Line-heights. Read the resolved `type.leading` tree (authoritative), with
  // the multipliers kept as slider positions for custom mode. Mode from metadata,
  // else inferred from whether the leadings still match the design system.
  const headingLineHeight: number = ext.lineHeight?.heading ?? state.headingLineHeight;
  const bodyLineHeight: number = ext.lineHeight?.body ?? state.bodyLineHeight;
  const leadingSteps = readPxTree(t.type?.leading, typeLeadingTokens);
  const lineHeightMode: "system" | "custom" =
    ext.lineHeight?.mode === "custom" || ext.lineHeight?.mode === "system"
      ? ext.lineHeight.mode
      : stepsEqual(leadingSteps, typeLeadingTokens)
        ? "system"
        : "custom";

  // Radius / spacing base — prefer metadata, else recover the ×1 step from the tree.
  const radiusBase: number = ext.radius?.base ?? pxToNum(t["border-radius"]?.["02"]?.$value, state.radiusBase);
  const spacingBaseUnit: number = ext.spacing?.baseUnit ?? pxToNum(t.spacing?.["space-01"]?.$value, state.spacingBaseUnit);

  // Icons (drop the export-only `package` field).
  const ic = ext.icons ?? {};
  const icons: IconsConfig = {
    library: ic.library ?? state.icons.library,
    style: ic.style ?? state.icons.style,
    strokeAdjustment: typeof ic.strokeAdjustment === "boolean" ? ic.strokeAdjustment : state.icons.strokeAdjustment,
    baseSize: ic.baseSize ?? state.icons.baseSize,
    baseStroke: ic.baseStroke ?? state.icons.baseStroke,
  };

  const themeName: string = ext.themeName ?? state.themeName;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return {
    ...brand,
    brandShade,
    neutralFamily,
    neutralRamp,
    typeScaleBase,
    typeScaleRatio,
    typeScaleSteps,
    typeScaleMode,
    headingFamily,
    bodyFamily,
    headingWeights,
    bodyWeights,
    headingLineHeight,
    bodyLineHeight,
    lineHeightMode,
    leadingSteps,
    radiusBase,
    borderRadius: generateRadiusScale(radiusBase),
    spacingBaseUnit,
    spacingScale: generateSpacingScale(spacingBaseUnit),
    icons,
    themeName,
  };
}

/** Convert a hex color to an oklch() CSS string via @ui-organized/utils */
export function hexToOklchString(hex: string): string {
  try {
    const { l, c, h } = parseToOklch(hex);
    return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
  } catch {
    return "oklch(0 0 0)";
  }
}
