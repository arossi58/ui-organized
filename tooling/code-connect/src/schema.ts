/**
 * Manifest Schema — the Source of Truth.
 *
 * This is the contract every other piece (scanner, MCP server, and — later — the
 * Figma plugin) reads and writes against. Treat it as frozen: additive fields are
 * safe, removals/renames require a `manifestVersion` bump.
 *
 * Key architectural rule: a Figma node stores only a *pointer*
 * (the component key). The real mapping lives here, in git, so it stays diffable
 * and PR-reviewable and the two systems never drift independently.
 */

/** Bump on any removal/rename of a field. Additive changes keep the same version. */
export const MANIFEST_VERSION = 1 as const;

/**
 * Frameworks a mapping can target. `react`, `svelte`, `vue` and `angular` are the
 * ones the docs site can render a code sample for — see `DOC_FRAMEWORKS` in
 * frameworks.ts, which is checked against this union at compile time.
 */
export type Framework = "react" | "svelte" | "vue" | "angular" | "swiftui" | "compose";

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
   * Figma's stable component (set) key. Written by `pnpm figma:sync` from the
   * library file; empty until then.
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
  /**
   * For a Svelte, Vue or Angular entry: the React export it implements
   * (`UioButton` → `Button`). Figma keys and usage guides live on the React
   * entry, so this is how a framework entry finds them. Absent for React, and
   * for an export React doesn't have.
   */
  reactName?: string;
  props: PropDefinition[];
  /**
   * What the named types in `props` are, written out one level deep, by name:
   * `{ SelectOption: "{ value: string; label: string; disabled?: boolean }" }`.
   * Only the library's own types (and its cores'): React's, the DOM's and other
   * packages' stay names. Types a shape names are listed too, within a size
   * budget and each once, so a recursive type refers back to its own entry.
   *
   * Not part of `propSignatureHash`. It describes the props rather than being
   * one, and a hash that moved whenever an option type gained a field would
   * mark the component stale without any of its props changing.
   */
  referencedTypes?: Record<string, string>;
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
 * The on-disk shape of `manifest/components.json`. Wrapped rather than a bare
 * array of entries so the file can carry a `manifestVersion` from day one, rather
 * than retrofitting it once external manifests exist.
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
 * live re-scan on every request. Keyed by {@link entryId}
 * (`codePath::codeName`).
 *
 * `hashes` alone answers "is it stale?" (a hash compare). `props` additionally
 * carries the current prop set so a stale mapping's "what changed" diff can
 * be computed without re-scanning — the plugin (no code access) relies on this.
 */
export interface LatestHashes {
  generatedAt: string;
  hashes: Record<string, string>;
  props?: Record<string, PropDefinition[]>;
}

// ─── MCP tool I/O contracts ───────────────────────────────────────────────────

/** Deterministic, not vibes-based — see confidence.ts. */
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
  /** Always populated when `found=false` or `confidence !== "exact"`. */
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
