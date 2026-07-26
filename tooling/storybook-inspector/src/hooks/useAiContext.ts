/**
 * Assembles the AI context payload for the story currently on screen.
 *
 * Same `buildAiContext()` as the native docs site and the static
 * `/ai/<Component>.md` generator, so a person who copies from Storybook and a
 * person who copies from the docs get the identical contract for the same
 * component.
 *
 * One honest difference: the manager can only see the CURRENT story's
 * parameters. `STORY_PREPARED` carries parameters for the rendered story alone,
 * and `DOCS_PREPARED` carries meta-level parameters only — sibling stories'
 * `docs.source.code` never reaches this realm. So Storybook's payload has the
 * component prose and the current snippet but not the full example set the docs
 * site can offer. Closing that needs a build-time extractor, which is tracked.
 */
import { useParameter, useStorybookApi } from "storybook/manager-api";
import {
  buildAiContext,
  type AiContextExample,
  type AiContextFormat,
  type AiContextResult,
} from "@ui-organized/code-connect/browser";
import { useManifestEntry } from "./useManifestEntry.js";
import { useLiveArgs } from "./useLiveArgs.js";

const SITE_ORIGIN = "https://uiorganized.com";

interface DocsParameter {
  description?: { component?: string };
  source?: { code?: string };
}

export interface AiContextState {
  result: AiContextResult | null;
  /** Why it's unavailable — shown instead of a payload built on a guess. */
  reason?: string;
  loading: boolean;
}

export function useAiContext(format: AiContextFormat = "markdown"): AiContextState {
  const { loading, resolution, staleness, allEntries } = useManifestEntry();
  const { args } = useLiveArgs();
  const docs = useParameter<DocsParameter>("docs", {});
  const api = useStorybookApi();

  // A Docs page renders many stories at once, so there is no single "current
  // state". `useArgs` still reports args there (whichever story prepared last),
  // and emitting them under "what the human is looking at" would be a confident
  // claim about something we can't actually see.
  const isStoryView = api.getCurrentStoryData()?.type === "story";

  if (loading) return { result: null, loading: true };

  const entry = resolution.entry;
  if (!entry) {
    return {
      result: null,
      loading: false,
      reason: "No verified manifest entry matches this story.",
    };
  }

  const related = allEntries.filter(
    (candidate) => candidate.codePath === entry.codePath && candidate.codeName !== entry.codeName,
  );

  // The story's own pinned snippet, when it has one. Snippets that are a bare
  // `{…map(…)}` expression are skipped — correct in the Code panel, but an
  // unbound expression presented as an "example" invites uncompilable output.
  const pinned = docs?.source?.code;
  const examples: AiContextExample[] =
    pinned && pinned.trimStart().startsWith("<")
      ? [{ name: "Story", label: "From this story", code: pinned, source: "story-source-param" }]
      : [];

  const result = buildAiContext(
    {
      entry,
      related,
      staleness: staleness ?? undefined,
      confidence: resolution.confidence,
      resolutionNote:
        resolution.confidence === "fuzzy" ? `name similarity ${resolution.score}` : undefined,
      description: docs?.description?.component,
      examples,
      liveArgs: isStoryView ? args : undefined,
      meta: {
        setupImports: ["@ui-organized/tokens/variables.css", "@ui-organized/react/styles"],
        siteUrl: `${SITE_ORIGIN}/docs/${kebab(entry.codeName)}`,
        docUrl: `${SITE_ORIGIN}/ai/${entry.codeName}.md`,
        indexUrl: `${SITE_ORIGIN}/llms.txt`,
        componentCount: allEntries.length,
      },
    },
    format,
  );

  return { result, loading: false };
}

/** Must match `kebab()` in the docs registry so `siteUrl` resolves. */
function kebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
}
