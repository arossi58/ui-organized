import type { ZodTypeAny } from "zod";
import type { DtcgGroup } from "./dtcg.js";
import type { GeneratorRecipe } from "./project.js";

/**
 * Generator-pack interfaces — the contract a pack (e.g. `packs/ui-organized`)
 * implements. These are **types only**; the neutral core defines the shape but
 * never imports a pack. Packs depend on the core; the dependency arrow points
 * one way (enforced by an import-boundary lint, see `13-neutral-core.md`).
 *
 * A generator emits **plain DTCG** the user owns, plus a recipe for
 * non-destructive regeneration. Provenance lives in `$extensions.<packId>` and
 * is optional — removing it only disables regeneration.
 */

/** A fragment of DTCG written into a set by a generator. The user owns it. */
export type DtcgFragment = DtcgGroup;

/**
 * Context handed to a generator at run time. Intentionally minimal for now;
 * extended in Phase 3 (resolver access, existing tokens, etc.).
 */
export interface GeneratorContext {
  /** Id of the pack instance requesting generation. */
  packId: string;
  /** Names of the modes currently defined on the document. */
  modes: string[];
}

export interface GeneratorOutput {
  /** Plain DTCG written into a set. */
  tokens: DtcgFragment;
  /** Provenance describing what this generator owns, for regeneration. */
  recipe: GeneratorRecipe;
}

export interface Generator {
  id: string;
  name: string;
  /** Validates this generator's inputs (pack-owned). */
  inputSchema: ZodTypeAny;
  run(inputs: unknown, ctx: GeneratorContext): GeneratorOutput;
}

export interface GeneratorPack {
  id: string;
  name: string;
  /** Validates the pack-owned opinionated config (`PackInstance.config`). */
  configSchema: ZodTypeAny;
  generators: Generator[];
}
