/**
 * The framework switcher: which framework a reader has selected, which
 * components each library actually ships, and the code sample for the two
 * together.
 *
 * Kept out of `components/` because none of it is chrome — it is the docs site's
 * second data layer, sitting beside `registry.ts`.
 */

export { DocsFrameworkProvider, useDocsFramework } from "./FrameworkContext";
export { FrameworkGapNote, FrameworkSwitcher } from "./FrameworkSwitcher";
export {
  DEFAULT_FRAMEWORK,
  FRAMEWORK_PARAM,
  FRAMEWORK_STORAGE_KEY,
  readStoredFramework,
  resolveFramework,
  withFramework,
  writeStoredFramework,
  type FrameworkStore,
} from "./frameworkState";
export {
  exampleSnippet,
  gapFor,
  importStatementFor,
  primarySnippet,
  reactExampleCode,
  type FrameworkGap,
  type FrameworkSnippet,
} from "./sample";
export { coverageOf, frameworkSurfaces, targetFor, type FrameworkCoverage } from "./surfaces";
