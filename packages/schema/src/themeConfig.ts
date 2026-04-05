import { z } from "zod";

// ─── Primitive helpers ────────────────────────────────────────────────────────

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Must be a valid hex color (e.g. #fff or #ffffff)");

const oklchColor = z
  .string()
  .regex(/^oklch\(.*\)$/, "Must be a valid oklch() color string");

const semverString = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, "Must be a semver string (e.g. 1.0.0)");

// ─── Color ────────────────────────────────────────────────────────────────────

/**
 * A single color swatch: hex + OKLCH representations.
 */
const colorSwatchSchema = z.object({
  hex: hexColor,
  oklch: oklchColor,
});

/**
 * A full shade ramp. Keys are string step numbers (100-1600).
 * Each step has hex and oklch representations.
 */
const colorRampSchema = z.record(z.string(), colorSwatchSchema);

/**
 * Functional/status color ramps — fixed hues baked into the system.
 * Each palette uses named functional colors from the primitive library.
 */
const functionalRampsSchema = z.object({
  /** lima — green (success) */
  lima: colorRampSchema,
  /** cerulean — blue (info) */
  cerulean: colorRampSchema,
  /** caribbean — teal (info-secondary) */
  caribbean: colorRampSchema,
  /** candlelight — yellow (caution) */
  candlelight: colorRampSchema,
  /** cerise — pink (warning) */
  cerise: colorRampSchema,
  /** crimson — red (error) */
  crimson: colorRampSchema,
});

/**
 * Resolved primitive ramps stored in the config for portability.
 * Consumers (npm package, Figma plugin) don't need to re-run generation.
 */
const resolvedPrimitivesSchema = z.object({
  brand: colorRampSchema,
  /** The user-selected neutral preset ramp (dove, shark, flint, etc.) */
  neutral: colorRampSchema,
  /** black — universal dark ramp used for borders and text */
  black: colorRampSchema,
  /** white — universal light ramp used for text on dark surfaces */
  white: colorRampSchema,
  functional: functionalRampsSchema,
});

/**
 * A single mode's semantic color mapping.
 * Keys are semantic token paths (e.g. "color-surface.base"),
 * values are primitive references (e.g. "shark.1600").
 */
const semanticModeSchema = z.record(z.string(), z.string());

const colorSchema = z.object({
  /** The user's chosen brand color. */
  brandColor: z.object({
    hex: hexColor,
    oklch: oklchColor,
  }),
  /**
   * Which step of the brand ramp is used as the primary interactive color.
   * Defaults to "1200".
   */
  brandShade: z.string().default("1200"),
  /**
   * Identifier for the selected neutral preset.
   * Must be one of the named neutrals: dove, mythical, flint, waterloo,
   * stone, cave, juniper, battleship, squirrel, hemp, shark, mavic.
   */
  neutralPreset: z.string().min(1),
  /** Fully resolved primitive ramps — stored for downstream portability. */
  resolvedPrimitives: resolvedPrimitivesSchema,
  /**
   * Mode-keyed semantic assignments.
   * Arbitrary mode names are valid (light, dark, high-contrast, etc.).
   */
  modes: z.record(z.string(), semanticModeSchema),
});

// ─── Typography ──────────────────────────────────────────────────────────────

const fontWeightValue = z
  .number()
  .int("Font weight must be an integer")
  .min(100, "Font weight minimum is 100")
  .max(900, "Font weight maximum is 900")
  .multipleOf(100, "Font weight must be a multiple of 100");

const fontConfigSchema = z.object({
  /** Google Fonts family name. */
  family: z.string().min(1),
  /**
   * Semantic weight style names mapped to numeric values.
   * Only roles supported by the font are included.
   * The system recognizes: Regular, Emphasis (Medium), Strong (SemiBold), Heavy (Bold).
   */
  weights: z.record(z.string(), fontWeightValue),
});

/**
 * Type scale — stores resolved pixel values for each semantic step.
 * Step names match the token library: display-xlarge, display-large,
 * display-medium, heading-large, heading-medium, heading-small,
 * body-large, body-medium, body-small, caption.
 */
