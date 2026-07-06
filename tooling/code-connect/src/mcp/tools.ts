/**
 * MCP tool implementations (Connect.md §6.2), transport-agnostic.
 *
 * Pure functions over a {@link ManifestLoader} so they can be unit-tested directly
 * (§6.4 anti-hallucination behavior) and wrapped identically by the stdio server
 * now and the HTTP transport later — no forked logic between transports (§6.1).
 */

import type {
  ListStaleOutput,
  SearchComponentsInput,
  SearchComponentsOutput,
  ValidateMappingInput,
  ValidateMappingOutput,
} from "../schema.js";
import type { ManifestLoader } from "./manifest-loader.js";
import { searchComponents as runSearch } from "./confidence.js";
import { computeStaleness, liveValidate } from "./staleness.js";

export { buildComponentContext } from "./serialize.js";

/** `search_components` — fuzzy browse of real components (§6.2). */
export function searchComponents(
  loader: ManifestLoader,
  input: SearchComponentsInput,
): SearchComponentsOutput {
  return { results: runSearch(loader, input) };
}

/** `validate_mapping` — health-check a single mapping via a live re-scan (§6.2). */
export function validateMapping(
  loader: ManifestLoader,
  input: ValidateMappingInput,
): ValidateMappingOutput {
  const entry = loader.byKey(input.figmaComponentKey);
  if (!entry) {
    return {
      isValid: false,
      currentHash: "",
      storedHash: "",
      warning: `No manifest entry mapped to component key "${input.figmaComponentKey}".`,
    };
  }
  const v = liveValidate(entry, loader);
  return {
    isValid: v.isValid,
    currentHash: v.currentHash,
    storedHash: v.storedHash,
    ...(v.diff.length ? { diff: v.diff } : {}),
    ...(v.warning ? { warning: v.warning } : {}),
  };
}

/** `list_stale` — surface drift across the whole manifest (§6.2). */
export function listStale(loader: ManifestLoader): ListStaleOutput {
  const staleEntries: ListStaleOutput["staleEntries"] = [];
  for (const entry of loader.all()) {
    if (!entry.figmaComponentKey) continue; // unmapped drafts can't be "stale mappings"
    if (computeStaleness(entry, loader).isStale) {
      staleEntries.push({
        componentKey: entry.figmaComponentKey,
        name: entry.figmaComponentName,
        codePath: entry.codePath,
        lastSyncedAt: entry.lastSyncedAt,
      });
    }
  }
  return { staleEntries };
}
