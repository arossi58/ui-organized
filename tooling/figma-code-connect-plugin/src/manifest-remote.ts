/**
 * Pure manifest mutation (Connect.md §4.4, §4.6). Parse the manifest fetched from
 * GitHub, apply a mapping to one entry, and re-serialize with the SAME formatting
 * the scanner uses (2-space indent, trailing newline) so the PR diff is minimal
 * and reviewable — only the mapped fields change.
 *
 * No Figma or network imports, so it's fully unit-testable.
 */

import { entryId, type ComponentManifest, type ComponentManifestEntry } from "@ui-organized/code-connect/browser";

export function parseManifest(text: string): ComponentManifest {
  const parsed = JSON.parse(text) as ComponentManifest;
  if (!parsed || !Array.isArray(parsed.components)) {
    throw new Error("Manifest is malformed: expected a { components: [...] } object.");
  }
  return parsed;
}

/** Match scanner output byte-for-byte: 2-space indent + trailing newline. */
export function serializeManifest(manifest: ComponentManifest): string {
  return JSON.stringify(manifest, null, 2) + "\n";
}

export function findEntry(
  manifest: ComponentManifest,
  codePath: string,
  codeName: string,
): ComponentManifestEntry | undefined {
  const id = entryId(codePath, codeName);
  return manifest.components.find((c) => entryId(c.codePath, c.codeName) === id);
}

/** Find the entry a given Figma component key currently points at, if any. */
export function entryForKey(
  manifest: ComponentManifest,
  componentKey: string,
): ComponentManifestEntry | undefined {
  return componentKey
    ? manifest.components.find((c) => c.figmaComponentKey === componentKey)
    : undefined;
}

export interface MappingInput {
  codePath: string;
  codeName: string;
  /** The Figma component key to store as the pointer. */
  componentKey: string;
  /** Human-readable Figma component name (from the selected node). */
  figmaName: string;
}

export interface MappingResult {
  manifest: ComponentManifest;
  entry: ComponentManifestEntry;
  changed: boolean;
}

/**
 * Set an entry's Figma mapping. Returns a NEW manifest (no mutation of the input).
 * A draft entry becomes `active` once mapped; a previously-mapped entry keeps its
 * status. `changed` is false when the mapping already matches (nothing to PR).
 */
export function applyMapping(manifest: ComponentManifest, input: MappingInput): MappingResult {
  const existing = findEntry(manifest, input.codePath, input.codeName);
  if (!existing) {
    throw new Error(`No manifest entry for ${input.codeName} at ${input.codePath}.`);
  }

  const updated: ComponentManifestEntry = {
    ...existing,
    figmaComponentKey: input.componentKey,
    figmaComponentName: input.figmaName || existing.figmaComponentName || existing.codeName,
    status: existing.status === "draft" ? "active" : existing.status,
  };

  const changed =
    existing.figmaComponentKey !== updated.figmaComponentKey ||
    existing.figmaComponentName !== updated.figmaComponentName ||
    existing.status !== updated.status;

  const components = manifest.components.map((c) => (c === existing ? updated : c));
  return { manifest: { ...manifest, components }, entry: updated, changed };
}
