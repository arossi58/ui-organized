/**
 * Component Manifest (COMPONENT-PLUGIN.md §3, Phase 2).
 *
 * The Analyzer's output: for every `@ui-organized/react` component, its inferred
 * Figma-property schema, derived by static analysis of the props interface — no
 * rendering. This populates the plugin's "select a component" list and tells the
 * renderer (Phase 3) which props are variant axes. Every classification here is a
 * *guess* and is overridable in the Phase 5 resolution UX (`PROP_KIND_AMBIGUOUS`).
 */

export type ManifestPropertyKind = "VARIANT" | "BOOLEAN" | "TEXT" | "INSTANCE_SWAP";

export interface ManifestProperty {
  name: string;
  kind: ManifestPropertyKind;
  /** Allowed values for a VARIANT axis (string-literal union members). */
  values?: string[];
  optional: boolean;
  /** Inferred default from JSDoc (`@default` / "Defaults to 'x'"), if any. */
  default?: string | boolean | null;
}

export interface ComponentManifestEntry {
  component: string;
  /** Repo-relative path to the file the props interface was read from. */
  file: string;
  propsInterface: string;
  /** sha256 over the component's source files — drift detection (Phase 6). */
  hash: string;
  properties: ManifestProperty[];
}

export interface ComponentManifest {
  source: string;
  componentCount: number;
  components: ComponentManifestEntry[];
}

/** The variant axes of an entry (VARIANT props), for quick display. */
export function variantAxes(entry: ComponentManifestEntry): ManifestProperty[] {
  return entry.properties.filter((p) => p.kind === "VARIANT");
}
