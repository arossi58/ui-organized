/**
 * The inspection engine, as a package export.
 *
 * `extractInspection` reads a rendered DOM subtree and reports the
 * Figma-Dev-Mode facts — the element/class tree, and each style property tagged
 * `token` / `literal` / `inherited`. None of that is Storybook-specific: it takes
 * a `Window` and a set of root elements, which the Storybook panel supplies from
 * the preview iframe and the native docs site supplies from a local ref.
 *
 * Exported so `apps/marketing/src/docs/inspect/` can reuse it verbatim instead of
 * forking ~370 lines of DOM walking that would then drift. The presentation is
 * NOT shared — the panel is styled for Storybook's chrome and the docs site for
 * the marketing shell — but the facts both surfaces show come from here.
 */

export {
  extractInspection,
  type Inspection,
  type InspectedNode,
  type PropSource,
  type StyleGroup,
  type StyleProp,
} from "./extract.js";

export { openOverlayFor, isRendered } from "./reveal.js";

export {
  isColorValue,
  isIconTag,
  isVisibleColor,
  isZeroLength,
  matchesQuery,
  nodeLabel,
  parseVarRefs,
  shorten,
  textClassOf,
  usesVar,
} from "./format.js";
