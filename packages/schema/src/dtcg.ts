import { z } from "zod";

/**
 * DTCG 2025.10 token format.
 *
 * This module is **neutral**: it describes the W3C Design Tokens format and
 * knows nothing about UI Organized, brand/neutral palettes, or any generator
 * pack. A plain DTCG file with zero `$extensions` must validate here.
 *
 * The schema is structural, not semantic. It validates the *shape* of a token
 * (that a `color` `$value` is a hex/structured color/reference, not a boolean),
 * but it does not resolve references, evaluate math, or detect cycles — that is
 * the resolver's job, which returns typed misses rather than throwing.
 */

// ─── $type union ───────────────────────────────────────────────────────────────

/** The DTCG `$type` values the design system supports. */
export const DTCG_TYPES = [
  // primitives
  "color",
  "dimension",
  "fontFamily",
  "fontWeight",
  "duration",
  "cubicBezier",
  "number",
  // composites
  "typography",
  "shadow",
  "border",
  "transition",
  "gradient",
  "strokeStyle",
] as const;

export const DtcgTypeSchema = z.enum(DTCG_TYPES);
export type DtcgType = z.infer<typeof DtcgTypeSchema>;

// ─── References & expressions ────────────────────────────────────────────────

/**
 * A `$value` string that contains at least one `{group.token}` alias — either a
 * bare reference (`"{color.brand}"`), a color modifier
 * (`"lighten({color.brand}, 0.1)"`), or a math expression (`"{spacing.base} * 2"`).
 *
 * Reference *validity as a string* is checked here; cycle detection, math
 * evaluation, and modifier semantics belong to the resolver.
 */
export const REFERENCE_PATTERN = /\{[^{}]+\}/;
const referenceOrExpression = z
  .string()
  .refine((s) => REFERENCE_PATTERN.test(s), {
    message: "Expected a reference like {group.token} or an expression containing one",
  });

// ─── Per-$type $value schemas ────────────────────────────────────────────────
//
// Every type also accepts `referenceOrExpression`, because any value may be an
// alias or an expression that resolves to that type.

const hexValue = z
  .string()
  .regex(
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
    "Must be a hex color (#rgb, #rgba, #rrggbb, or #rrggbbaa)",
  );

/** Structured DTCG 2025.10 color object. */
const colorObject = z
  .object({
    colorSpace: z.string(),
    components: z.array(z.union([z.number(), z.literal("none")])),
    alpha: z.number().min(0).max(1).optional(),
    hex: z.string().optional(),
  })
  .passthrough();

const colorValue = z.union([referenceOrExpression, hexValue, colorObject]);

/** DTCG 2025.10 dimension is `{ value, unit }` with unit px|rem; strings tolerated. */
const dimensionObject = z
  .object({ value: z.number(), unit: z.enum(["px", "rem"]) })
  .passthrough();
const dimensionString = z
  .string()
  .regex(
    /^-?(\d+\.?\d*|\.\d+)(px|rem|em|%|vh|vw|vmin|vmax|ch|pt|pc|cm|mm|in|ex|fr)?$/,
    "Must be a dimension like 16px, 1rem, or 50%",
  );
const dimensionValue = z.union([referenceOrExpression, dimensionObject, dimensionString]);

const fontFamilyValue = z.union([
  referenceOrExpression,
  z.string().min(1),
  z.array(z.string().min(1)),
]);

const FONT_WEIGHT_KEYWORDS = [
  "thin",
  "hairline",
  "extra-light",
  "ultra-light",
  "light",
  "normal",
  "regular",
  "medium",
  "semi-bold",
  "demi-bold",
  "bold",
  "extra-bold",
  "ultra-bold",
  "black",
  "heavy",
  "extra-black",
  "ultra-black",
] as const;
const fontWeightValue = z.union([
  referenceOrExpression,
  z.number().int().min(1).max(1000),
  z.enum(FONT_WEIGHT_KEYWORDS),
]);

const durationObject = z
  .object({ value: z.number(), unit: z.enum(["ms", "s"]) })
  .passthrough();
const durationString = z
  .string()
  .regex(/^-?(\d+\.?\d*|\.\d+)(ms|s)$/, "Must be a duration like 200ms or 0.2s");
const durationValue = z.union([referenceOrExpression, durationObject, durationString]);

const cubicBezierValue = z.union([
  referenceOrExpression,
  z.tuple([z.number(), z.number(), z.number(), z.number()]),
]);

const numberValue = z.union([referenceOrExpression, z.number()]);

// Composites — each sub-field may itself be a reference/expression.

const lineHeightValue = z.union([referenceOrExpression, z.number(), dimensionString]);

const typographyValue = z.union([
  referenceOrExpression,
  z
    .object({
      fontFamily: fontFamilyValue,
      fontSize: dimensionValue,
      fontWeight: fontWeightValue,
      lineHeight: lineHeightValue,
      letterSpacing: dimensionValue.optional(),
    })
    .passthrough(),
]);

const shadowObject = z
  .object({
    color: colorValue,
    offsetX: dimensionValue,
    offsetY: dimensionValue,
    blur: dimensionValue,
    spread: dimensionValue.optional(),
    inset: z.boolean().optional(),
  })
  .passthrough();
const shadowValue = z.union([referenceOrExpression, shadowObject, z.array(shadowObject)]);

