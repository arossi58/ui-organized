import {
  generateFoundation as runGenerators,
  PACK_ID,
  DEFAULT_CONFIG,
  UiOrganizedConfigSchema,
  type UiOrganizedConfig,
} from "@ui-organized/pack-ui-organized";
import { reconcileOverrides, type ReconcileReport } from "@ui-organized/token-io";
import { getPackConfig, readOverrides, setFoundation } from "../yjs/store.js";

/**
 * Composition seam: this is where the shell wires the (optional) UI Organized
 * pack to the neutral store. The store, schema, resolver, and token-io never
 * import a pack — only this module and the Generators panel do.
 */

/** The set generated foundations are written into. */
export const FOUNDATION_SET = "foundation";

/** The pack config currently stored on the document, or the pack default. */
export function currentConfig(): UiOrganizedConfig {
  const parsed = UiOrganizedConfigSchema.safeParse(getPackConfig());
  return parsed.success ? parsed.data : DEFAULT_CONFIG;
}

/** First-time generation: writes tokens, recipes, pack instance; no overrides. */
export function generateFoundationProject(config: UiOrganizedConfig): void {
  const { tokens, recipes } = runGenerators(config);
  setFoundation(FOUNDATION_SET, tokens, recipes, [{ packId: PACK_ID, config }], {});
}

/**
 * Regeneration: re-runs the generators, reconciles the existing override layer
 * against the new base (redundant cleared, reapplied kept, stale flagged), and
 * returns the report for the UI to surface. Never loses data silently.
 */
export function regenerateFoundationProject(config: UiOrganizedConfig): ReconcileReport {
  const { tokens, recipes } = runGenerators(config);
  const { overrides, report } = reconcileOverrides(tokens, readOverrides());
  setFoundation(FOUNDATION_SET, tokens, recipes, [{ packId: PACK_ID, config }], overrides);
  return report;
}
