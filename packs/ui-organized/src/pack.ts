import type { GeneratorPack } from "@ui-organized/schema";
import { UiOrganizedConfigSchema } from "./config.js";
import { generators } from "./generators.js";
import { PACK_ID } from "./foundation.js";

/**
 * The UI Organized pack — registered by the editor by default, but deselectable.
 * Implements the neutral `GeneratorPack` interface; the core discovers it through
 * the interface and never imports this module directly.
 */
export const uiOrganizedPack: GeneratorPack = {
  id: PACK_ID,
  name: "UI Organized",
  configSchema: UiOrganizedConfigSchema,
  generators,
};