const typeScaleSchema = z.object({
  /** Base font size in pixels (anchors body-large). */
  base: z.number().positive("Base must be a positive number"),
  /** Scale ratio (stored as metadata; resolved step values are authoritative). */
  ratio: z.number().positive("Ratio must be a positive number"),
  /**
   * Resolved, rounded pixel values per semantic step.
   * e.g. { "body-large": 16, "heading-medium": 24, "display-large": 48 }
   */
  steps: z.record(z.string(), z.number().positive()),
  /**
   * Multiplier applied on top of the system's per-step line height ratios.
   * 1.0 = default system ratios. Range: 0.75 (tighter) – 1.5 (looser).
   */
  lineHeightScale: z.number().positive().default(1.0),
});

const typographySchema = z.object({
  headingFont: fontConfigSchema,
  bodyFont: fontConfigSchema,
  scale: typeScaleSchema,
});

// ─── Icons ────────────────────────────────────────────────────────────────────

/**
 * Icon configuration stored in the theme config.
 * Controls which library is active, which style is used, and whether
 * stroke weight is adjusted algorithmically to maintain optical consistency.
 */
const iconsSchema = z.object({
  /**
   * The icon library to use.
   * Each library is a peer dependency — install only the one selected.
   *   lucide    → lucide-react
   *   tabler    → @tabler/icons-react
   *   heroicons → @heroicons/react
   */
  library: z.enum(["lucide", "tabler", "heroicons"]),
  /**
   * Icon style preference.
   * Lucide only supports "outline". Tabler and Heroicons support both.
   */
  style: z.enum(["outline", "solid"]),
  /**
   * When true, stroke width is adjusted per size to maintain consistent
   * optical weight across icon sizes. Only applies to stroke/outline styles.
   * Formula: stroke = baseStroke × (size / baseSize)^0.50
   */
  strokeAdjustment: z.boolean(),
  /**
   * The reference/design size in pixels at which baseStroke is defined.
   * At this size no adjustment is applied. Defaults to 24.
   */
  baseSize: z.number().positive().default(24),
  /**
   * The stroke width at the reference size (baseSize).
   * Lucide and Tabler use 2. Adjust to match your chosen library's default.
   */
  baseStroke: z.number().positive().default(2),
});

// ─── Border Radius ────────────────────────────────────────────────────────────

/**
 * Named radius scale matching the token library (radius-01 through radius-12
 * plus radius-full). Values are pixel numbers.
 * The system provides defaults; users may override individual values.
 */
const borderRadiusSchema = z.object({
  "radius-01":  z.number().nonnegative(),
  "radius-02":  z.number().nonnegative(),
  "radius-03":  z.number().nonnegative(),
  "radius-04":  z.number().nonnegative(),
  "radius-05":  z.number().nonnegative(),
  "radius-06":  z.number().nonnegative(),
  "radius-07":  z.number().nonnegative(),
  "radius-08":  z.number().nonnegative(),
  "radius-09":  z.number().nonnegative(),
  "radius-10":  z.number().nonnegative(),
  "radius-11":  z.number().nonnegative(),
  "radius-12":  z.number().nonnegative(),
  "radius-full": z.number().nonnegative(),
});

// ─── Spacing ─────────────────────────────────────────────────────────────────

const spacingSchema = z.object({
  /**
   * Base unit in pixels. The full spacing scale is derived from this.
   * At 4px the scale matches the canonical system values exactly.
   */
  baseUnit: z.number().positive("Base unit must be a positive number"),
});

// ─── Metadata ────────────────────────────────────────────────────────────────

const metadataSchema = z.object({
  name: z.string().min(1, "Theme name is required"),
  schemaVersion: semverString,
  /** ISO 8601 timestamp — set on export. */
  timestamp: z.string().datetime().optional(),
});

// ─── Root ─────────────────────────────────────────────────────────────────────

export const themeConfigSchema = z.object({
  metadata: metadataSchema,
  color: colorSchema,
  typography: typographySchema,
  icons: iconsSchema,
  borderRadius: borderRadiusSchema,
  spacing: spacingSchema,
});

export type ThemeConfig = z.infer<typeof themeConfigSchema>;

/**
 * Validates an unknown value against the theme config schema.
 * Throws a descriptive error if validation fails.
 */
export function validateConfig(input: unknown): ThemeConfig {
  const result = themeConfigSchema.safeParse(input);
  if (!result.success) {
    const messages = result.error.errors
      .map((e) => `  • ${e.path.join(".")}: ${e.message}`)
      .join("\n");
    throw new Error(`Invalid theme config:\n${messages}`);
  }
  return result.data;
}
