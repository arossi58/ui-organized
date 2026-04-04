import { validateConfig } from "@ds/schema";
import { useBuilderStore, hexToOklchString } from "../state/themeState";
import type { ColorRamp } from "@ds/utils";

function toColorSwatchRamp(ramp: ColorRamp): Record<string, { hex: string; oklch: string }> {
  const result: Record<string, { hex: string; oklch: string }> = {};
  for (const [step, swatch] of Object.entries(ramp)) {
    result[step] = { hex: swatch.hex, oklch: swatch.oklch };
  }
  return result;
}

/**
 * Build the modes object matching the ThemeConfig schema.
 * References use "neutral.XXX" so the build pipeline resolves against the selected preset.
 */
function buildDarkMode(): Record<string, string> {
  return {
    "color-surface-base":     "neutral.1600",
    "color-surface-subtle":   "neutral.1500",
    "color-surface-medium":   "neutral.1400",
    "color-surface-emphasis": "neutral.1300",
    "color-surface-strong":   "neutral.1200",
    "color-text-primary":     "white.100",
    "color-text-secondary":   "white.800",
    "color-text-tertiary":    "white.1100",
    "color-text-placeholder": "white.1100",
    "color-text-inverse":     "black.1600",
    "color-text-interactive": "white.100",
    "color-border-subtle":      "black.1100",
    "color-border-medium":      "black.1000",
    "color-border-emphasis":    "black.900",
    "color-border-strong":      "black.800",
    "color-border-data-entry":  "black.700",
    "color-interactive-primary-default":  "brand.1200",
    "color-interactive-primary-hover":    "brand.1400",
    "color-interactive-primary-active":   "brand.1600",
    "color-interactive-primary-selected": "brand.1200",
    "color-interactive-secondary-default":  "neutral.1100",
    "color-interactive-secondary-hover":    "neutral.900",
    "color-interactive-secondary-active":   "neutral.700",
    "color-interactive-secondary-selected": "neutral.900",
    "color-interactive-tertiary-default":  "brand.900",
    "color-interactive-tertiary-hover":    "brand.700",
    "color-interactive-tertiary-active":   "brand.600",
    "color-interactive-tertiary-selected": "brand.1000",
    "color-interactive-ghost-default":  "transparent",
    "color-interactive-ghost-hover":    "black.800",
    "color-interactive-ghost-active":   "black.1000",
    "color-interactive-ui-default":  "neutral.1300",
    "color-interactive-ui-hover":    "neutral.1100",
    "color-interactive-ui-active":   "neutral.1200",
    "color-interactive-ui-selected": "neutral.1200",
    "color-interactive-contents":     "white.100",
    "color-interactive-focus":        "white.100",
    "color-interactive-focus-inverse": "black.1600",
    "color-interactive-inactive-01": "black.600",
    "color-interactive-inactive-02": "black.400",
    "color-interactive-inactive-03": "black.200",
    "color-icon-primary":   "white.100",
    "color-icon-secondary": "white.800",
    "color-icon-tertiary":  "white.1100",
    "color-status-success":         "lima.1300",
    "color-status-success-bg":      "lima.1600",
    "color-status-success-content": "lima.300",
    "color-status-info":         "cerulean.1300",
    "color-status-info-bg":      "cerulean.1600",
    "color-status-info-content": "cerulean.300",
    "color-status-caution":         "candlelight.1300",
    "color-status-caution-bg":      "candlelight.1600",
    "color-status-caution-content": "candlelight.300",
    "color-status-warning":         "cerise.1300",
    "color-status-warning-bg":      "cerise.1600",
    "color-status-warning-content": "cerise.300",
    "color-status-error":         "crimson.1300",
    "color-status-error-bg":      "crimson.1600",
    "color-status-error-content": "crimson.300",
  };
}

/**
 * Build fixed functional ramps that are required by the schema.
 * These are the same values used in the system's primitive token library.
 */
