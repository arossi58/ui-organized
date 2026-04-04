/**
 * Curated neutral color ramp presets.
 *
 * Each preset is a complete 16-stop shade ramp (100–1600).
 * These are static data sourced from the primitive token library.
 * The neutralPreset field in the theme config references one of these keys.
 *
 * The selected preset becomes the neutral palette used by semantic tokens
 * for surfaces, borders, and text. "shark" and "mavic" are special dark-first
 * neutrals used as the primary UI surface palette.
 */

import type { ColorRamp } from "./colorGeneration.js";

export type NeutralPresetName =
  | "dove"
  | "mythical"
  | "flint"
  | "waterloo"
  | "stone"
  | "cave"
  | "juniper"
  | "battleship"
  | "squirrel"
  | "hemp"
  | "shark"
  | "mavic";

export type NeutralPresetLibrary = Record<NeutralPresetName, ColorRamp>;

export const neutralPresets: NeutralPresetLibrary = {
  /** Dove — warm gray with pink-purple undertone */
  dove: {
    "100":  { hex: "#f7f4f6", oklch: "oklch(0.973 0.006 340)" },
    "200":  { hex: "#ebe4e8", oklch: "oklch(0.924 0.012 340)" },
    "300":  { hex: "#ded3db", oklch: "oklch(0.868 0.018 340)" },
    "400":  { hex: "#d2c3cd", oklch: "oklch(0.810 0.024 340)" },
    "500":  { hex: "#c5b3bf", oklch: "oklch(0.750 0.028 340)" },
    "600":  { hex: "#b8a4b1", oklch: "oklch(0.690 0.030 340)" },
    "700":  { hex: "#aa94a3", oklch: "oklch(0.628 0.030 340)" },
    "800":  { hex: "#9d8595", oklch: "oklch(0.566 0.028 340)" },
    "900":  { hex: "#8f7687", oklch: "oklch(0.504 0.026 340)" },
    "1000": { hex: "#7f6a78", oklch: "oklch(0.449 0.024 340)" },
    "1100": { hex: "#6e5e69", oklch: "oklch(0.393 0.020 340)" },
    "1200": { hex: "#5d525a", oklch: "oklch(0.339 0.016 340)" },
    "1300": { hex: "#4d464b", oklch: "oklch(0.289 0.012 340)" },
    "1400": { hex: "#3d393c", oklch: "oklch(0.240 0.008 340)" },
    "1500": { hex: "#2e2c2d", oklch: "oklch(0.192 0.004 340)" },
    "1600": { hex: "#1f1e1e", oklch: "oklch(0.145 0.002 340)" },
  },

  /** Mythical — cool gray with violet undertone */
  mythical: {
    "100":  { hex: "#f4f4f7", oklch: "oklch(0.966 0.008 280)" },
    "200":  { hex: "#e4e4eb", oklch: "oklch(0.914 0.016 280)" },
    "300":  { hex: "#d4d3de", oklch: "oklch(0.856 0.022 280)" },
    "400":  { hex: "#c4c3d2", oklch: "oklch(0.796 0.028 280)" },
    "500":  { hex: "#b5b3c5", oklch: "oklch(0.736 0.032 280)" },
    "600":  { hex: "#a6a4b8", oklch: "oklch(0.674 0.034 280)" },
    "700":  { hex: "#9794aa", oklch: "oklch(0.612 0.034 280)" },
    "800":  { hex: "#89859d", oklch: "oklch(0.550 0.032 280)" },
    "900":  { hex: "#7a768f", oklch: "oklch(0.490 0.028 280)" },
    "1000": { hex: "#6d6a7f", oklch: "oklch(0.438 0.024 280)" },
    "1100": { hex: "#615e6e", oklch: "oklch(0.384 0.020 280)" },
    "1200": { hex: "#54525d", oklch: "oklch(0.331 0.016 280)" },
    "1300": { hex: "#47464d", oklch: "oklch(0.280 0.012 280)" },
    "1400": { hex: "#39393d", oklch: "oklch(0.231 0.008 280)" },
    "1500": { hex: "#2c2c2e", oklch: "oklch(0.183 0.004 280)" },
    "1600": { hex: "#1e1e1f", oklch: "oklch(0.140 0.002 280)" },
  },

  /** Flint — blue-gray with subtle cool undertone */
  flint: {
    "100":  { hex: "#f4f5f7", oklch: "oklch(0.967 0.008 250)" },
    "200":  { hex: "#e4e6eb", oklch: "oklch(0.915 0.016 250)" },
    "300":  { hex: "#d3d7de", oklch: "oklch(0.856 0.022 250)" },
    "400":  { hex: "#c3c8d2", oklch: "oklch(0.796 0.028 250)" },
    "500":  { hex: "#b3b9c5", oklch: "oklch(0.734 0.030 250)" },
    "600":  { hex: "#a4aab8", oklch: "oklch(0.673 0.032 250)" },
    "700":  { hex: "#949caa", oklch: "oklch(0.611 0.030 250)" },
    "800":  { hex: "#858d9d", oklch: "oklch(0.550 0.028 250)" },
    "900":  { hex: "#767e8f", oklch: "oklch(0.490 0.026 250)" },
    "1000": { hex: "#6a717f", oklch: "oklch(0.440 0.022 250)" },
    "1100": { hex: "#5e636e", oklch: "oklch(0.386 0.018 250)" },
    "1200": { hex: "#52565d", oklch: "oklch(0.333 0.014 250)" },
    "1300": { hex: "#46484d", oklch: "oklch(0.282 0.010 250)" },
    "1400": { hex: "#393a3d", oklch: "oklch(0.233 0.007 250)" },
    "1500": { hex: "#2c2c2e", oklch: "oklch(0.183 0.004 250)" },
    "1600": { hex: "#1e1e1f", oklch: "oklch(0.140 0.002 250)" },
  },

  /** Waterloo — blue-gray, slightly cooler than flint */
  waterloo: {
    "100":  { hex: "#f4f4f7", oklch: "oklch(0.966 0.009 255)" },
    "200":  { hex: "#e4e4eb", oklch: "oklch(0.913 0.018 255)" },
    "300":  { hex: "#d3d4de", oklch: "oklch(0.855 0.024 255)" },
    "400":  { hex: "#c3c4d2", oklch: "oklch(0.794 0.030 255)" },
    "500":  { hex: "#b3b5c5", oklch: "oklch(0.733 0.032 255)" },
    "600":  { hex: "#a4a6b8", oklch: "oklch(0.671 0.034 255)" },
    "700":  { hex: "#9497aa", oklch: "oklch(0.609 0.032 255)" },
    "800":  { hex: "#85899d", oklch: "oklch(0.548 0.030 255)" },
    "900":  { hex: "#767a8f", oklch: "oklch(0.488 0.026 255)" },
    "1000": { hex: "#6a6d7f", oklch: "oklch(0.436 0.022 255)" },
    "1100": { hex: "#5e616e", oklch: "oklch(0.383 0.018 255)" },
    "1200": { hex: "#52545d", oklch: "oklch(0.331 0.014 255)" },
    "1300": { hex: "#46474d", oklch: "oklch(0.280 0.010 255)" },
    "1400": { hex: "#39393d", oklch: "oklch(0.231 0.007 255)" },
    "1500": { hex: "#2c2c2e", oklch: "oklch(0.183 0.004 255)" },
    "1600": { hex: "#1e1e1f", oklch: "oklch(0.140 0.002 255)" },
  },

  /** Stone — gray-blue with slight warm lean */
  stone: {
    "100":  { hex: "#f4f6f7", oklch: "oklch(0.968 0.007 230)" },
    "200":  { hex: "#e4e8eb", oklch: "oklch(0.916 0.014 230)" },
    "300":  { hex: "#d3dbde", oklch: "oklch(0.857 0.020 230)" },
    "400":  { hex: "#c3cdd2", oklch: "oklch(0.797 0.026 230)" },
    "500":  { hex: "#b3bfc5", oklch: "oklch(0.736 0.028 230)" },
    "600":  { hex: "#a4b1b8", oklch: "oklch(0.675 0.028 230)" },
    "700":  { hex: "#94a3aa", oklch: "oklch(0.613 0.026 230)" },
    "800":  { hex: "#85959d", oklch: "oklch(0.552 0.024 230)" },
    "900":  { hex: "#76878f", oklch: "oklch(0.491 0.022 230)" },
    "1000": { hex: "#6a787f", oklch: "oklch(0.440 0.019 230)" },
    "1100": { hex: "#5e696e", oklch: "oklch(0.386 0.015 230)" },
    "1200": { hex: "#525a5d", oklch: "oklch(0.333 0.012 230)" },
    "1300": { hex: "#464b4d", oklch: "oklch(0.282 0.009 230)" },
    "1400": { hex: "#393c3d", oklch: "oklch(0.233 0.006 230)" },
    "1500": { hex: "#2c2d2e", oklch: "oklch(0.184 0.003 230)" },
    "1600": { hex: "#1e1e1f", oklch: "oklch(0.140 0.002 230)" },
  },

  /** Cave — teal-gray */
  cave: {
    "100":  { hex: "#f4f7f7", oklch: "oklch(0.968 0.008 195)" },
    "200":  { hex: "#e4ebeb", oklch: "oklch(0.917 0.016 195)" },
    "300":  { hex: "#d3dede", oklch: "oklch(0.858 0.022 195)" },
    "400":  { hex: "#c3d1d2", oklch: "oklch(0.798 0.026 195)" },
    "500":  { hex: "#b3c3c5", oklch: "oklch(0.737 0.028 195)" },
    "600":  { hex: "#a4b6b8", oklch: "oklch(0.676 0.028 195)" },
    "700":  { hex: "#94a8aa", oklch: "oklch(0.614 0.026 195)" },
    "800":  { hex: "#859a9d", oklch: "oklch(0.553 0.024 195)" },
    "900":  { hex: "#768b8f", oklch: "oklch(0.492 0.022 195)" },
    "1000": { hex: "#6a7b7f", oklch: "oklch(0.441 0.019 195)" },
    "1100": { hex: "#5e6b6e", oklch: "oklch(0.387 0.015 195)" },
    "1200": { hex: "#525b5d", oklch: "oklch(0.334 0.012 195)" },
    "1300": { hex: "#464c4d", oklch: "oklch(0.283 0.009 195)" },
    "1400": { hex: "#393d3d", oklch: "oklch(0.233 0.006 195)" },
    "1500": { hex: "#2c2d2e", oklch: "oklch(0.184 0.003 195)" },
    "1600": { hex: "#1e1f1f", oklch: "oklch(0.140 0.002 195)" },
  },

  /** Juniper — pure teal-gray */
  juniper: {
    "100":  { hex: "#f4f7f7", oklch: "oklch(0.968 0.008 180)" },
    "200":  { hex: "#e4ebeb", oklch: "oklch(0.917 0.016 180)" },
    "300":  { hex: "#d3dede", oklch: "oklch(0.858 0.022 180)" },
    "400":  { hex: "#c3d2d2", oklch: "oklch(0.798 0.026 180)" },
    "500":  { hex: "#b3c5c5", oklch: "oklch(0.737 0.028 180)" },
    "600":  { hex: "#a4b8b8", oklch: "oklch(0.676 0.028 180)" },
    "700":  { hex: "#94aaaa", oklch: "oklch(0.614 0.026 180)" },
    "800":  { hex: "#859d9d", oklch: "oklch(0.553 0.024 180)" },
    "900":  { hex: "#768f8f", oklch: "oklch(0.492 0.022 180)" },
    "1000": { hex: "#6a7f7f", oklch: "oklch(0.441 0.019 180)" },
    "1100": { hex: "#5e6e6e", oklch: "oklch(0.387 0.015 180)" },
    "1200": { hex: "#525d5d", oklch: "oklch(0.334 0.012 180)" },
    "1300": { hex: "#464d4d", oklch: "oklch(0.283 0.009 180)" },
    "1400": { hex: "#393d3d", oklch: "oklch(0.233 0.006 180)" },
    "1500": { hex: "#2c2e2e", oklch: "oklch(0.184 0.003 180)" },
    "1600": { hex: "#1e1f1f", oklch: "oklch(0.140 0.002 180)" },
  },

  /** Battleship — green-gray */
  battleship: {
    "100":  { hex: "#f4f7f4", oklch: "oklch(0.968 0.008 150)" },
    "200":  { hex: "#e4ebe4", oklch: "oklch(0.917 0.015 150)" },
    "300":  { hex: "#d4ded3", oklch: "oklch(0.858 0.020 150)" },
    "400":  { hex: "#c4d2c3", oklch: "oklch(0.798 0.024 150)" },
    "500":  { hex: "#b5c5b3", oklch: "oklch(0.737 0.026 150)" },
    "600":  { hex: "#a6b8a4", oklch: "oklch(0.676 0.026 150)" },
    "700":  { hex: "#97aa94", oklch: "oklch(0.614 0.024 150)" },
    "800":  { hex: "#899d85", oklch: "oklch(0.553 0.022 150)" },
    "900":  { hex: "#7a8f76", oklch: "oklch(0.492 0.020 150)" },
    "1000": { hex: "#6d7f6a", oklch: "oklch(0.441 0.018 150)" },
    "1100": { hex: "#616e5e", oklch: "oklch(0.387 0.014 150)" },
    "1200": { hex: "#545d52", oklch: "oklch(0.334 0.011 150)" },
    "1300": { hex: "#474d46", oklch: "oklch(0.283 0.008 150)" },
    "1400": { hex: "#393d39", oklch: "oklch(0.233 0.006 150)" },
    "1500": { hex: "#2c2e2c", oklch: "oklch(0.184 0.003 150)" },
    "1600": { hex: "#1e1f1e", oklch: "oklch(0.140 0.002 150)" },
  },

  /** Squirrel — warm tan-gray */
  squirrel: {
    "100":  { hex: "#f7f6f4", oklch: "oklch(0.972 0.006 80)" },
    "200":  { hex: "#ebe8e4", oklch: "oklch(0.922 0.012 80)" },
    "300":  { hex: "#dedad3", oklch: "oklch(0.866 0.018 80)" },
    "400":  { hex: "#d2ccc3", oklch: "oklch(0.808 0.022 80)" },
    "500":  { hex: "#c5bdb3", oklch: "oklch(0.748 0.024 80)" },
    "600":  { hex: "#b8afa4", oklch: "oklch(0.688 0.024 80)" },
    "700":  { hex: "#aaa094", oklch: "oklch(0.626 0.022 80)" },
    "800":  { hex: "#9d9185", oklch: "oklch(0.564 0.020 80)" },
    "900":  { hex: "#8f8276", oklch: "oklch(0.502 0.018 80)" },
    "1000": { hex: "#7f746a", oklch: "oklch(0.448 0.016 80)" },
    "1100": { hex: "#6e665e", oklch: "oklch(0.392 0.013 80)" },
    "1200": { hex: "#5d5752", oklch: "oklch(0.338 0.010 80)" },
    "1300": { hex: "#4d4946", oklch: "oklch(0.287 0.008 80)" },
    "1400": { hex: "#3d3b39", oklch: "oklch(0.238 0.005 80)" },
    "1500": { hex: "#2e2d2c", oklch: "oklch(0.190 0.003 80)" },
    "1600": { hex: "#1f1e1e", oklch: "oklch(0.145 0.002 80)" },
  },

  /** Hemp — warm pink-gray */
  hemp: {
    "100":  { hex: "#f7f4f4", oklch: "oklch(0.972 0.006 20)" },
    "200":  { hex: "#ebe4e4", oklch: "oklch(0.921 0.012 20)" },
    "300":  { hex: "#ded3d3", oklch: "oklch(0.864 0.018 20)" },
    "400":  { hex: "#d2c3c3", oklch: "oklch(0.806 0.022 20)" },
    "500":  { hex: "#c5b3b3", oklch: "oklch(0.746 0.024 20)" },
    "600":  { hex: "#b8a4a4", oklch: "oklch(0.686 0.024 20)" },
    "700":  { hex: "#aa9494", oklch: "oklch(0.624 0.022 20)" },
    "800":  { hex: "#9d8585", oklch: "oklch(0.562 0.020 20)" },
    "900":  { hex: "#8f7676", oklch: "oklch(0.500 0.018 20)" },
    "1000": { hex: "#7f6a6a", oklch: "oklch(0.446 0.016 20)" },
    "1100": { hex: "#6e5e5e", oklch: "oklch(0.391 0.013 20)" },
    "1200": { hex: "#5d5252", oklch: "oklch(0.337 0.010 20)" },
    "1300": { hex: "#4d4646", oklch: "oklch(0.286 0.008 20)" },
    "1400": { hex: "#3d3939", oklch: "oklch(0.237 0.005 20)" },
    "1500": { hex: "#2e2c2c", oklch: "oklch(0.190 0.003 20)" },
    "1600": { hex: "#1f1e1e", oklch: "oklch(0.145 0.002 20)" },
  },

  /**
   * Shark — dark-first blue-gray. Primary UI surface palette.
   * 100 starts at a medium blue-gray (not near-white like other presets).
   * Used for dark-mode surfaces.
   */
  shark: {
    "100":  { hex: "#919baf", oklch: "oklch(0.653 0.040 250)" },
    "200":  { hex: "#808ca3", oklch: "oklch(0.601 0.038 250)" },
    "300":  { hex: "#707d97", oklch: "oklch(0.550 0.036 250)" },
    "400":  { hex: "#636f87", oklch: "oklch(0.503 0.033 250)" },
    "500":  { hex: "#566277", oklch: "oklch(0.455 0.030 250)" },
    "600":  { hex: "#4a5466", oklch: "oklch(0.407 0.027 250)" },
    "700":  { hex: "#3e4655", oklch: "oklch(0.359 0.024 250)" },
    "800":  { hex: "#323945", oklch: "oklch(0.311 0.020 250)" },
    "900":  { hex: "#262b34", oklch: "oklch(0.252 0.016 250)" },
    "1000": { hex: "#21252e", oklch: "oklch(0.218 0.014 250)" },
    "1100": { hex: "#1d2028", oklch: "oklch(0.191 0.012 250)" },
    "1200": { hex: "#181a22", oklch: "oklch(0.163 0.010 250)" },
    "1300": { hex: "#14151c", oklch: "oklch(0.136 0.008 250)" },
    "1400": { hex: "#0f1016", oklch: "oklch(0.108 0.006 250)" },
    "1500": { hex: "#0b0b10", oklch: "oklch(0.082 0.004 250)" },
    "1600": { hex: "#060609", oklch: "oklch(0.044 0.002 250)" },
  },

  /**
   * Mavic — mid-range blue-gray. Similar to shark but lighter start.
   * Useful as an alternative dark-UI neutral.
   */
  mavic: {
    "100":  { hex: "#cacdd4", oklch: "oklch(0.830 0.016 250)" },
    "200":  { hex: "#babec7", oklch: "oklch(0.774 0.018 250)" },
    "300":  { hex: "#aaafba", oklch: "oklch(0.718 0.018 250)" },
    "400":  { hex: "#9aa0ae", oklch: "oklch(0.662 0.018 250)" },
    "500":  { hex: "#8a91a1", oklch: "oklch(0.605 0.018 250)" },
    "600":  { hex: "#7a8294", oklch: "oklch(0.549 0.018 250)" },
    "700":  { hex: "#6c7486", oklch: "oklch(0.495 0.018 250)" },
    "800":  { hex: "#5f6676", oklch: "oklch(0.441 0.016 250)" },
    "900":  { hex: "#525866", oklch: "oklch(0.386 0.014 250)" },
    "1000": { hex: "#474c5b", oklch: "oklch(0.340 0.014 250)" },
    "1100": { hex: "#3c414f", oklch: "oklch(0.294 0.012 250)" },
    "1200": { hex: "#323543", oklch: "oklch(0.250 0.010 250)" },
    "1300": { hex: "#282a37", oklch: "oklch(0.206 0.010 250)" },
    "1400": { hex: "#1e1f2a", oklch: "oklch(0.162 0.008 250)" },
    "1500": { hex: "#14151d", oklch: "oklch(0.118 0.006 250)" },
    "1600": { hex: "#0b0b10", oklch: "oklch(0.082 0.004 250)" },
  },
};

export const NEUTRAL_PRESET_NAMES = Object.keys(neutralPresets) as NeutralPresetName[];

/**
 * Retrieve a neutral preset ramp by name.
 * Throws if the name is not found.
 */
export function getNeutralPreset(name: string): ColorRamp {
  if (!(name in neutralPresets)) {
    throw new Error(
      `Unknown neutral preset "${name}". Available: ${NEUTRAL_PRESET_NAMES.join(", ")}`,
    );
  }
  return neutralPresets[name as NeutralPresetName];
}
