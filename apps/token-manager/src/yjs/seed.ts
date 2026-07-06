import { SCHEMA_VERSION, type ProjectDocument } from "@ui-organized/schema";

/**
 * The starter project loaded the first time the editor runs (no IndexedDB doc
 * yet). It exercises the Phase 2 DoD end to end: a color token, a token that
 * references it, a math expression, a color modifier, and light/dark semantic
 * variants so switching the active mode changes resolved values.
 *
 * Mode variance is expressed the neutral way the resolver already supports —
 * separate semantic sets, one per mode, tagged via `$extensions.mode`. The merge
 * selects the set matching the active mode (see `useResolved`). The opinionated
 * pack mechanism arrives in Phase 3; this is the tool-agnostic baseline.
 */
const SEED_TIMESTAMP = "2026-06-28T00:00:00.000Z";

export function seedProjectDocument(): ProjectDocument {
  return {
    version: SCHEMA_VERSION,
    meta: {
      name: "Starter project",
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
      schemaVersion: SCHEMA_VERSION,
    },
    sets: [
      {
        name: "primitives",
        tokens: {
          color: {
            $type: "color",
            black: { $value: "#0a0a0a" },
            white: { $value: "#ffffff" },
            blue: { "500": { $value: "#3355ff" } },
          },
          spacing: {
            $type: "dimension",
            base: { $value: "4px" },
            lg: { $value: "{spacing.base} * 4" },
          },
        },
      },
      {
        name: "semantic-light",
        $extensions: { mode: "light" },
        tokens: {
          color: {
            $type: "color",
            text: { $value: "{color.black}" },
            surface: { $value: "{color.white}" },
            brand: { $value: "{color.blue.500}" },
            "brand-hover": { $value: "lighten({color.brand}, 0.08)" },
          },
        },
      },
      {
        name: "semantic-dark",
        $extensions: { mode: "dark" },
        tokens: {
          color: {
            $type: "color",
            text: { $value: "{color.white}" },
            surface: { $value: "{color.black}" },
            brand: { $value: "{color.blue.500}" },
            "brand-hover": { $value: "lighten({color.brand}, 0.12)" },
          },
        },
      },
    ],
    themes: [
      {
        name: "Default",
        selectedTokenSets: {
          primitives: "source",
          "semantic-light": "enabled",
          "semantic-dark": "enabled",
        },
      },
    ],
    modes: {
      light: { $description: "Light mode" },
      dark: { $description: "Dark mode" },
    },
  };
}
