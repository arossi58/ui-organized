/**
 * @ui-organized/resolver — the single deterministic DTCG resolution engine.
 *
 * One resolver, three consumers: the editor, the Figma plugin, and the MCP
 * server all import `resolve`/`resolveToken` from here. It is pure TypeScript
 * with no DOM, framework, or I/O, so the same document and mode always produce
 * the same output. Every lookup returns a resolved value or a typed miss — never
 * a silent fallback.
 */

// Core resolution
export { resolve, resolveToken } from "./resolve.js";

// Set merge → effective document
export {
  flattenSet,
  mergeSets,
  selectActiveSets,
  selectSetsForMode,
  mergeProjectDocument,
} from "./merge.js";

// Dependency graph (editor dep view)
export { buildGraph, findCycles } from "./graph.js";

// Reference parsing
export { parseReferences, asPureReference, containsReference } from "./references.js";

// Expression evaluation (exposed for reuse/testing)
export { evaluateExpression, looksLikeExpression, type EvalResult } from "./math.js";

// Color parsing + OKLCH modifiers
export {
  parseColor,
  parseColorModifier,
  toResolvedColor,
  splitHexAlpha,
  lighten,
  darken,
  withAlpha,
  mix,
  type ColorValue,
  type ColorModifierCall,
  type ColorModifierFn,
} from "./color.js";

// Types
export {
  isResolveMiss,
  type EffectiveDocument,
  type EffectiveToken,
  type ResolvedColor,
  type ResolvedDimension,
  type ResolvedValue,
  type TokenResolution,
  type ResolveMiss,
  type ResolveMissKind,
  type ResolveResult,
  type ResolveOptions,
  type DependencyNode,
  type DependencyGraph,
} from "./types.js";