const borderValue = z.union([
  referenceOrExpression,
  z
    .object({
      color: colorValue,
      width: dimensionValue,
      style: z.union([referenceOrExpression, z.string()]),
    })
    .passthrough(),
]);

const transitionValue = z.union([
  referenceOrExpression,
  z
    .object({
      duration: durationValue,
      delay: durationValue.optional(),
      timingFunction: cubicBezierValue,
    })
    .passthrough(),
]);

const gradientStop = z
  .object({
    color: colorValue,
    position: z.union([referenceOrExpression, z.number().min(0).max(1)]),
  })
  .passthrough();
const gradientValue = z.union([referenceOrExpression, z.array(gradientStop)]);

const STROKE_STYLE_KEYWORDS = [
  "solid",
  "dashed",
  "dotted",
  "double",
  "groove",
  "ridge",
  "outset",
  "inset",
] as const;
const strokeStyleValue = z.union([
  referenceOrExpression,
  z.enum(STROKE_STYLE_KEYWORDS),
  z
    .object({
      dashArray: z.array(dimensionValue),
      lineCap: z.enum(["round", "butt", "square"]),
    })
    .passthrough(),
]);

/** Maps each `$type` to the Zod schema that validates its `$value`. */
const VALUE_SCHEMAS: Record<DtcgType, z.ZodTypeAny> = {
  color: colorValue,
  dimension: dimensionValue,
  fontFamily: fontFamilyValue,
  fontWeight: fontWeightValue,
  duration: durationValue,
  cubicBezier: cubicBezierValue,
  number: numberValue,
  typography: typographyValue,
  shadow: shadowValue,
  border: borderValue,
  transition: transitionValue,
  gradient: gradientValue,
  strokeStyle: strokeStyleValue,
};

/** Returns the `$value` schema for a given `$type` (used by the resolver/tests). */
export function valueSchemaForType(type: DtcgType): z.ZodTypeAny {
  return VALUE_SCHEMAS[type];
}

// ─── $extensions ──────────────────────────────────────────────────────────────

/** Open `$extensions` bag, keyed by reverse-DNS / pack id. Always optional. */
export const ExtensionsSchema = z.record(z.string(), z.unknown());

// ─── Token & group ───────────────────────────────────────────────────────────

/**
 * A DTCG token. `$value` is required; its presence is what distinguishes a token
 * from a group. `$type` may be omitted on the token and inherited from an
 * ancestor group — when it *is* present, `$value` is validated against it.
 */
export type DtcgToken = {
  $value: unknown;
  $type?: DtcgType;
  $description?: string;
  $extensions?: Record<string, unknown>;
};

export const DtcgTokenSchema = z
  .object({
    // z.unknown() is treated as optional by Zod; presence is enforced below so
    // that groups (which never carry $value) fall through to the group schema.
    $value: z.unknown(),
    $type: DtcgTypeSchema.optional(),
    $description: z.string().optional(),
    $extensions: ExtensionsSchema.optional(),
  })
  .passthrough()
  .superRefine((token, ctx) => {
    if (!("$value" in token)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A token must have a $value",
        path: ["$value"],
      });
      return;
    }
    const type = token.$type;
    if (type) {
      const result = VALUE_SCHEMAS[type].safeParse(token.$value);
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({ ...issue, path: ["$value", ...issue.path] });
        }
      }
    }
  });

/**
 * A DTCG group: a nested object of tokens/groups, optionally carrying its own
 * `$type` (inherited by descendants), `$description`, and `$extensions`.
 */
export interface DtcgGroup {
  $type?: DtcgType;
  $description?: string;
  $extensions?: Record<string, unknown>;
  [child: string]: DtcgNode | DtcgType | string | Record<string, unknown> | undefined;
}

export type DtcgNode = DtcgToken | DtcgGroup;

// Recursive schemas: the runtime is correct, but the inferred Zod output type
// (where `$value`/`$type` are widened with `undefined`) does not line up with
// the hand-written recursive types under `exactOptionalPropertyTypes`. Cast the
// lazy wrappers to the intended public types.
export const DtcgNodeSchema = z.lazy(() =>
  z.union([DtcgTokenSchema, DtcgGroupSchema]),
) as unknown as z.ZodType<DtcgNode>;

export const DtcgGroupSchema = z.lazy(() =>
  z
    .object({
      $type: DtcgTypeSchema.optional(),
      $description: z.string().optional(),
      $extensions: ExtensionsSchema.optional(),
    })
    .catchall(DtcgNodeSchema),
) as unknown as z.ZodType<DtcgGroup>;

/** A DTCG document is just the root group of a token file. */
export const DtcgDocumentSchema = DtcgGroupSchema;
export type DtcgDocument = DtcgGroup;

// ─── Name validation (export-time, for Figma variables) ──────────────────────

/**
 * Characters Figma forbids in variable names. DTCG *paths* may contain `.`
 * internally (paths are structural); this guard is applied at export time when a
 * token path is flattened into a Figma variable name.
 */
export const FIGMA_FORBIDDEN_NAME_CHARS = /[.{}]/;

/** True when `name` is safe to use as a Figma variable name segment. */
export function isFigmaSafeName(name: string): boolean {
  return name.length > 0 && !FIGMA_FORBIDDEN_NAME_CHARS.test(name);
}