function buildFunctionalRamps() {
  return {
    lima: {
      "100": { hex: "#f0fff4", oklch: "oklch(0.99 0.04 150)" },
      "200": { hex: "#c6f6d5", oklch: "oklch(0.94 0.08 150)" },
      "300": { hex: "#9ae6b4", oklch: "oklch(0.87 0.12 150)" },
      "400": { hex: "#68d391", oklch: "oklch(0.80 0.15 150)" },
      "500": { hex: "#48bb78", oklch: "oklch(0.72 0.17 150)" },
      "600": { hex: "#38a169", oklch: "oklch(0.63 0.16 150)" },
      "700": { hex: "#2f855a", oklch: "oklch(0.54 0.14 150)" },
      "800": { hex: "#276749", oklch: "oklch(0.46 0.12 150)" },
      "900": { hex: "#22543d", oklch: "oklch(0.38 0.10 150)" },
      "1000": { hex: "#1c4532", oklch: "oklch(0.31 0.08 150)" },
      "1100": { hex: "#163828", oklch: "oklch(0.25 0.07 150)" },
      "1200": { hex: "#112b1e", oklch: "oklch(0.20 0.05 150)" },
      "1300": { hex: "#0d1f15", oklch: "oklch(0.15 0.04 150)" },
      "1400": { hex: "#08140d", oklch: "oklch(0.10 0.03 150)" },
      "1500": { hex: "#050b07", oklch: "oklch(0.06 0.02 150)" },
      "1600": { hex: "#020503", oklch: "oklch(0.03 0.01 150)" },
    },
    cerulean: {
      "100": { hex: "#ebf8ff", oklch: "oklch(0.97 0.04 220)" },
      "200": { hex: "#bee3f8", oklch: "oklch(0.90 0.07 220)" },
      "300": { hex: "#90cdf4", oklch: "oklch(0.82 0.10 220)" },
      "400": { hex: "#63b3ed", oklch: "oklch(0.73 0.12 220)" },
      "500": { hex: "#4299e1", oklch: "oklch(0.63 0.14 220)" },
      "600": { hex: "#3182ce", oklch: "oklch(0.54 0.14 220)" },
      "700": { hex: "#2b6cb0", oklch: "oklch(0.46 0.13 220)" },
      "800": { hex: "#2c5282", oklch: "oklch(0.38 0.11 220)" },
      "900": { hex: "#2a4365", oklch: "oklch(0.31 0.09 220)" },
      "1000": { hex: "#1a365d", oklch: "oklch(0.25 0.08 220)" },
      "1100": { hex: "#152b4a", oklch: "oklch(0.20 0.06 220)" },
      "1200": { hex: "#102038", oklch: "oklch(0.16 0.05 220)" },
      "1300": { hex: "#0c1728", oklch: "oklch(0.12 0.04 220)" },
      "1400": { hex: "#080f1a", oklch: "oklch(0.08 0.03 220)" },
      "1500": { hex: "#04080f", oklch: "oklch(0.05 0.02 220)" },
      "1600": { hex: "#020407", oklch: "oklch(0.02 0.01 220)" },
    },
    caribbean: {
      "100": { hex: "#e6fffa", oklch: "oklch(0.98 0.04 185)" },
      "200": { hex: "#b2f5ea", oklch: "oklch(0.93 0.09 185)" },
      "300": { hex: "#81e6d9", oklch: "oklch(0.87 0.12 185)" },
      "400": { hex: "#4fd1c5", oklch: "oklch(0.79 0.14 185)" },
      "500": { hex: "#38b2ac", oklch: "oklch(0.68 0.13 185)" },
      "600": { hex: "#319795", oklch: "oklch(0.59 0.12 185)" },
      "700": { hex: "#2c7a7b", oklch: "oklch(0.51 0.11 185)" },
      "800": { hex: "#285e61", oklch: "oklch(0.43 0.10 185)" },
      "900": { hex: "#234e52", oklch: "oklch(0.36 0.08 185)" },
      "1000": { hex: "#1d4044", oklch: "oklch(0.30 0.07 185)" },
      "1100": { hex: "#163236", oklch: "oklch(0.24 0.06 185)" },
      "1200": { hex: "#102528", oklch: "oklch(0.19 0.05 185)" },
      "1300": { hex: "#0b191b", oklch: "oklch(0.14 0.04 185)" },
      "1400": { hex: "#070f10", oklch: "oklch(0.09 0.03 185)" },
      "1500": { hex: "#030607", oklch: "oklch(0.05 0.02 185)" },
      "1600": { hex: "#010303", oklch: "oklch(0.02 0.01 185)" },
    },
    candlelight: {
      "100": { hex: "#fffff0", oklch: "oklch(0.99 0.04 95)" },
      "200": { hex: "#fefcbf", oklch: "oklch(0.97 0.09 95)" },
      "300": { hex: "#faf089", oklch: "oklch(0.94 0.14 95)" },
      "400": { hex: "#f6e05e", oklch: "oklch(0.89 0.17 95)" },
      "500": { hex: "#ecc94b", oklch: "oklch(0.82 0.17 95)" },
      "600": { hex: "#d69e2e", oklch: "oklch(0.70 0.16 95)" },
      "700": { hex: "#b7791f", oklch: "oklch(0.58 0.14 95)" },
      "800": { hex: "#975a16", oklch: "oklch(0.47 0.12 95)" },
      "900": { hex: "#744210", oklch: "oklch(0.37 0.10 95)" },
      "1000": { hex: "#5a3209", oklch: "oklch(0.28 0.08 95)" },
      "1100": { hex: "#432407", oklch: "oklch(0.22 0.06 95)" },
      "1200": { hex: "#2e1805", oklch: "oklch(0.16 0.05 95)" },
      "1300": { hex: "#1c0d03", oklch: "oklch(0.10 0.03 95)" },
      "1400": { hex: "#100702", oklch: "oklch(0.07 0.02 95)" },
      "1500": { hex: "#070401", oklch: "oklch(0.04 0.01 95)" },
      "1600": { hex: "#030200", oklch: "oklch(0.02 0.00 95)" },
    },
    cerise: {
      "100": { hex: "#fff5f7", oklch: "oklch(0.98 0.03 355)" },
      "200": { hex: "#fed7e2", oklch: "oklch(0.90 0.07 355)" },
      "300": { hex: "#fbb6ce", oklch: "oklch(0.82 0.11 355)" },
      "400": { hex: "#f687b3", oklch: "oklch(0.73 0.15 355)" },
      "500": { hex: "#ed64a6", oklch: "oklch(0.63 0.18 355)" },
      "600": { hex: "#d53f8c", oklch: "oklch(0.53 0.18 355)" },
      "700": { hex: "#b83280", oklch: "oklch(0.44 0.16 355)" },
      "800": { hex: "#97266d", oklch: "oklch(0.36 0.14 355)" },
      "900": { hex: "#702459", oklch: "oklch(0.28 0.12 355)" },
      "1000": { hex: "#521b41", oklch: "oklch(0.22 0.10 355)" },
      "1100": { hex: "#3d1430", oklch: "oklch(0.17 0.08 355)" },
      "1200": { hex: "#2b0e21", oklch: "oklch(0.13 0.06 355)" },
      "1300": { hex: "#1c0815", oklch: "oklch(0.09 0.04 355)" },
      "1400": { hex: "#10050c", oklch: "oklch(0.06 0.03 355)" },
      "1500": { hex: "#070206", oklch: "oklch(0.03 0.02 355)" },
      "1600": { hex: "#030103", oklch: "oklch(0.02 0.01 355)" },
    },
    crimson: {
      "100": { hex: "#fff0f0", oklch: "oklch(0.97 0.04 25)" },
      "200": { hex: "#ffd6d6", oklch: "oklch(0.90 0.09 25)" },
      "300": { hex: "#ffb3b3", oklch: "oklch(0.82 0.13 25)" },
      "400": { hex: "#ff8080", oklch: "oklch(0.72 0.18 25)" },
      "500": { hex: "#f55252", oklch: "oklch(0.61 0.22 25)" },
      "600": { hex: "#e63030", oklch: "oklch(0.52 0.22 25)" },
      "700": { hex: "#cc1a1a", oklch: "oklch(0.43 0.20 25)" },
      "800": { hex: "#b51212", oklch: "oklch(0.36 0.18 25)" },
      "900": { hex: "#9e0e0e", oklch: "oklch(0.30 0.16 25)" },
      "1000": { hex: "#870b0b", oklch: "oklch(0.25 0.14 25)" },
      "1100": { hex: "#700808", oklch: "oklch(0.20 0.12 25)" },
      "1200": { hex: "#5a0606", oklch: "oklch(0.16 0.10 25)" },
      "1300": { hex: "#450404", oklch: "oklch(0.12 0.08 25)" },
      "1400": { hex: "#320303", oklch: "oklch(0.08 0.06 25)" },
      "1500": { hex: "#200202", oklch: "oklch(0.05 0.04 25)" },
      "1600": { hex: "#100101", oklch: "oklch(0.03 0.02 25)" },
    },
  };
}

