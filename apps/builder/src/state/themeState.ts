import { create } from "zustand";
import {
  generateColorRamp,
  parseToOklch,
  getCoreFamily,
  calculateTypeScale,
  generateSpacingScale,
  type ColorRamp,
} from "@ds/utils";

export const DEFAULT_LINE_HEIGHT_SCALE = 1.0;

// ─── Default values ───────────────────────────────────────────────────────────

const DEFAULT_BRAND_FAMILY = "mars";
const DEFAULT_BRAND_HEX    = "#bc4900"; // mars.1400
const DEFAULT_NEUTRAL      = "grey";
const DEFAULT_HEADING_FAMILY = "Roboto";
const DEFAULT_BODY_FAMILY = "Roboto";
const DEFAULT_TYPE_BASE = 16;
const DEFAULT_TYPE_RATIO = 1.25;
const DEFAULT_SPACING_BASE = 4;
const DEFAULT_RADIUS_BASE = 4;

const DEFAULT_WEIGHTS = { default: 400, emphasis: 500, strong: 600, heavy: 700 };

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

export type ActivePanel = "color" | "typography" | "radius" | "spacing" | "icons" | "export";

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
  lineHeightScale: number;

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

  // Actions
  setBrandFamily: (name: string) => void;
  setBrandColor: (hex: string) => void;
  setBrandShade: (shade: string) => void;
  setNeutralFamily: (name: string) => void;
  setHeadingFont: (family: string, weights: Record<string, number>) => void;
  setBodyFont: (family: string, weights: Record<string, number>) => void;
  setTypeScale: (base: number, ratio: number) => void;
  setLineHeightScale: (scale: number) => void;
  setRadiusBase: (base: number) => void;
  setSpacingBase: (base: number) => void;
  setIcons: (config: Partial<IconsConfig>) => void;
  setActivePanel: (panel: ActivePanel) => void;
  setThemeName: (name: string) => void;
  setPreviewMode: (mode: "light" | "dark") => void;
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

  // Typography
  headingFamily: DEFAULT_HEADING_FAMILY,
  headingWeights: { ...DEFAULT_WEIGHTS },
  bodyFamily: DEFAULT_BODY_FAMILY,
  bodyWeights: { ...DEFAULT_WEIGHTS },
  typeScaleBase: DEFAULT_TYPE_BASE,
  typeScaleRatio: DEFAULT_TYPE_RATIO,
  typeScaleSteps: calculateTypeScale(DEFAULT_TYPE_BASE, DEFAULT_TYPE_RATIO),
  lineHeightScale: DEFAULT_LINE_HEIGHT_SCALE,

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
  previewMode: "dark" as "light" | "dark",

  // Actions
  setBrandFamily: (name: string) =>
    set(() => {
      const ramp = getCoreFamily(name);
      return {
        brandMode: "family",
        brandFamily: name,
        brandRamp: ramp,
        brandHex: ramp["1400"]?.hex ?? DEFAULT_BRAND_HEX,
      };
    }),

  setBrandColor: (hex: string) =>
    set(() => ({
      brandMode: "custom",
      brandHex: hex,
      brandRamp: generateColorRamp(hex),
    })),

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
    set(() => ({
      typeScaleBase: base,
      typeScaleRatio: ratio,
      typeScaleSteps: calculateTypeScale(base, ratio),
    })),

  setLineHeightScale: (scale) => set(() => ({ lineHeightScale: scale })),

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
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a hex color to an oklch() CSS string via @ds/utils */
export function hexToOklchString(hex: string): string {
  try {
    const { l, c, h } = parseToOklch(hex);
    return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
  } catch {
    return "oklch(0 0 0)";
  }
}
