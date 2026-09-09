/**
 * The code shown under a preview, for whichever framework is selected.
 *
 * React's snippet is unchanged by any of this — it still comes from the story's
 * own `parameters.docs.source.code`, or from the args when the story pins none.
 * The other three are derived from those same args (never translated from the
 * React source, which would be a second copy of the truth), so a component is
 * described identically in all four or not at all.
 *
 * Two rules keep the derivation honest, and they differ by position on the page:
 *
 * - The **canonical instance** always derives. That story *is* one instance of
 *   the component with its canonical props — it is what the Inspect view's
 *   controls drive — so `<Card variant="default" padding="md" />` is a true, if
 *   thin, statement about Card.
 * - An **example** derives only when `story.argsOnly` — Storybook renders the
 *   component with the args and nothing else. Anywhere else the heading ("All
 *   intents") describes a composition the args do not carry, and a single
 *   derived instance under it would be a caption that lies. Those examples show
 *   their React source only, and the section says so.
 */

import {
  FRAMEWORK_INFO,
  frameworkSample,
  jsxFromArgs,
  packageFromImport,
  unsupportedArgs,
  type DocFramework,
  type FrameworkTarget,
} from "@ui-organized/code-connect/browser";
import type { DocsComponent, DocsStory } from "../registry";
import { coverageOf, targetFor } from "./surfaces";

export interface FrameworkSnippet {
  code: string;
  /** Language tag for the code block, e.g. `svelte`. */
  language: string;
}

/** A compound family imports as one statement — that's how it's actually used. */
export function importStatementFor(component: DocsComponent): string | undefined {
  const { entry, related } = component;
  if (!entry) return undefined;
  if (!related.length) return entry.importStatement;
  const names = [entry.codeName, ...related.map((r) => r.codeName)].join(", ");
  return `import { ${names} } from '${packageFromImport(entry.importStatement)}';`;
}

/** Import + usage for a story in React, exactly as the docs have always shown it. */
export function reactExampleCode(component: DocsComponent, story: DocsStory): string {
  const { entry } = component;
  // The story's hand-curated snippet when it has one — it shows real
  // composition. Otherwise synthesise the usage from the args, ordered by the
  // manifest, with `jsxFromArgs` (the same function the AI context block uses,
  // so the two never print the same component differently).
  const usage =
    story.code ??
    (entry ? jsxFromArgs(entry.codeName, story.args, entry.props.map((p) => p.name)) : "");

  return [importStatementFor(component), usage].filter(Boolean).join("\n\n");
}

function propOrderOf(component: DocsComponent): string[] {
  return component.entry?.props.map((p) => p.name) ?? [];
}

/**
 * The sample, unless this example uses props the framework's component hasn't
 * got. Rendering it without them would put "Checked" above a switch that isn't —
 * Angular's `UioSwitch` has no `defaultChecked`, deliberately — and a caption
 * that lies is the one thing worse than a missing sample.
 */
function derived(
  component: DocsComponent,
  story: DocsStory,
  target: FrameworkTarget,
): FrameworkSnippet | undefined {
  const propOrder = propOrderOf(component);
  if (unsupportedArgs(target, story.args, propOrder).length) return undefined;
  return {
    code: frameworkSample(target, story.args, propOrder),
    language: FRAMEWORK_INFO[target.framework].language,
  };
}

/** The canonical instance's complete, copyable sample. */
export function primarySnippet(
  component: DocsComponent,
  story: DocsStory,
  framework: DocFramework,
): FrameworkSnippet | undefined {
  const language = FRAMEWORK_INFO[framework].language;

  if (framework === "react") {
    const code = reactExampleCode(component, story);
    return code ? { code, language } : undefined;
  }

  // Only the symbol the snippet actually uses. A compound family's siblings go
  // on React's import line because that is how the manifest records it, but an
  // unused Angular directive in `imports: []` is a lint error and an unused
  // Svelte import is a warning — in a snippet meant to be pasted as-is.
  const target = targetFor(framework, component.codeName);
  return target ? derived(component, story, target) : undefined;
}

/** One example's snippet, or nothing when this framework has none to show. */
export function exampleSnippet(
  component: DocsComponent,
  story: DocsStory,
  framework: DocFramework,
): FrameworkSnippet | undefined {
  const language = FRAMEWORK_INFO[framework].language;

  if (framework === "react") {
    return story.code ? { code: story.code, language } : undefined;
  }

  if (!story.argsOnly) return undefined;

  const target = targetFor(framework, component.codeName);
  return target ? derived(component, story, target) : undefined;
}

interface GapBase {
  framework: DocFramework;
  label: string;
  packageName: string;
}

/** The library hasn't got the component. */
export interface MissingComponentGap extends GapBase {
  reason: "missing-component";
  /** Documented components this framework ships, out of how many. */
  covered: number;
  total: number;
}

/** It has the component, but not the props this particular example needs. */
export interface UnsupportedPropsGap extends GapBase {
  reason: "unsupported-props";
  /** The framework's own name for the component, e.g. `UioSwitch`. */
  symbol: string;
  props: string[];
}

export type FrameworkGap = MissingComponentGap | UnsupportedPropsGap;

/**
 * Why there is no sample, when the reason is the library rather than the shape
 * of the example. Undefined means one can be shown — including for React, whose
 * coverage question is answered by the manifest entry the whole page already
 * depends on.
 */
export function gapFor(
  component: DocsComponent,
  story: DocsStory,
  framework: DocFramework,
): FrameworkGap | undefined {
  if (framework === "react") return undefined;

  const { label, packageName } = FRAMEWORK_INFO[framework];
  const target = targetFor(framework, component.codeName);
  if (!target) {
    return {
      reason: "missing-component",
      framework,
      label,
      packageName,
      ...coverageOf(framework),
    };
  }

  const props = unsupportedArgs(target, story.args, propOrderOf(component));
  if (!props.length) return undefined;

  return { reason: "unsupported-props", framework, label, packageName, symbol: target.symbol, props };
}