// ─── Black & White ramps (fixed neutrals) ────────────────────────────────────

function buildBlackRamp(): Record<string, { hex: string; oklch: string }> {
  return {
    "100":  { hex: "#f0f0f0", oklch: "oklch(0.944 0 0)" },
    "200":  { hex: "#d0d0d0", oklch: "oklch(0.833 0 0)" },
    "300":  { hex: "#bcbcbc", oklch: "oklch(0.757 0 0)" },
    "400":  { hex: "#a8a8a8", oklch: "oklch(0.680 0 0)" },
    "500":  { hex: "#909090", oklch: "oklch(0.593 0 0)" },
    "600":  { hex: "#787878", oklch: "oklch(0.504 0 0)" },
    "700":  { hex: "#606060", oklch: "oklch(0.416 0 0)" },
    "800":  { hex: "#484848", oklch: "oklch(0.326 0 0)" },
    "900":  { hex: "#303030", oklch: "oklch(0.220 0 0)" },
    "1000": { hex: "#202020", oklch: "oklch(0.154 0 0)" },
    "1100": { hex: "#141414", oklch: "oklch(0.103 0 0)" },
    "1200": { hex: "#0c0c0c", oklch: "oklch(0.064 0 0)" },
    "1300": { hex: "#080808", oklch: "oklch(0.044 0 0)" },
    "1400": { hex: "#050505", oklch: "oklch(0.030 0 0)" },
    "1500": { hex: "#020202", oklch: "oklch(0.014 0 0)" },
    "1600": { hex: "#000000", oklch: "oklch(0 0 0)" },
  };
}

