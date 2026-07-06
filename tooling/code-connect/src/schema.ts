/**
 * Manifest Schema — the Source of Truth (Connect.md §3).
 *
 * This is the contract every other piece (scanner, MCP server, and — later — the
 * Figma plugin) reads and writes against. Treat it as frozen: additive fields are
 * safe, removals/renames require a `manifestVersion` bump (Connect.md §13.3).
 *
 * Key architectural rule (Connect.md §1): a Figma node stores only a *pointer*
 * (the component key). The real mapping lives here, in git, so it stays diffable
 * and PR-reviewable and the two systems never drift independently.
 */

/** Bump on any removal/rename of a field. Additive changes keep the same version. */
export const MANIFEST_VERSION = 1 as const;

export type Framework = "react" | "angular" | "swiftui" | "compose";

/** Lifecycle of a code component's mapping entry. */
export type ComponentStatus = "active" | "deprecated" | "draft";

export interface PropDefinition {
  name: string;
  /** TS type text as written in source, e.g. `"sm" | "md" | "lg"`. */
  type: string;
  required: boolean;
  defaultValue?: string;
  /** Which Figma variant property this maps to, if any (set by the plugin). */
  figmaVariantMapping?: string;
  description?: string;
}

export interface ComponentManifestEntry {
  /**
   * Figma's stable component key (survives file changes) — the pointer written
   * into the Figma node's pluginData. Empty string until a designer links this
   * code component to a Figma component via the plugin (Connect.md §4.1).
   */
  figmaComponentKey: string;
  /** Human-readable Figma component name, for search/debugging. */
  figmaComponentName: string;
  /**
   * The exported code symbol this entry maps to, e.g. `Button` or `CardHeader`.
   * The stable code-side identity — several components can share one source file
   * (Card / CardHeader / CardBody all live in Card.types.ts), so `codePath` alone
   * is not unique. This is exactly the name in `importStatement`.
   */
  codeName: string;
  /** Repo-relative path, e.g. `packages/react/src/components/Button/Button.types.ts`. */
  codePath: string;
  framework: Framework;
  /** e.g. `import { Button } from '@ui-organized/react';` */
  importStatement: string;
  /** Angular selector, if applicable. Absent for React. */
  selector?: string;
  props: PropDefinition[];
  /** Canonical real-world usage example. */
  usageSnippet: string;
  /** Prop patterns, a11y notes, team conventions the agent should honor. */
  customInstructions?: string;
  /** Hash of `props` — the staleness signal. See {@link hashProps}. */
  propSignatureHash: string;
  /** ISO timestamp, set by the scanner on each write. */
  lastSyncedAt: string;
  /** Who/what last confirmed this mapping is correct. */
  lastVerifiedBy?: string;
  status: ComponentStatus;
}

/**
 * The on-disk shape of `manifest/components.json`. Connect.md §3 describes a bare
 * array; we wrap it so the file can carry a `manifestVersion` (§13.3) from day one
 * rather than retrofitting it once external manifests exist.
 */
export interface ComponentManifest {
  manifestVersion: number;
  generatedAt: string;
  components: ComponentManifestEntry[];
}

/**
 * Stable identity of a manifest entry on the code side: `codePath::codeName`.
 * Used to key the manifest during reconcile and the latest-hashes map — since one
 * source file can declare several exported components.
 */
export function entryId(codePath: string, codeName: string): string {
  return `${codePath}::${codeName}`;
}

/**
 * `manifest/latest-hashes.json` — the latest scan result, published by the scanner
 * on every run so the plugin and MCP server can detect drift cheaply, without a
 * live re-scan on every request (Connect.md §8). Keyed by {@link entryId}
 * (`codePath::codeName`).
 *
 * `hashes` alone answers "is it stale?" (a hash compare). `props` additionally
 * carries the current prop set so a stale mapping's "what changed" diff (§4.4) can
 * be computed without re-scanning — the plugin (no code access) relies on this.
 */
export interface LatestHashes {
  generatedAt: string;
  hashes: Record<string, string>;
  props?: Record<string, PropDefinition[]>;
}

// ─── MCP tool I/O contracts (Connect.md §6.2) ─────────────────────────────────

/** Deterministic, not vibes-based — see confidence.ts and Connect.md §6.5. */
export type Confidence = "exact" | "fuzzy" | "none";

export interface Staleness {
  isStale: boolean;
  /** Prop names added/removed/changed since `lastSyncedAt`. Populated on demand. */
  changedProps?: string[];
  lastVerified: string;
}

/** `get_component_context` — the core tool. */
export interface GetComponentContextInput {
  figmaNodeId?: string;
  figmaComponentKey?: string;
}

export interface GetComponentContextOutput {
  found: boolean;
  confidence: Confidence;
  entry?: ComponentManifestEntry;
  staleness?: Staleness;
  /** Always populated when `found=false` or `confidence !== "exact"` (§6.4). */
  warning?: string;
}

/** `search_components`. */
export interface SearchComponentsInput {
  query: string;
  framework?: Framework;
  status?: ComponentStatus;
}

export interface SearchResult {
  componentKey: string;
  name: string;
  codePath: string;
  confidence: Confidence;
  /** Similarity score [0,1] for fuzzy matches — surfaced so callers can judge. */
  score?: number;
}

export interface SearchComponentsOutput {
  results: SearchResult[];
}

/** `validate_mapping`. */
export interface ValidateMappingInput {
  figmaComponentKey: string;
}

export interface PropDiff {
  name: string;
  change: "added" | "removed" | "type-changed" | "required-changed";
  before?: string;
  after?: string;
}

export interface ValidateMappingOutput {
  isValid: boolean;
  currentHash: string;
  storedHash: string;
  diff?: PropDiff[];
  warning?: string;
}

/** `list_stale`. */
export interface ListStaleOutput {
  staleEntries: Array<{
    componentKey: string;
    name: string;
    codePath: string;
    lastSyncedAt: string;
  }>;
}
