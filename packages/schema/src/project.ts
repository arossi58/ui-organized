import { z } from "zod";
import { DtcgGroupSchema } from "./dtcg.js";

/**
 * The **project document** — the authoritative wrapper around a token project.
 *
 * Per `13-neutral-core.md` (which amends `02-schema.md`), the document has a
 * **neutral baseline** that is always present (`meta`, `sets`, `themes`,
 * `modes`) and **optional** parts that exist only when a generator pack is in
 * use (`packs`, `recipes`, `overrides`). A plain-DTCG user has none of the
 * optional parts, and such a document must be fully valid and round-trippable.
 *
 * The opinionated UI-Organized config does **not** live here — it lives inside
 * an optional `PackInstance.config`, validated by the pack's own schema in
 * `packs/ui-organized`. The neutral core never imports a pack.
 */

/** Current project-document schema version. */
export const SCHEMA_VERSION = "1.0.0";

// ─── Token sets ──────────────────────────────────────────────────────────────

/** A named set of DTCG tokens. Sets are merged in array order (precedence). */
export const TokenSetSchema = z.object({
  name: z.string().min(1),
  tokens: DtcgGroupSchema,
  $description: z.string().optional(),
  $extensions: z.record(z.string(), z.unknown()).optional(),
});
export type TokenSet = z.infer<typeof TokenSetSchema>;

// ─── Themes ──────────────────────────────────────────────────────────────────

/**
 * Per-set status within a theme. Mirrors Tokens Studio semantics so a TS file
 * round-trips: `source` sets contribute values but aren't exported, `enabled`
 * sets are active, `disabled` sets are excluded from resolution.
 */
export const ThemeSetStatusSchema = z.enum(["source", "enabled", "disabled"]);
export type ThemeSetStatus = z.infer<typeof ThemeSetStatusSchema>;

/** A named combination of set statuses. */
export const ThemeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  group: z.string().optional(),
  selectedTokenSets: z.record(z.string(), ThemeSetStatusSchema),
  $extensions: z.record(z.string(), z.unknown()).optional(),
});
export type Theme = z.infer<typeof ThemeSchema>;

// ─── Modes ───────────────────────────────────────────────────────────────────

/**
 * A named mode (e.g. `light`, `dark`, or any custom name). Modes affect semantic
 * mappings only; primitive ramps are mode-constant. The definition is an open
 * bag so packs/importers can attach mode metadata without schema changes.
 */
export const ModeDefinitionSchema = z
  .object({ $description: z.string().optional() })
  .passthrough();
export type ModeDefinition = z.infer<typeof ModeDefinitionSchema>;

/** Open map of mode name → definition. */
export const ModeMapSchema = z.record(z.string(), ModeDefinitionSchema);
export type ModeMap = z.infer<typeof ModeMapSchema>;

// ─── Generator packs (optional) ──────────────────────────────────────────────

/**
 * An installed generator pack and its pack-owned config. The core stores the
 * config opaquely (`unknown`); the pack validates it against its own schema.
 */
export const PackInstanceSchema = z.object({
  packId: z.string().min(1),
  config: z.unknown(),
});
export type PackInstance = z.infer<typeof PackInstanceSchema>;

/**
 * How a slice of `base` was produced, so regeneration knows what a generator
 * owns and what to reconcile. `inputs` is opaque to the core (the pack validates
 * it).
 */
export const GeneratorRecipeSchema = z.object({
  generator: z.string().min(1),
  packId: z.string().optional(),
  set: z.string().optional(),
  inputs: z.unknown(),
  outputPaths: z.array(z.string()),
});
export type GeneratorRecipe = z.infer<typeof GeneratorRecipeSchema>;

/**
 * The non-destructive override layer. Sparse, keyed by token path → a partial
 * bag of token-property deltas (e.g. `$value`, `$description`) from the
 * generated base. Stores only what the user changed.
 */
export const OverrideLayerSchema = z.record(
  z.string(),
  z.record(z.string(), z.unknown()),
);
export type OverrideLayer = z.infer<typeof OverrideLayerSchema>;

// ─── Metadata ────────────────────────────────────────────────────────────────

export const ProjectMetaSchema = z.object({
  name: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  schemaVersion: z.string(),
});
export type ProjectMeta = z.infer<typeof ProjectMetaSchema>;

// ─── Project document (root) ─────────────────────────────────────────────────

export const ProjectDocumentSchema = z.object({
  /** Document format version (mirrors `meta.schemaVersion`). */
  version: z.string(),
  meta: ProjectMetaSchema,

  // neutral baseline — always present
  sets: z.array(TokenSetSchema),
  themes: z.array(ThemeSchema),
  modes: ModeMapSchema,

  // optional — present only when a generator pack is active
  packs: z.array(PackInstanceSchema).optional(),
  recipes: z.array(GeneratorRecipeSchema).optional(),
  overrides: OverrideLayerSchema.optional(),
});
export type ProjectDocument = z.infer<typeof ProjectDocumentSchema>;
