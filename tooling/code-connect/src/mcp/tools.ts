/**
 * MCP tool implementations, transport-agnostic.
 *
 * Pure functions over a {@link ManifestLoader} so they can be unit-tested directly
 * (the anti-hallucination behaviour in `test/tools.test.ts`) and wrapped
 * identically by the stdio and HTTP servers — no forked logic between transports.
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

/** `search_components` — fuzzy browse of real components. */
export function searchComponents(
  loader: ManifestLoader,
  input: SearchComponentsInput,
): SearchComponentsOutput {
  return { results: runSearch(loader, input) };
}

/** `validate_mapping` — health-check a single mapping via a live re-scan. */
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

/** `list_stale` — surface drift across the whole manifest. */
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
