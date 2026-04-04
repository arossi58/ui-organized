import { create } from "zustand";
import {
  generateColorRamp,
  parseToOklch,
  getNeutralPreset,
  calculateTypeScale,
  generateSpacingScale,
  type ColorRamp,
  type NeutralPresetName,
} from "@ds/utils";

// ─── Default values ───────────────────────────────────────────────────────────

const DEFAULT_BRAND_HEX = "#008ffb";
const DEFAULT_NEUTRAL: NeutralPresetName = "shark";
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
  brandHex: string;
  brandRamp: ColorRamp;
  neutralPreset: NeutralPresetName;
  neutralRamp: ColorRamp;

  // Typography
  headingFamily: string;
  headingWeights: Record<string, number>;
  bodyFamily: string;
  bodyWeights: Record<string, number>;
  typeScaleBase: number;
  typeScaleRatio: number;
  typeScaleSteps: Record<string, number>;

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

  // Actions
  setBrandColor: (hex: string) => void;
  setNeutralPreset: (name: NeutralPresetName) => void;
  setHeadingFont: (family: string, weights: Record<string, number>) => void;
  setBodyFont: (family: string, weights: Record<string, number>) => void;
  setTypeScale: (base: number, ratio: number) => void;
  setRadiusBase: (base: number) => void;
  setSpacingBase: (base: number) => void;
  setIcons: (config: Partial<IconsConfig>) => void;
  setActivePanel: (panel: ActivePanel) => void;
  setThemeName: (name: string) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useBuilderStore = create<BuilderState>((set) => ({
  // Color
  brandHex: DEFAULT_BRAND_HEX,
  brandRamp: generateColorRamp(DEFAULT_BRAND_HEX),
  neutralPreset: DEFAULT_NEUTRAL,
  neutralRamp: getNeutralPreset(DEFAULT_NEUTRAL),

  // Typography
  headingFamily: DEFAULT_HEADING_FAMILY,
  headingWeights: { ...DEFAULT_WEIGHTS },
  bodyFamily: DEFAULT_BODY_FAMILY,
  bodyWeights: { ...DEFAULT_WEIGHTS },
  typeScaleBase: DEFAULT_TYPE_BASE,
  typeScaleRatio: DEFAULT_TYPE_RATIO,
  typeScaleSteps: calculateTypeScale(DEFAULT_TYPE_BASE, DEFAULT_TYPE_RATIO),

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

  // Actions
  setBrandColor: (hex: string) =>
    set(() => ({
      brandHex: hex,
      brandRamp: generateColorRamp(hex),
    })),

  setNeutralPreset: (name: NeutralPresetName) =>
    set(() => ({
      neutralPreset: name,
      neutralRamp: getNeutralPreset(name),
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
