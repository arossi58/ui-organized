// ─── Legacy UI-Organized theme config (deprecated) ───────────────────────────
// Nothing reads it any more: @ui-organized/react-vite 3 builds from the Theme
// Builder's DTCG theme.json, and apps/builder lists this package but never
// imports it. Removed in the next major. The token-manager's opinionated config
// lives in packs/ui-organized.
export { themeConfigSchema, validateConfig } from "./themeConfig.js";
export type { ThemeConfig } from "./themeConfig.js";

// ─── DTCG 2025.10 (neutral) ──────────────────────────────────────────────────
export {
  DTCG_TYPES,
  DtcgTypeSchema,
  DtcgTokenSchema,
  DtcgGroupSchema,
  DtcgNodeSchema,
  DtcgDocumentSchema,
  ExtensionsSchema,
  REFERENCE_PATTERN,
  FIGMA_FORBIDDEN_NAME_CHARS,
  valueSchemaForType,
  isFigmaSafeName,
} from "./dtcg.js";
export type { DtcgType, DtcgToken, DtcgGroup, DtcgNode, DtcgDocument } from "./dtcg.js";

// ─── Project document (neutral wrapper) ──────────────────────────────────────
export {
  SCHEMA_VERSION,
  TokenSetSchema,
  ThemeSchema,
  ThemeSetStatusSchema,
  ModeDefinitionSchema,
  ModeMapSchema,
  PackInstanceSchema,
  GeneratorRecipeSchema,
  OverrideLayerSchema,
  ProjectMetaSchema,
  ProjectDocumentSchema,
} from "./project.js";
export type {
  TokenSet,
  Theme,
  ThemeSetStatus,
  ModeDefinition,
  ModeMap,
  PackInstance,
  GeneratorRecipe,
  OverrideLayer,
  ProjectMeta,
  ProjectDocument,
} from "./project.js";

// ─── Parsing + migration ─────────────────────────────────────────────────────
export {
  parseProjectDocument,
  assertProjectDocument,
  migrateProjectDocument,
} from "./parse.js";
export type { Result } from "./parse.js";

// ─── Provenance ($extensions.<packId>) ───────────────────────────────────────
export { ProvenanceSchema, getProvenance } from "./extensions.js";
export type { Provenance } from "./extensions.js";

// ─── Generator-pack interfaces (implemented by packs/*, never imported here) ──
export type {
  GeneratorPack,
  Generator,
  GeneratorOutput,
  GeneratorContext,
  DtcgFragment,
} from "./pack.js";
