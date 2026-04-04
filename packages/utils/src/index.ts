export {
  generateColorRamp,
  parseToOklch,
  type ColorSwatch,
  type ColorRamp,
  type OklchColor,
} from "./colorGeneration.js";

export {
  neutralPresets,
  getNeutralPreset,
  NEUTRAL_PRESET_NAMES,
  type NeutralPresetName,
  type NeutralPresetLibrary,
} from "./neutralPresets.js";

export {
  calculateTypeScale,
  getCanonicalTypeScale,
  roundTypeSize,
  calculateLineHeights,
  TYPE_SCALE_STEPS_DESKTOP,
  TYPE_SCALE_STEPS_MOBILE,
  TYPE_SCALE_STEP_NAMES,
  LINE_HEIGHT_MULTIPLIERS,
  type TypeScaleStepName,
} from "./typeScale.js";

export {
  generateSpacingScale,
  SPACING_SCALE,
  SPACING_MULTIPLIERS,
} from "./spacing.js";

export {
  generateModes,
  type ResolvedPrimitives,
  type SemanticMode,
  type GeneratedModes,
} from "./modeGeneration.js";

export {
  resolveWeights,
  resolveAssignedWeights,
  WEIGHT_ROLES,
  type WeightRole,
} from "./weightFallback.js";

export {
  CANONICAL_ICON_NAMES,
  ICON_MAP,
  resolveIconName,
  type CanonicalIconName,
  type IconLibraryNames,
} from "./iconMapping.js";

export {
  adjustStrokeWidth,
  shouldAdjustStroke,
  ICON_REFERENCE_SIZE,
  ICON_DEFAULT_STROKE,
} from "./iconStroke.js";
