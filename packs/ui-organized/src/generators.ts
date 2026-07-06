import { z } from "zod";
import {
  generateColorRamp,
  getNeutralPreset,
  calculateTypeScale,
  generateSpacingScale,
} from "@ui-organized/utils";
import type {
  DtcgFragment,
  DtcgToken,
  Generator,
  GeneratorContext,
  GeneratorOutput,
  GeneratorRecipe,
} from "@ui-organized/schema";
import { NEUTRAL_PRESETS } from "./config.js";

/**
 * The six UI Organized generators. Each emits **plain DTCG** (the user owns it)
 * plus a `GeneratorRecipe`, attaching optional, removable provenance under
 * `$extensions[packId]`. Color/typescale/spacing math is reused from
 * `@ui-organized/utils`; the opinionated choices live here.
 */

function provenance(
  packId: string,
  generatedBy: string,
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  return { [packId]: { generatedBy, ...extra } };
}

function token(value: unknown, ext: Record<string, unknown>): DtcgToken {
  return { $value: value, $extensions: ext };
}

const hexColor = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);

// ─── Brand palette ─────────────────────────────────────────────────────────

const brandInput = z.object({ brand: hexColor });

export const brandPaletteGenerator: Generator = {
  id: "brand-palette",
  name: "Brand palette",
  inputSchema: brandInput,
  run(rawInputs: unknown, ctx: GeneratorContext): GeneratorOutput {
    const { brand } = brandInput.parse(rawInputs);
    const ramp = generateColorRamp(brand);
    const group: Record<string, unknown> = { $type: "color" };
    const outputPaths: string[] = [];
    for (const [step, swatch] of Object.entries(ramp)) {
      group[step] = token(
        swatch.hex,
        provenance(ctx.packId, "brand-palette", { ramp: { family: "brand", step: Number(step) } }),
      );
      outputPaths.push(`color.brand.${step}`);
    }
    const tokens = { color: { brand: group } } as unknown as DtcgFragment;
    const recipe: GeneratorRecipe = {
      generator: "brand-palette",
      packId: ctx.packId,
      inputs: { brand },
      outputPaths,
    };
    return { tokens, recipe };
  },
};

// ─── Neutral preset ────────────────────────────────────────────────────────

const neutralInput = z.object({ neutral: z.enum(NEUTRAL_PRESETS) });

export const neutralPresetGenerator: Generator = {
  id: "neutral-preset",
  name: "Neutral preset",
  inputSchema: neutralInput,
  run(rawInputs: unknown, ctx: GeneratorContext): GeneratorOutput {
    const { neutral } = neutralInput.parse(rawInputs);
    const ramp = getNeutralPreset(neutral);
    const group: Record<string, unknown> = { $type: "color" };
    const outputPaths: string[] = [];
    for (const [step, swatch] of Object.entries(ramp)) {
      group[step] = token(
        swatch.hex,
        provenance(ctx.packId, "neutral-preset", { ramp: { family: "neutral", step: Number(step) } }),
      );
      outputPaths.push(`color.neutral.${step}`);
    }
    const tokens = { color: { neutral: group } } as unknown as DtcgFragment;
    const recipe: GeneratorRecipe = {
      generator: "neutral-preset",
      packId: ctx.packId,
      inputs: { neutral },
      outputPaths,
    };
    return { tokens, recipe };
  },
};

// ─── Typescale ─────────────────────────────────────────────────────────────

const typeInput = z.object({ baseSize: z.number().positive(), ratio: z.number().positive() });

export const typeScaleGenerator: Generator = {
  id: "typescale",
  name: "Type scale",
  inputSchema: typeInput,
  run(rawInputs: unknown, ctx: GeneratorContext): GeneratorOutput {
    const { baseSize, ratio } = typeInput.parse(rawInputs);
    const sizes = calculateTypeScale(baseSize, ratio);
    const group: Record<string, unknown> = { $type: "dimension" };
    const outputPaths: string[] = [];
    for (const [step, px] of Object.entries(sizes)) {
      group[step] = token(`${Math.round(px)}px`, provenance(ctx.packId, "typescale", { step }));
      outputPaths.push(`font.size.${step}`);
    }
    const tokens = { font: { size: group } } as unknown as DtcgFragment;
    const recipe: GeneratorRecipe = {
      generator: "typescale",
      packId: ctx.packId,
      inputs: { baseSize, ratio },
      outputPaths,
    };
    return { tokens, recipe };
  },
};

