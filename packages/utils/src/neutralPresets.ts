/**
 * Curated neutral color ramp presets.
 *
 * Each preset is a complete 16-stop shade ramp (100–1600).
 * These are static data sourced from the primitive token library.
 * The neutralPreset field in the theme config references one of these keys.
 *
 * The selected preset becomes the neutral palette used by semantic tokens
 * for surfaces, borders, and text. "shark" and "mavic" are dark-friendly
 * neutrals with mid-range step 100 values that work well for dark-mode UIs.
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
  | "mavic"
  | "stormGray"
  | "sirocco"
  | "stonewall"
  | "opium";

export type NeutralPresetLibrary = Record<NeutralPresetName, ColorRamp>;

export const neutralPresets: NeutralPresetLibrary = {
  /** Dove — warm gray with pink-purple undertone */
  dove: {
    "100":  { hex: "#f5eff3", oklch: "oklch(0.958 0.008 336.9)" },
    "200":  { hex: "#e9dee6", oklch: "oklch(0.912 0.016 334.8)" },
    "300":  { hex: "#decdd8", oklch: "oklch(0.865 0.024 338.5)" },
    "400":  { hex: "#d1bdca", oklch: "oklch(0.819 0.029 338.6)" },
    "500":  { hex: "#c4adbd", oklch: "oklch(0.772 0.034 336.8)" },
    "600":  { hex: "#b79daf", oklch: "oklch(0.725 0.039 337.1)" },
    "700":  { hex: "#a98ea1", oklch: "oklch(0.677 0.042 336.8)" },
    "800":  { hex: "#9b8092", oklch: "oklch(0.631 0.042 338.5)" },
    "900":  { hex: "#8c7284", oklch: "oklch(0.583 0.042 337.4)" },
    "1000": { hex: "#7b6775", oklch: "oklch(0.538 0.033 336.9)" },
    "1100": { hex: "#6a5b65", oklch: "oklch(0.489 0.025 338.2)" },
    "1200": { hex: "#594f56", oklch: "oklch(0.440 0.017 336.5)" },
    "1300": { hex: "#494247", oklch: "oklch(0.388 0.013 335.7)" },
    "1400": { hex: "#393538", oklch: "oklch(0.334 0.008 334.1)" },
    "1500": { hex: "#2a2829", oklch: "oklch(0.279 0.003 345.1)" },
    "1600": { hex: "#1b1a1b", oklch: "oklch(0.219 0.002 325.3)" },
  },

  /** Mythical — cool gray with violet undertone */
  mythical: {
    "100":  { hex: "#f0eff5", oklch: "oklch(0.955 0.008 293.6)" },
    "200":  { hex: "#e0deea", oklch: "oklch(0.906 0.016 293.6)" },
    "300":  { hex: "#d0cdde", oklch: "oklch(0.856 0.024 293.9)" },
    "400":  { hex: "#c0bcd1", oklch: "oklch(0.805 0.030 294.4)" },
    "500":  { hex: "#b0acc5", oklch: "oklch(0.756 0.036 292.8)" },
    "600":  { hex: "#a19db7", oklch: "oklch(0.708 0.038 292.4)" },
    "700":  { hex: "#928eaa", oklch: "oklch(0.660 0.041 291.7)" },
    "800":  { hex: "#837f9c", oklch: "oklch(0.610 0.044 291.3)" },
    "900":  { hex: "#75718d", oklch: "oklch(0.562 0.043 291.5)" },
    "1000": { hex: "#69667b", oklch: "oklch(0.521 0.033 291.7)" },
    "1100": { hex: "#5c5a6a", oklch: "oklch(0.475 0.026 291.1)" },
    "1200": { hex: "#504e5a", oklch: "oklch(0.430 0.020 293.1)" },
    "1300": { hex: "#434249", oklch: "oklch(0.383 0.012 292.3)" },
    "1400": { hex: "#353539", oklch: "oklch(0.330 0.007 285.9)" },
    "1500": { hex: "#28282a", oklch: "oklch(0.278 0.004 286.0)" },
    "1600": { hex: "#1a1a1b", oklch: "oklch(0.218 0.002 286.0)" },
  },

  /** Flint — blue-gray with subtle cool undertone */
  flint: {
    "100":  { hex: "#f0f1f5", oklch: "oklch(0.959 0.006 274.8)" },
    "200":  { hex: "#dfe1e9", oklch: "oklch(0.911 0.011 274.8)" },
    "300":  { hex: "#ced2dd", oklch: "oklch(0.864 0.016 269.9)" },
    "400":  { hex: "#bec2d1", oklch: "oklch(0.816 0.022 273.9)" },
    "500":  { hex: "#aeb3c4", oklch: "oklch(0.768 0.025 272.7)" },
    "600":  { hex: "#9ea5b7", oklch: "oklch(0.722 0.027 268.7)" },
    "700":  { hex: "#8f96aa", oklch: "oklch(0.674 0.031 270.2)" },
    "800":  { hex: "#7f889d", oklch: "oklch(0.627 0.033 267.0)" },
    "900":  { hex: "#70798f", oklch: "oklch(0.576 0.036 267.7)" },
    "1000": { hex: "#656c7d", oklch: "oklch(0.531 0.028 267.7)" },
    "1100": { hex: "#5a5f6c", oklch: "oklch(0.486 0.022 268.8)" },
    "1200": { hex: "#4e525b", oklch: "oklch(0.438 0.016 266.5)" },
    "1300": { hex: "#42454b", oklch: "oklch(0.390 0.011 264.4)" },
    "1400": { hex: "#35373b", oklch: "oklch(0.336 0.008 264.5)" },
    "1500": { hex: "#28292b", oklch: "oklch(0.281 0.004 264.5)" },
    "1600": { hex: "#1b1b1c", oklch: "oklch(0.223 0.002 286.0)" },
  },

  /** Waterloo — blue-gray, slightly cooler than flint */
  waterloo: {
    "100":  { hex: "#f4f4f7", oklch: "oklch(0.968 0.004 285.9)" },
    "200":  { hex: "#e4e4eb", oklch: "oklch(0.921 0.009 286.0)" },
    "300":  { hex: "#d3d4de", oklch: "oklch(0.872 0.014 281.4)" },
    "400":  { hex: "#c3c4d2", oklch: "oklch(0.824 0.020 282.6)" },
    "500":  { hex: "#b3b5c5", oklch: "oklch(0.777 0.023 280.1)" },
    "600":  { hex: "#a4a6b8", oklch: "oklch(0.729 0.026 280.7)" },
    "700":  { hex: "#9497aa", oklch: "oklch(0.680 0.028 278.5)" },
    "800":  { hex: "#85899d", oklch: "oklch(0.634 0.030 276.5)" },
    "900":  { hex: "#767a8f", oklch: "oklch(0.584 0.032 276.8)" },
    "1000": { hex: "#6a6d7f", oklch: "oklch(0.539 0.028 277.9)" },
    "1100": { hex: "#5e616e", oklch: "oklch(0.495 0.021 275.3)" },
    "1200": { hex: "#52545d", oklch: "oklch(0.447 0.015 275.8)" },
    "1300": { hex: "#46474d", oklch: "oklch(0.399 0.010 278.3)" },
    "1400": { hex: "#39393d", oklch: "oklch(0.346 0.007 285.9)" },
    "1500": { hex: "#2c2c2e", oklch: "oklch(0.294 0.004 286.0)" },
    "1600": { hex: "#1e1e1f", oklch: "oklch(0.235 0.002 286.0)" },
  },

  /** Stone — gray-blue with slight warm lean */
  stone: {
    "100":  { hex: "#eff3f5", oklch: "oklch(0.962 0.005 229.4)" },
    "200":  { hex: "#dee6e9", oklch: "oklch(0.920 0.010 222.4)" },
    "300":  { hex: "#cdd8de", oklch: "oklch(0.876 0.015 231.4)" },
    "400":  { hex: "#bdcad1", oklch: "oklch(0.831 0.017 231.1)" },
    "500":  { hex: "#adbdc4", oklch: "oklch(0.788 0.020 225.9)" },
    "600":  { hex: "#9dafb7", oklch: "oklch(0.743 0.023 226.4)" },
    "700":  { hex: "#8ea1a9", oklch: "oklch(0.697 0.025 225.1)" },
    "800":  { hex: "#80929b", oklch: "oklch(0.649 0.025 229.4)" },
    "900":  { hex: "#72848c", oklch: "oklch(0.602 0.024 226.5)" },
    "1000": { hex: "#67757b", oklch: "oklch(0.553 0.019 225.5)" },
    "1100": { hex: "#5b656a", oklch: "oklch(0.500 0.015 229.3)" },
    "1200": { hex: "#4f5659", oklch: "oklch(0.448 0.010 225.4)" },
    "1300": { hex: "#424749", oklch: "oklch(0.394 0.007 223.8)" },
    "1400": { hex: "#353839", oklch: "oklch(0.338 0.005 219.9)" },
    "1500": { hex: "#28292a", oklch: "oklch(0.280 0.002 248.1)" },
    "1600": { hex: "#1a1b1b", oklch: "oklch(0.221 0.002 197.7)" },
  },

  /** Cave — teal-gray */
  cave: {
    "100":  { hex: "#eff3f4", oklch: "oklch(0.961 0.005 215.1)" },
    "200":  { hex: "#dee6e8", oklch: "oklch(0.919 0.009 214.7)" },
    "300":  { hex: "#ced9dc", oklch: "oklch(0.878 0.013 216.1)" },
    "400":  { hex: "#becccf", oklch: "oklch(0.835 0.016 212.2)" },
    "500":  { hex: "#aebfc2", oklch: "oklch(0.793 0.019 209.6)" },
    "600":  { hex: "#9eb1b5", oklch: "oklch(0.747 0.022 211.9)" },
    "700":  { hex: "#8fa4a8", oklch: "oklch(0.704 0.024 210.5)" },
    "800":  { hex: "#80969a", oklch: "oklch(0.657 0.026 209.9)" },
    "900":  { hex: "#71888c", oklch: "oklch(0.610 0.027 209.4)" },
    "1000": { hex: "#66787b", oklch: "oklch(0.559 0.022 208.9)" },
    "1100": { hex: "#5a686a", oklch: "oklch(0.506 0.017 207.2)" },
    "1200": { hex: "#4e5859", oklch: "oklch(0.452 0.013 204.2)" },
    "1300": { hex: "#424849", oklch: "oklch(0.397 0.008 209.0)" },
    "1400": { hex: "#353939", oklch: "oklch(0.341 0.005 197.2)" },
    "1500": { hex: "#28292a", oklch: "oklch(0.280 0.002 248.1)" },
    "1600": { hex: "#1a1b1b", oklch: "oklch(0.221 0.002 197.7)" },
  },

  /** Juniper — pure teal-gray */
  juniper: {
    "100":  { hex: "#f4f7f7", oklch: "oklch(0.974 0.003 198.5)" },
    "200":  { hex: "#e4ebeb", oklch: "oklch(0.935 0.008 197.6)" },
    "300":  { hex: "#d3dede", oklch: "oklch(0.892 0.012 197.3)" },
    "400":  { hex: "#c3d2d2", oklch: "oklch(0.852 0.016 197.1)" },
    "500":  { hex: "#b3c5c5", oklch: "oklch(0.810 0.020 197.0)" },
    "600":  { hex: "#a4b8b8", oklch: "oklch(0.767 0.022 196.9)" },
    "700":  { hex: "#94aaaa", oklch: "oklch(0.721 0.025 196.8)" },
    "800":  { hex: "#859d9d", oklch: "oklch(0.677 0.027 196.6)" },
    "900":  { hex: "#768f8f", oklch: "oklch(0.631 0.028 196.6)" },
    "1000": { hex: "#6a7f7f", oklch: "oklch(0.580 0.024 196.6)" },
    "1100": { hex: "#5e6e6e", oklch: "oklch(0.525 0.019 196.7)" },
    "1200": { hex: "#525d5d", oklch: "oklch(0.469 0.014 196.9)" },
    "1300": { hex: "#464d4d", oklch: "oklch(0.414 0.009 197.0)" },
    "1400": { hex: "#393d3d", oklch: "oklch(0.356 0.005 197.2)" },
    "1500": { hex: "#2c2e2e", oklch: "oklch(0.299 0.003 197.5)" },
    "1600": { hex: "#1e1f1f", oklch: "oklch(0.238 0.002 197.8)" },
  },

  /** Battleship — green-gray */
  battleship: {
    "100":  { hex: "#eff4ef", oklch: "oklch(0.962 0.008 146.0)" },
    "200":  { hex: "#dee8de", oklch: "oklch(0.921 0.017 145.7)" },
    "300":  { hex: "#cedcce", oklch: "oklch(0.880 0.024 145.5)" },
    "400":  { hex: "#bfcfbe", oklch: "oklch(0.838 0.029 143.8)" },
    "500":  { hex: "#b0c2ae", oklch: "oklch(0.795 0.034 142.6)" },
    "600":  { hex: "#a1b59f", oklch: "oklch(0.751 0.038 142.8)" },
    "700":  { hex: "#92a78f", oklch: "oklch(0.705 0.042 141.7)" },
    "800":  { hex: "#849a81", oklch: "oklch(0.662 0.044 141.9)" },
    "900":  { hex: "#768b72", oklch: "oklch(0.613 0.044 140.7)" },
    "1000": { hex: "#6a7a67", oklch: "oklch(0.561 0.034 140.8)" },
    "1100": { hex: "#5d695b", oklch: "oklch(0.506 0.026 141.2)" },
    "1200": { hex: "#50594f", oklch: "oklch(0.453 0.020 142.6)" },
    "1300": { hex: "#434942", oklch: "oklch(0.398 0.014 141.3)" },
    "1400": { hex: "#363935", oklch: "oklch(0.340 0.008 138.0)" },
    "1500": { hex: "#282a28", oklch: "oklch(0.282 0.005 145.7)" },
    "1600": { hex: "#1a1b1a", oklch: "oklch(0.221 0.002 145.9)" },
  },

  /** Squirrel — warm tan-gray */
  squirrel: {
    "100":  { hex: "#f7f6f4", oklch: "oklch(0.973 0.003 84.6)" },
    "200":  { hex: "#ebe8e4", oklch: "oklch(0.932 0.006 75.3)" },
    "300":  { hex: "#dedad3", oklch: "oklch(0.890 0.010 81.8)" },
    "400":  { hex: "#d2ccc3", oklch: "oklch(0.848 0.014 78.2)" },
    "500":  { hex: "#c5bdb3", oklch: "oklch(0.802 0.016 73.6)" },
    "600":  { hex: "#b8afa4", oklch: "oklch(0.758 0.019 73.0)" },
    "700":  { hex: "#aaa094", oklch: "oklch(0.711 0.021 72.5)" },
    "800":  { hex: "#9d9185", oklch: "oklch(0.664 0.022 67.4)" },
    "900":  { hex: "#8f8276", oklch: "oklch(0.615 0.024 65.1)" },
    "1000": { hex: "#7f746a", oklch: "oklch(0.566 0.020 64.7)" },
    "1100": { hex: "#6e665e", oklch: "oklch(0.515 0.016 67.4)" },
    "1200": { hex: "#5d5752", oklch: "oklch(0.461 0.011 62.3)" },
    "1300": { hex: "#4d4946", oklch: "oklch(0.408 0.007 59.4)" },
    "1400": { hex: "#3d3b39", oklch: "oklch(0.354 0.004 67.6)" },
    "1500": { hex: "#2e2d2c", oklch: "oklch(0.298 0.002 67.6)" },
    "1600": { hex: "#1f1e1e", oklch: "oklch(0.236 0.002 16.6)" },
  },

  /** Hemp — warm pink-gray */
  hemp: {
    "100":  { hex: "#f7f4f4", oklch: "oklch(0.969 0.003 15.8)" },
    "200":  { hex: "#ebe4e4", oklch: "oklch(0.924 0.008 16.7)" },
    "300":  { hex: "#ded3d3", oklch: "oklch(0.876 0.012 17.1)" },
    "400":  { hex: "#d2c3c3", oklch: "oklch(0.830 0.017 17.3)" },
    "500":  { hex: "#c5b3b3", oklch: "oklch(0.782 0.021 17.4)" },
    "600":  { hex: "#b8a4a4", oklch: "oklch(0.736 0.023 17.6)" },
    "700":  { hex: "#aa9494", oklch: "oklch(0.686 0.026 17.7)" },
    "800":  { hex: "#9d8585", oklch: "oklch(0.639 0.029 17.9)" },
    "900":  { hex: "#8f7676", oklch: "oklch(0.590 0.031 18.0)" },
    "1000": { hex: "#7f6a6a", oklch: "oklch(0.544 0.027 17.9)" },
    "1100": { hex: "#6e5e5e", oklch: "oklch(0.497 0.021 17.8)" },
    "1200": { hex: "#5d5252", oklch: "oklch(0.449 0.015 17.6)" },
    "1300": { hex: "#4d4646", oklch: "oklch(0.401 0.009 17.4)" },
    "1400": { hex: "#3d3939", oklch: "oklch(0.349 0.006 17.1)" },
    "1500": { hex: "#2e2c2c", oklch: "oklch(0.295 0.003 16.9)" },
    "1600": { hex: "#1f1e1e", oklch: "oklch(0.236 0.002 16.6)" },
  },

  /**
   * Shark — blue-gray with strong chroma. Primary dark-UI surface palette.
   * Light steps (100–400) provide mid-range values suitable for dark backgrounds.
   */
  shark: {
    "100":  { hex: "#f0f1f5", oklch: "oklch(0.959 0.006 274.8)" },
    "200":  { hex: "#dcdfe8", oklch: "oklch(0.904 0.013 271.2)" },
    "300":  { hex: "#c9cddb", oklch: "oklch(0.849 0.020 273.2)" },
    "400":  { hex: "#b5bacd", oklch: "oklch(0.791 0.027 274.0)" },
    "500":  { hex: "#a1a8c0", oklch: "oklch(0.734 0.036 272.6)" },
    "600":  { hex: "#8e97b3", oklch: "oklch(0.679 0.043 271.2)" },
    "700":  { hex: "#7a85a5", oklch: "oklch(0.619 0.050 270.1)" },
    "800":  { hex: "#677398", oklch: "oklch(0.560 0.059 270.5)" },
    "900":  { hex: "#5c6586", oklch: "oklch(0.512 0.054 272.6)" },
    "1000": { hex: "#515775", oklch: "oklch(0.464 0.049 275.5)" },
    "1100": { hex: "#464a64", oklch: "oklch(0.416 0.044 277.5)" },
    "1200": { hex: "#3a3d52", oklch: "oklch(0.366 0.036 278.1)" },
    "1300": { hex: "#2f3041", oklch: "oklch(0.316 0.030 281.9)" },
    "1400": { hex: "#232430", oklch: "oklch(0.265 0.022 281.0)" },
    "1500": { hex: "#171720", oklch: "oklch(0.209 0.018 284.7)" },
    "1600": { hex: "#0b0b0f", oklch: "oklch(0.152 0.009 285.3)" },
  },

  /**
   * Mavic — neutral blue-gray. Similar to shark with less chroma.
   * Suitable as an alternative dark-UI neutral.
   */
  mavic: {
    "100":  { hex: "#f1f1f4", oklch: "oklch(0.959 0.004 285.9)" },
    "200":  { hex: "#e1e1e7", oklch: "oklch(0.911 0.008 286.0)" },
    "300":  { hex: "#d1d1db", oklch: "oklch(0.864 0.014 286.0)" },
    "400":  { hex: "#c1c1ce", oklch: "oklch(0.815 0.018 285.9)" },
    "500":  { hex: "#b1b2c1", oklch: "oklch(0.767 0.021 282.8)" },
    "600":  { hex: "#a0a2b5", oklch: "oklch(0.717 0.028 280.9)" },
    "700":  { hex: "#9093a8", oklch: "oklch(0.668 0.031 279.1)" },
    "800":  { hex: "#80849c", oklch: "oklch(0.618 0.037 277.8)" },
    "900":  { hex: "#70758f", oklch: "oklch(0.568 0.041 276.5)" },
    "1000": { hex: "#63687f", oklch: "oklch(0.522 0.037 275.4)" },
    "1100": { hex: "#565b70", oklch: "oklch(0.475 0.035 274.5)" },
    "1200": { hex: "#494e60", oklch: "oklch(0.426 0.031 272.9)" },
    "1300": { hex: "#3d4150", oklch: "oklch(0.378 0.026 273.4)" },
    "1400": { hex: "#303340", oklch: "oklch(0.324 0.023 274.8)" },
    "1500": { hex: "#242630", oklch: "oklch(0.271 0.019 276.2)" },
    "1600": { hex: "#17191f", oklch: "oklch(0.214 0.012 270.8)" },
  },

  /** Storm Gray — cool blue-gray, mid chroma */
  stormGray: {
    "100":  { hex: "#eeeff4", oklch: "oklch(0.953 0.007 277.0)" },
    "200":  { hex: "#dddfe8", oklch: "oklch(0.905 0.012 276.0)" },
    "300":  { hex: "#cccfdc", oklch: "oklch(0.856 0.018 275.6)" },
    "400":  { hex: "#bcbfd0", oklch: "oklch(0.808 0.024 277.8)" },
    "500":  { hex: "#acb0c3", oklch: "oklch(0.760 0.028 276.2)" },
    "600":  { hex: "#9da1b5", oklch: "oklch(0.712 0.029 276.6)" },
    "700":  { hex: "#8e92a7", oklch: "oklch(0.664 0.031 277.0)" },
    "800":  { hex: "#808499", oklch: "oklch(0.617 0.032 276.9)" },
    "900":  { hex: "#72768a", oklch: "oklch(0.569 0.031 276.4)" },
    "1000": { hex: "#666979", oklch: "oklch(0.524 0.025 277.1)" },
    "1100": { hex: "#5a5d68", oklch: "oklch(0.480 0.018 273.6)" },
    "1200": { hex: "#4e5058", oklch: "oklch(0.432 0.013 274.6)" },
    "1300": { hex: "#414248", oklch: "oklch(0.380 0.010 278.3)" },
    "1400": { hex: "#343538", oklch: "oklch(0.329 0.005 271.2)" },
    "1500": { hex: "#272729", oklch: "oklch(0.274 0.004 286.0)" },
    "1600": { hex: "#19191a", oklch: "oklch(0.214 0.002 286.0)" },
  },

  /** Sirocco — teal-gray, minimal chroma */
  sirocco: {
    "100":  { hex: "#f0f5f5", oklch: "oklch(0.966 0.005 197.9)" },
    "200":  { hex: "#dee8e8", oklch: "oklch(0.923 0.011 197.4)" },
    "300":  { hex: "#cddbdb", oklch: "oklch(0.881 0.015 197.2)" },
    "400":  { hex: "#bbcece", oklch: "oklch(0.837 0.021 197.0)" },
    "500":  { hex: "#abc0c0", oklch: "oklch(0.792 0.023 196.9)" },
    "600":  { hex: "#9bb1b1", oklch: "oklch(0.744 0.024 196.8)" },
    "700":  { hex: "#8ba2a2", oklch: "oklch(0.695 0.026 196.7)" },
    "800":  { hex: "#7c9393", oklch: "oklch(0.645 0.026 196.6)" },
    "900":  { hex: "#6e8282", oklch: "oklch(0.591 0.023 196.7)" },
    "1000": { hex: "#617171", oklch: "oklch(0.535 0.019 196.7)" },
    "1100": { hex: "#545f5f", oklch: "oklch(0.476 0.014 196.9)" },
    "1200": { hex: "#474e4e", oklch: "oklch(0.418 0.009 197.0)" },
    "1300": { hex: "#393d3d", oklch: "oklch(0.356 0.005 197.2)" },
    "1400": { hex: "#2b2d2d", oklch: "oklch(0.295 0.003 197.5)" },
    "1500": { hex: "#1c1d1d", oklch: "oklch(0.230 0.002 197.7)" },
    "1600": { hex: "#0d0d0d", oklch: "oklch(0.159 0.000 263.3)" },
  },

  /** Stonewall — warm sand-gray */
  stonewall: {
    "100":  { hex: "#f6f4f1", oklch: "oklch(0.968 0.004 78.2)" },
    "200":  { hex: "#eae6e0", oklch: "oklch(0.926 0.009 78.2)" },
    "300":  { hex: "#ded8cf", oklch: "oklch(0.884 0.014 78.2)" },
    "400":  { hex: "#d2cabf", oklch: "oklch(0.842 0.017 76.1)" },
    "500":  { hex: "#c5bcaf", oklch: "oklch(0.799 0.021 77.3)" },
    "600":  { hex: "#b8aea0", oklch: "oklch(0.755 0.023 76.5)" },
    "700":  { hex: "#aaa091", oklch: "oklch(0.710 0.024 78.1)" },
    "800":  { hex: "#9c9282", oklch: "oklch(0.664 0.026 79.7)" },
    "900":  { hex: "#8d8374", oklch: "oklch(0.615 0.025 78.1)" },
    "1000": { hex: "#7c7468", oklch: "oklch(0.563 0.021 78.1)" },
    "1100": { hex: "#6b665d", oklch: "oklch(0.512 0.015 82.4)" },
    "1200": { hex: "#5b5750", oklch: "oklch(0.458 0.012 81.8)" },
    "1300": { hex: "#4b4844", oklch: "oklch(0.403 0.008 75.3)" },
    "1400": { hex: "#3b3937", oklch: "oklch(0.346 0.004 67.6)" },
    "1500": { hex: "#2c2b2a", oklch: "oklch(0.290 0.002 67.6)" },
    "1600": { hex: "#1d1c1c", oklch: "oklch(0.228 0.002 16.6)" },
  },

  /** Opium — rosy warm gray */
  opium: {
    "100":  { hex: "#f4efef", oklch: "oklch(0.956 0.005 16.4)" },
    "200":  { hex: "#e8dede", oklch: "oklch(0.909 0.011 17.0)" },
    "300":  { hex: "#dccece", oklch: "oklch(0.863 0.016 17.2)" },
    "400":  { hex: "#cfbebe", oklch: "oklch(0.816 0.019 17.4)" },
    "500":  { hex: "#c2aeae", oklch: "oklch(0.768 0.023 17.5)" },
    "600":  { hex: "#b59f9f", oklch: "oklch(0.722 0.026 17.6)" },
    "700":  { hex: "#a78f8f", oklch: "oklch(0.672 0.029 17.8)" },
    "800":  { hex: "#9a8181", oklch: "oklch(0.626 0.031 17.9)" },
    "900":  { hex: "#8b7272", oklch: "oklch(0.576 0.032 18.0)" },
    "1000": { hex: "#7a6767", oklch: "oklch(0.532 0.024 17.8)" },
    "1100": { hex: "#695b5b", oklch: "oklch(0.485 0.018 17.7)" },
    "1200": { hex: "#594f4f", oklch: "oklch(0.437 0.013 17.5)" },
    "1300": { hex: "#494242", oklch: "oklch(0.386 0.010 17.4)" },
    "1400": { hex: "#393535", oklch: "oklch(0.333 0.006 17.2)" },
    "1500": { hex: "#2a2828", oklch: "oklch(0.279 0.003 16.9)" },
    "1600": { hex: "#1b1a1a", oklch: "oklch(0.219 0.002 16.6)" },
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
