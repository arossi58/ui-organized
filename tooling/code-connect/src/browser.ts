/**
 * Browser-safe entry point for `@ui-organized/code-connect` — everything here is
 * free of Node imports (`node:fs`, `typescript`, the scanner), so it can be
 * bundled into the Figma plugin's iframe UI.
 *
 * Import via `@ui-organized/code-connect/browser`. The Node-only surface (scanner,
 * MCP server, manifest loader) is NOT re-exported here.
 */

export type {
  ComponentManifest,
  ComponentManifestEntry,
  LatestHashes,
  PropDefinition,
  PropDiff,
  Framework,
  ComponentStatus,
  Confidence,
  Staleness,
  GetComponentContextOutput,
  SearchComponentsInput,
  SearchResult,
} from "./schema.js";
export { MANIFEST_VERSION, entryId } from "./schema.js";
export { PLUGIN_DATA_KEYS } from "./constants.js";
export { diffProps, changedPropNames } from "./prop-diff.js";
export { computeStalenessCore } from "./staleness-core.js";
export { similarity, searchEntries, FUZZY_THRESHOLD } from "./mcp/confidence.js";
export {
  ANNOTATION_MARKER,
  needsAnnotation,
  buildAnnotation,
  hasAnnotation,
  type AnnotationInput,
} from "./flagging/annotation.js";
export {
  MappingWarningsCollector,
  type MappingWarning,
  type MappingWarningsLog,
  type WarningResolution,
} from "./flagging/warnings-log.js";
export {
  contextForEntry,
  missingInput,
  noMatchForKey,
  unresolvableNode,
} from "./serialize-core.js";
