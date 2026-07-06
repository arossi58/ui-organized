import type { FigmaVarType, FigmaValue } from "./map.js";

/**
 * The stored id manifest — the heart of non-destructive reconciliation. It lives
 * in the Figma document (`figma.root.setPluginData`) and maps each **token path**
 * → the Figma variable id we created for it, plus a per-mode value hash so a
 * second push can tell changed from unchanged.
 *
 * Matching is by stored id (the manifest), never by Figma name — so a token whose
 * derived name changes updates the same variable instead of duplicating.
 */
export interface ManifestEntry {
  id: string;
  collection: string;
  name: string;
  type: FigmaVarType;
  hashByMode: Record<string, string>;
}

export type StoredManifest = Record<string, ManifestEntry>;

const PLUGIN_DATA_KEY = "uiorganized:variable-manifest";

/** Stable hash of a planned Figma value, for change detection. */
export function hashValue(value: FigmaValue): string {
  return JSON.stringify(value);
}

export function serializeManifest(manifest: StoredManifest): string {
  return JSON.stringify(manifest);
}

export function parseManifest(raw: string | undefined | null): StoredManifest {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as StoredManifest) : {};
  } catch {
    return {};
  }
}

export { PLUGIN_DATA_KEY };
