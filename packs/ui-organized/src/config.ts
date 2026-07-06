import { z } from "zod";

/**
 * The UI Organized pack's opinionated config. Per `13-neutral-core.md` this lives
 * in the pack, NOT in `@ui-organized/schema` — the neutral core stores it
 * opaquely inside a `PackInstance.config` and the pack validates it here.
 */

/** The 12 named neutral presets. */
export const NEUTRAL_PRESETS = [
  "dove",
  "mythical",
  "flint",
  "waterloo",
  "stone",
  "cave",
  "juniper",
  "battleship",
  "squirrel",
  "hemp",
  "mavic",
  "shark",
] as const;

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Brand must be a hex color (e.g. #3355ff)");

export const UiOrganizedConfigSchema = z.object({
  /** One brand color input (hex). The full ramp is generated from it. */
  brand: hexColor,
  /** Selected neutral preset. */
  neutral: z.enum(NEUTRAL_PRESETS),
  typography: z
    .object({
      headingFont: z.string().default("Inter"),
      bodyFont: z.string().default("Inter"),
      /** Base font size in px (anchors body-large). */
      baseSize: z.number().positive().default(16),
      /** Type-scale ratio (input; rounded step values are authoritative). */
      ratio: z.number().positive().default(1.25),
    })
    .default({}),
  spacing: z.object({ baseUnit: z.number().positive().default(4) }).default({}),
  radius: z.object({ baseUnit: z.number().positive().default(4) }).default({}),
  elevation: z
    .object({
      subtle: z.number().min(0).max(1).default(0.08),
      medium: z.number().min(0).max(1).default(0.16),
    })
    .default({}),
});

export type UiOrganizedConfig = z.infer<typeof UiOrganizedConfigSchema>;
export type NeutralPreset = (typeof NEUTRAL_PRESETS)[number];

/** A ready-to-use default config (UI Organized's "start here" foundation). */
export const DEFAULT_CONFIG: UiOrganizedConfig = UiOrganizedConfigSchema.parse({
  brand: "#3355ff",
  neutral: "flint",
});