// ─── Spacing ───────────────────────────────────────────────────────────────

const spacingInput = z.object({ baseUnit: z.number().positive() });

export const spacingGenerator: Generator = {
  id: "spacing",
  name: "Spacing scale",
  inputSchema: spacingInput,
  run(rawInputs: unknown, ctx: GeneratorContext): GeneratorOutput {
    const { baseUnit } = spacingInput.parse(rawInputs);
    const scale = generateSpacingScale(baseUnit);
    const group: Record<string, unknown> = { $type: "dimension" };
    const outputPaths: string[] = [];
    for (const [step, px] of Object.entries(scale)) {
      group[step] = token(`${px}px`, provenance(ctx.packId, "spacing", { step }));
      outputPaths.push(`spacing.${step}`);
    }
    const tokens = { spacing: group } as unknown as DtcgFragment;
    const recipe: GeneratorRecipe = {
      generator: "spacing",
      packId: ctx.packId,
      inputs: { baseUnit },
      outputPaths,
    };
    return { tokens, recipe };
  },
};

// ─── Radius ────────────────────────────────────────────────────────────────

const radiusInput = z.object({ baseUnit: z.number().positive() });
const RADIUS_MULTIPLIERS: Record<string, number> = {
  "radius-01": 0.5,
  "radius-02": 1,
  "radius-03": 1.5,
  "radius-04": 2,
  "radius-05": 3,
  "radius-06": 4,
};

export const radiusGenerator: Generator = {
  id: "radius",
  name: "Radius scale",
  inputSchema: radiusInput,
  run(rawInputs: unknown, ctx: GeneratorContext): GeneratorOutput {
    const { baseUnit } = radiusInput.parse(rawInputs);
    const group: Record<string, unknown> = { $type: "dimension" };
    const outputPaths: string[] = [];
    for (const [name, multiplier] of Object.entries(RADIUS_MULTIPLIERS)) {
      group[name] = token(`${baseUnit * multiplier}px`, provenance(ctx.packId, "radius", { step: name }));
      outputPaths.push(`radius.${name}`);
    }
    group["radius-full"] = token("9999px", provenance(ctx.packId, "radius", { step: "radius-full" }));
    outputPaths.push("radius.radius-full");
    const tokens = { radius: group } as unknown as DtcgFragment;
    const recipe: GeneratorRecipe = {
      generator: "radius",
      packId: ctx.packId,
      inputs: { baseUnit },
      outputPaths,
    };
    return { tokens, recipe };
  },
};

// ─── Elevation ─────────────────────────────────────────────────────────────

const elevationInput = z.object({
  subtle: z.number().min(0).max(1),
  medium: z.number().min(0).max(1),
});

function alphaHex(opacity: number): string {
  return Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");
}

export const elevationGenerator: Generator = {
  id: "elevation",
  name: "Elevation",
  inputSchema: elevationInput,
  run(rawInputs: unknown, ctx: GeneratorContext): GeneratorOutput {
    const { subtle, medium } = elevationInput.parse(rawInputs);
    const group: Record<string, unknown> = { $type: "shadow" };
    group.subtle = token(
      { color: `#000000${alphaHex(subtle)}`, offsetX: "0px", offsetY: "1px", blur: "2px", spread: "0px" },
      provenance(ctx.packId, "elevation", { level: "subtle" }),
    );
    group.medium = token(
      { color: `#000000${alphaHex(medium)}`, offsetX: "0px", offsetY: "2px", blur: "4px", spread: "0px" },
      provenance(ctx.packId, "elevation", { level: "medium" }),
    );
    const tokens = { elevation: group } as unknown as DtcgFragment;
    const recipe: GeneratorRecipe = {
      generator: "elevation",
      packId: ctx.packId,
      inputs: { subtle, medium },
      outputPaths: ["elevation.subtle", "elevation.medium"],
    };
    return { tokens, recipe };
  },
};

/** All UI Organized generators, in foundation order. */
export const generators: Generator[] = [
  brandPaletteGenerator,
  neutralPresetGenerator,
  typeScaleGenerator,
  spacingGenerator,
  radiusGenerator,
  elevationGenerator,
];