function buildWhiteRamp(): Record<string, { hex: string; oklch: string }> {
  return {
    "100":  { hex: "#fcfcfc", oklch: "oklch(0.991 0 0)" },
    "200":  { hex: "#f0f0f0", oklch: "oklch(0.944 0 0)" },
    "300":  { hex: "#e4e4e4", oklch: "oklch(0.897 0 0)" },
    "400":  { hex: "#d8d8d8", oklch: "oklch(0.851 0 0)" },
    "500":  { hex: "#cccccc", oklch: "oklch(0.805 0 0)" },
    "600":  { hex: "#c0c0c0", oklch: "oklch(0.758 0 0)" },
    "700":  { hex: "#b4b4b4", oklch: "oklch(0.712 0 0)" },
    "800":  { hex: "#a8a8a8", oklch: "oklch(0.680 0 0)" },
    "900":  { hex: "#9c9c9c", oklch: "oklch(0.636 0 0)" },
    "1000": { hex: "#909090", oklch: "oklch(0.593 0 0)" },
    "1100": { hex: "#848484", oklch: "oklch(0.548 0 0)" },
    "1200": { hex: "#787878", oklch: "oklch(0.504 0 0)" },
    "1300": { hex: "#6c6c6c", oklch: "oklch(0.459 0 0)" },
    "1400": { hex: "#606060", oklch: "oklch(0.416 0 0)" },
    "1500": { hex: "#545454", oklch: "oklch(0.371 0 0)" },
    "1600": { hex: "#484848", oklch: "oklch(0.326 0 0)" },
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface ExportResult {
  ok: boolean;
  errors?: string[];
}

export function useExport() {
  const state = useBuilderStore();

  function buildConfig(): unknown {
    const functional = buildFunctionalRamps();
    const darkMode = buildDarkMode();

    return {
      metadata: {
        name: state.themeName || "My Theme",
        schemaVersion: "1.0.0",
        timestamp: new Date().toISOString(),
      },
      color: {
        brandColor: {
          hex: state.brandHex,
          oklch: hexToOklchString(state.brandHex),
        },
        neutralPreset: state.neutralPreset,
        resolvedPrimitives: {
          brand:    toColorSwatchRamp(state.brandRamp),
          neutral:  toColorSwatchRamp(state.neutralRamp),
          black:    buildBlackRamp(),
          white:    buildWhiteRamp(),
          functional,
        },
        modes: {
          dark: darkMode,
        },
      },
      typography: {
        headingFont: {
          family: state.headingFamily,
          weights: state.headingWeights,
        },
        bodyFont: {
          family: state.bodyFamily,
          weights: state.bodyWeights,
        },
        scale: {
          base: state.typeScaleBase,
          ratio: state.typeScaleRatio,
          steps: state.typeScaleSteps,
        },
      },
      icons: {
        library: state.icons.library,
        style: state.icons.style,
        strokeAdjustment: state.icons.strokeAdjustment,
        baseSize: state.icons.baseSize,
        baseStroke: state.icons.baseStroke,
      },
      borderRadius: state.borderRadius,
      spacing: {
        baseUnit: state.spacingBaseUnit,
      },
    };
  }

  function exportConfig(): ExportResult {
    const config = buildConfig();
    try {
      validateConfig(config);
    } catch (err) {
      const msg = String(err);
      const lines = msg.split("\n").slice(1);
      return { ok: false, errors: lines };
    }

    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(state.themeName || "theme").toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return { ok: true };
  }

  return { exportConfig, buildConfig };
}
