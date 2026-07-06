import type { DtcgGroup, GeneratorContext, GeneratorRecipe } from "@ui-organized/schema";
import type { UiOrganizedConfig } from "./config.js";
import {
  brandPaletteGenerator,
  elevationGenerator,
  neutralPresetGenerator,
  radiusGenerator,
  spacingGenerator,
  typeScaleGenerator,
} from "./generators.js";

/** The pack id used as the provenance namespace (`$extensions["ui-organized"]`). */
export const PACK_ID = "ui-organized";

export interface Foundation {
  /** Merged plain DTCG written into a set. */
  tokens: DtcgGroup;
  /** One recipe per generator, for non-destructive regeneration. */
  recipes: GeneratorRecipe[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...a };
  for (const [key, value] of Object.entries(b)) {
    const existing = out[key];
    out[key] = isPlainObject(value) && isPlainObject(existing) ? deepMerge(existing, value) : value;
  }
  return out;
}

/**
 * Runs every generator from one config and merges the results into a single DTCG
 * tree plus the list of recipes. This is what the editor writes into the
 * foundation set on "Generate foundation" / "Regenerate".
 */
export function generateFoundation(config: UiOrganizedConfig, packId: string = PACK_ID): Foundation {
  const ctx: GeneratorContext = { packId, modes: [] };
  const outputs = [
    brandPaletteGenerator.run({ brand: config.brand }, ctx),
    neutralPresetGenerator.run({ neutral: config.neutral }, ctx),
    typeScaleGenerator.run(
      { baseSize: config.typography.baseSize, ratio: config.typography.ratio },
      ctx,
    ),
    spacingGenerator.run({ baseUnit: config.spacing.baseUnit }, ctx),
    radiusGenerator.run({ baseUnit: config.radius.baseUnit }, ctx),
    elevationGenerator.run(
      { subtle: config.elevation.subtle, medium: config.elevation.medium },
      ctx,
    ),
  ];

  let tokens: Record<string, unknown> = {};
  const recipes: GeneratorRecipe[] = [];
  for (const output of outputs) {
    tokens = deepMerge(tokens, output.tokens as unknown as Record<string, unknown>);
    recipes.push(output.recipe);
  }

  return { tokens: tokens as DtcgGroup, recipes };
}
