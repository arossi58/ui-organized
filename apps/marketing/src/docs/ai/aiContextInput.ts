/**
 * Assembles the `AiContextInput` for a docs page.
 *
 * This is the join point of the whole feature: the manifest supplies the
 * verified prop signature, the CSF module supplies the prose and the curated
 * composition snippets, and the Inspect view supplies the current control
 * values. `buildAiContext()` itself lives in `@ui-organized/code-connect` so the
 * static `/ai/<Component>.md` files and the Storybook addon render from the very
 * same function.
 */
import {
  aiSpecPath,
  buildAiContext,
  frameworkUsage,
  setupImportsFor,
  unsupportedArgs,
  type AiContextExample,
  type AiContextFormat,
  type AiContextInput,
  type AiContextResult,
  type DocFramework,
  type FrameworkTarget,
  type Staleness,
} from "@ui-organized/code-connect/browser";
import { getUsageGuide } from "@ui-organized/code-connect/usage";
import angularPkg from "../../../../../packages/angular/package.json";
import reactPkg from "../../../../../packages/react/package.json";
import sveltePkg from "../../../../../packages/svelte/package.json";
import vuePkg from "../../../../../packages/vue/package.json";
import { SITE_ORIGIN } from "../../lib/links";
import { targetFor } from "../frameworks/surfaces";
import { docsComponents, type DocsComponent } from "../registry";

const VERSIONS: Record<DocFramework, string> = {
  react: reactPkg.version,
  svelte: sveltePkg.version,
  vue: vuePkg.version,
  angular: angularPkg.version,
};

/**
 * Snippets that read as standalone JSX. `AllVariantsGrid`-style stories pin a
 * snippet that is a bare `{…map(…)}` expression — correct in Storybook's Code
 * panel, but handing an agent an unbound expression as an "example" invites it
 * to paste something that doesn't compile.
 */
function usableExamples(component: DocsComponent): AiContextExample[] {
  return component.stories
    .filter((story) => story.code && story.code.trimStart().startsWith("<"))
    .map((story) => ({
      name: story.exportName,
      label: story.name,
      code: story.code!,
      source: "story-source-param" as const,
    }));
}

/**
 * The same examples in another library's markup — derived from the story args,
 * so only the stories that are the component with its args and nothing else
 * (`argsOnly`), and only where this library's component takes every one of
 * them. The rule is the docs page's own (see `frameworks/sample.ts`): a
 * composition the args don't carry would come out as a caption that lies.
 */
function frameworkExamples(component: DocsComponent, target: FrameworkTarget): AiContextExample[] {
  const propOrder = component.entry?.props.map((p) => p.name) ?? [];
  return component.stories
    .filter((story) => story.argsOnly && !unsupportedArgs(target, story.args, propOrder).length)
    .map((story) => ({
      name: story.exportName,
      label: story.name,
      code: frameworkUsage(target, story.args, propOrder),
      source: "live-args" as const,
    }));
}

export interface AiContextOptions {
  /** The library to write the block for. Defaults to React. */
  framework?: DocFramework;
  staleness?: Staleness;
  /** Live control values from the Inspect view, for the "current state" block. */
  liveArgs?: Record<string, unknown>;
  /** Deep link into Storybook, when its index is available. */
  storybookUrl?: string;
}

/**
 * Null when the story has no verified manifest entry, or when the chosen
 * library doesn't ship the component — we never guess one, and never hand an
 * agent React under another library's name.
 */
export function aiContextInputFor(
  component: DocsComponent,
  options: AiContextOptions = {},
): AiContextInput | null {
  const { entry } = component;
  if (!entry) return null;

  const framework = options.framework ?? "react";
  const target = framework === "react" ? undefined : targetFor(framework, entry.codeName);
  if (framework !== "react" && !target) return null;

  const relatedTargets: Record<string, FrameworkTarget> = {};
  if (target) {
    for (const sibling of component.related) {
      const t = targetFor(framework, sibling.codeName);
      if (t) relatedTargets[sibling.codeName] = t;
    }
  }
  const query = framework === "react" ? "" : `?framework=${framework}`;

  return {
    entry,
    related: component.related,
    ...(target ? { target, relatedTargets } : {}),
    staleness: options.staleness,
    confidence: "exact",
    description: component.description,
    // The Usage tab's guidance, verbatim — an agent gets the same boundaries a
    // reader does, including the "use X instead" the prop table can't express.
    usage: getUsageGuide(component.slug),
    examples: target ? frameworkExamples(component, target) : usableExamples(component),
    liveArgs: options.liveArgs,
    // Storybook's argTypes carry hand-listed options for props whose type is a
    // named alias the scanner can't expand. Feeding them in turns "size takes a
    // ControlSize" — useless — into the actual list of legal values. Open types
    // such as `IconName` are skipped by `expandPropType` itself.
    typeValues: typeValuesFromArgTypes(component),
    meta: {
      packageVersion: VERSIONS[framework],
      setupImports: setupImportsFor(framework, { table: component.slug === "data-table" }),
      siteUrl: `${SITE_ORIGIN}/docs/${component.slug}${query}`,
      docUrl: `${SITE_ORIGIN}${aiSpecPath(framework, entry.codeName)}`,
      indexUrl: `${SITE_ORIGIN}/llms.txt`,
      componentCount: docsComponents.length,
      storybookUrl: options.storybookUrl,
    },
  };
}

/** `{ ControlSize: ["sm", "md", "lg"] }`, from the story's argTypes. */
function typeValuesFromArgTypes(component: DocsComponent): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const { entry, argTypes } = component;
  if (!entry) return out;

  for (const prop of entry.props) {
    const options = argTypes[prop.name]?.options;
    if (!options?.length) continue;
    // `undefined` is a legitimate control option ("no icon") but not a value an
    // agent should ever write.
    const values = options.filter((v): v is string => typeof v === "string" && v.length > 0);
    if (values.length) out[prop.type] = values;
  }
  return out;
}

export function aiContextFor(
  component: DocsComponent,
  format: AiContextFormat,
  options?: AiContextOptions,
): AiContextResult | null {
  const input = aiContextInputFor(component, options);
  return input ? buildAiContext(input, format) : null;
}
