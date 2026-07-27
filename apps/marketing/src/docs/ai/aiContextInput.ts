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
  buildAiContext,
  type AiContextExample,
  type AiContextFormat,
  type AiContextInput,
  type AiContextResult,
  type Staleness,
} from "@ui-organized/code-connect/browser";
import reactPkg from "../../../../../packages/react/package.json";
import { SITE_ORIGIN } from "../../lib/links";
import { docsComponents, type DocsComponent } from "../registry";

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

export interface AiContextOptions {
  staleness?: Staleness;
  /** Live control values from the Inspect view, for the "current state" block. */
  liveArgs?: Record<string, unknown>;
  /** Deep link into Storybook, when its index is available. */
  storybookUrl?: string;
}

/** Null when the story has no verified manifest entry — we never guess one. */
export function aiContextInputFor(
  component: DocsComponent,
  options: AiContextOptions = {},
): AiContextInput | null {
  const { entry } = component;
  if (!entry) return null;

  return {
    entry,
    related: component.related,
    staleness: options.staleness,
    confidence: "exact",
    description: component.description,
    examples: usableExamples(component),
    liveArgs: options.liveArgs,
    // Storybook's argTypes carry hand-listed options for props whose type is a
    // named alias the scanner can't expand (`icon: CanonicalIconName`). Feeding
    // them in turns "icon takes a CanonicalIconName" — useless — into the actual
    // list of legal names.
    typeValues: typeValuesFromArgTypes(component),
    meta: {
      packageVersion: reactPkg.version,
      setupImports: [
        "@ui-organized/tokens/variables.css",
        "@ui-organized/react/styles",
        // Registers the icon set. Omit it and every <Icon> renders nothing —
        // the library imports no icon package itself.
        "@ui-organized/react/icons/lucide",
      ],
      siteUrl: `${SITE_ORIGIN}/docs/${component.slug}`,
      docUrl: `${SITE_ORIGIN}/ai/${entry.codeName}.md`,
      indexUrl: `${SITE_ORIGIN}/llms.txt`,
      componentCount: docsComponents.length,
      storybookUrl: options.storybookUrl,
    },
  };
}

/** `{ CanonicalIconName: ["plus", "trash", …] }`, from the story's argTypes. */
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
