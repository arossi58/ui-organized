/**
 * Re-export shim. The control classification moved to
 * `@ui-organized/code-connect` (`src/controls-core.ts`) when the native docs site
 * at `apps/marketing/src/docs/` needed the same manifest → control mapping: both
 * surfaces must offer identical controls, in identical order, with identical enum
 * options for a given component, and that only holds if there's one
 * implementation.
 *
 * Kept as a module so the panel's many local `./controls.js` imports stay put.
 */

export {
  parseEnumValues,
  classifyProp,
  controlsFor,
  controlFromArgType,
  defaultOf,
  mergeControls,
  groupControls,
  type Control,
  type ControlKind,
  type ControlSection,
  type StoryArgTypeInput,
} from "@ui-organized/code-connect/browser";
