/**
 * The docs data layer: Storybook's CSF story modules joined to the Code Connect
 * manifest.
 *
 * Why read the story files directly instead of extracting them at build time —
 * every one of the 45 files in `apps/storybook/src/stories/` imports only `react`
 * and `@ui-organized/react` at runtime (the sole Storybook import is
 * `import type { Meta, StoryObj }`, which is erased). So they are ordinary React
 * modules to this app, and globbing them gives us the component prose, the
 * argTypes, the live `render()` functions, and the 78 hand-curated
 * `docs.source.code` snippets with no extraction step and no way for the docs to
 * drift from Storybook.
 *
 * The manifest supplies the other half — the machine-scanned prop signatures that
 * the story files don't carry and that `buildAiContext()` needs.
 */

import { createElement, type ComponentType, type ReactNode } from "react";
import type {
  ComponentManifest,
  ComponentManifestEntry,
  StoryArgTypeInput,
} from "@ui-organized/code-connect/browser";
import { humanizeLabel } from "@ui-organized/code-connect/browser";
import manifestJson from "../../../../manifest/components.json";

// ─── Shapes we read out of a CSF module ──────────────────────────────────────

type Args = Record<string, unknown>;

interface StoryDocsParams {
  description?: { component?: string };
  source?: { code?: string };
}

interface StoryParameters {
  layout?: PreviewLayout;
  docs?: StoryDocsParams;
  /** Escape hatch for a story the join can't infer: `codePath::codeName`. */
  codeConnect?: { entryId?: string; codeName?: string };
}

export type PreviewLayout = "padded" | "centered" | "fullscreen";

interface StoryMeta {
  title?: string;
  component?: unknown;
  tags?: string[];
  parameters?: StoryParameters;
  argTypes?: Record<string, StoryArgTypeInput>;
  args?: Args;
}

interface StoryObject {
  name?: string;
  tags?: string[];
  parameters?: StoryParameters;
  args?: Args;
  render?: (args: Args) => ReactNode;
}

/** What `import.meta.glob(..., { eager: true })` hands back per file. */
export type StoryModule = Record<string, unknown> & { default?: StoryMeta };

// ─── Public shape ────────────────────────────────────────────────────────────

export interface DocsStory {
  /** Export name in the CSF file, e.g. `AllIntents`. */
  exportName: string;
  /** Display caption, e.g. `All intents`. */
  name: string;
  args: Args;
  /** Hand-curated snippet from `parameters.docs.source.code`, when pinned. */
  code?: string;
  layout: PreviewLayout;
  /**
   * The canonical single-instance story — Storybook's `Inspect` (the one story
   * tagged `dev`, so the only one in its sidebar). Drives the Inspect view.
   */
  isInspect: boolean;
  /**
   * The story as a real component — render it as `<story.Story args={…} />`,
   * never by calling it.
   *
   * This MUST be a component rather than a `(args) => ReactNode` function.
   * Storybook `render` functions use hooks (several stories call `useState`),
   * and so do the components themselves (`NavItem` calls `useContext`). Invoking
   * either from a page's render body executes those hooks in the *page's* fiber,
   * so the page's hook count changes with whichever component it's showing —
   * which is exactly what "Rendered more hooks than during the previous render"
   * means. Navigating Toast (no `meta.component`, 0 extra hooks) → Navigation
   * (`NavItem`, one `useContext`) crashed the route.
   *
   * Built once per story at registry construction, so its identity is stable and
   * React remounts cleanly when you switch stories.
   */
  Story: ComponentType<{ args: Args }>;
}

export interface DocsComponent {
  /** URL segment, e.g. `date-range-input`. */
  slug: string;
  /** Human name — the story title's leaf, which is what the sidebar shows. */
  name: string;
  /** Code identity from the manifest, e.g. `NavItem` for the Navigation story. */
  codeName?: string;
  category: string;
  storyTitle: string;
  description?: string;
  argTypes: Record<string, StoryArgTypeInput>;
  /** The manifest entry, when the story resolves to one. */
  entry?: ComponentManifestEntry;
  /** How the entry was found — surfaced so an unverified page says so. */
  resolvedBy: "parameter" | "component" | "title" | "filename" | "none";
  /** Compound siblings sharing `entry.codePath`. */
  related: ComponentManifestEntry[];
  stories: DocsStory[];
  /** Path of the source CSF file, for provenance. */
  storyPath: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function kebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
}

/**
 * Sidebar order, mirroring the `storySort` in
 * `apps/storybook/.storybook/preview.tsx` so the two navigations agree.
 */
export const CATEGORY_ORDER = [
  "Forms",
  "Actions",
  "Navigation",
  "Overlay",
  "Disclosure",
  "Feedback",
  "Data Display",
  "Layout",
] as const;

/** `"Components/Actions/Button"` → `{ category: "Actions", name: "Button" }`. */
function parseTitle(title: string): { category: string; name: string } {
  const parts = title.split("/").map((p) => p.trim()).filter(Boolean);
  const name = parts[parts.length - 1] ?? title;
  if (parts.length >= 3 && parts[0] === "Components") {
    return { category: parts[1]!, name };
  }
  return { category: parts.length > 1 ? parts[0]! : "Other", name };
}

/** The display name a React component reports, if any. */
function componentName(component: unknown): string | undefined {
  if (typeof component !== "function" && typeof component !== "object") return undefined;
  const c = component as { displayName?: unknown; name?: unknown };
  if (typeof c.displayName === "string" && c.displayName) return c.displayName;
  if (typeof c.name === "string" && c.name) return c.name;
  return undefined;
}

function isStoryObject(value: unknown): value is StoryObject {
  if (!value || typeof value !== "object") return false;
  const s = value as StoryObject;
  return (
    typeof s.render === "function" ||
    typeof s.args === "object" ||
    typeof s.parameters === "object" ||
    Array.isArray(s.tags)
  );
}

/**
 * Resolve a story file to its manifest entry.
 *
 * Deliberately exact-match only. The Storybook Inspector resolves the same
 * question with name similarity and a 0.55 threshold, which silently maps the
 * Navigation story onto `Pagination` (0.556) and shows the wrong props. An
 * unmapped page that says so is strictly better than a confidently wrong one.
 */
function resolveEntry(
  meta: StoryMeta,
  fileBase: string,
  titleLeaf: string,
  byCodeName: Map<string, ComponentManifestEntry>,
  byEntryId: Map<string, ComponentManifestEntry>,
): { entry?: ComponentManifestEntry; resolvedBy: DocsComponent["resolvedBy"] } {
  const cc = meta.parameters?.codeConnect;
  if (cc?.entryId) {
    const entry = byEntryId.get(cc.entryId);
    if (entry) return { entry, resolvedBy: "parameter" };
  }
  if (cc?.codeName) {
    const entry = byCodeName.get(cc.codeName);
    if (entry) return { entry, resolvedBy: "parameter" };
  }

  // `meta.component` is the actual component reference — authoritative, and the
  // only signal that gets Navigation → NavItem right.
  const fromComponent = componentName(meta.component);
  if (fromComponent) {
    const entry = byCodeName.get(fromComponent);
    if (entry) return { entry, resolvedBy: "component" };
  }

  const fromTitle = byCodeName.get(titleLeaf);
  if (fromTitle) return { entry: fromTitle, resolvedBy: "title" };

  const fromFile = byCodeName.get(fileBase);
  if (fromFile) return { entry: fromFile, resolvedBy: "filename" };

  return { resolvedBy: "none" };
}

// ─── Build ───────────────────────────────────────────────────────────────────

/**
 * Pure so it can be unit-tested against the real glob without a DOM. Exported for
 * `registry.test.ts`, which asserts every story file resolves.
 */
export function buildRegistry(
  modules: Record<string, StoryModule>,
  manifest: ComponentManifest,
): DocsComponent[] {
  const byCodeName = new Map(manifest.components.map((c) => [c.codeName, c]));
  const byEntryId = new Map(
    manifest.components.map((c) => [`${c.codePath}::${c.codeName}`, c] as const),
  );
  const byCodePath = new Map<string, ComponentManifestEntry[]>();
  for (const c of manifest.components) {
    const list = byCodePath.get(c.codePath) ?? [];
    list.push(c);
    byCodePath.set(c.codePath, list);
  }

  const out: DocsComponent[] = [];

  for (const [path, mod] of Object.entries(modules)) {
    const meta = mod.default;
    if (!meta?.title) continue;

    const fileBase = path.split("/").pop()!.replace(/\.stories\.tsx?$/, "");
    const { category, name } = parseTitle(meta.title);
    const { entry, resolvedBy } = resolveEntry(meta, fileBase, name, byCodeName, byEntryId);

    const metaParams = meta.parameters ?? {};
    const stories: DocsStory[] = [];

    for (const [exportName, value] of Object.entries(mod)) {
      if (exportName === "default" || !isStoryObject(value)) continue;
      const story = value;
      const params = story.parameters ?? {};
      const args = { ...(meta.args ?? {}), ...(story.args ?? {}) };
      const Component = meta.component as ComponentType<Args> | undefined;
      const renderFn = story.render;

      // Wrapped in a component so any hooks the story or the component uses run
      // in this fiber, not in the docs page that mounts it. See `Story` above.
      const Story: ComponentType<{ args: Args }> = renderFn
        ? ({ args: a }) => (renderFn(a) ?? null) as ReactNode
        : ({ args: a }) => (Component ? createElement(Component, a) : null);
      Story.displayName = `Story(${meta.title}/${exportName})`;

      stories.push({
        exportName,
        name: story.name ?? humanizeLabel(exportName),
        args,
        code: params.docs?.source?.code,
        layout: params.layout ?? metaParams.layout ?? "padded",
        // Storybook hides every story in these files except the one that re-adds
        // the `dev` tag — that one is the canonical single instance.
        isInspect: exportName === "Inspect" || (story.tags?.includes("dev") ?? false),
        Story,
      });
    }

    out.push({
      slug: kebab(name),
      name,
      codeName: entry?.codeName,
      category,
      storyTitle: meta.title,
      description: metaParams.docs?.description?.component,
      argTypes: meta.argTypes ?? {},
      entry,
      resolvedBy,
      related: entry
        ? (byCodePath.get(entry.codePath) ?? []).filter((c) => c.codeName !== entry.codeName)
        : [],
      stories,
      storyPath: path.replace(/^.*\/apps\//, "apps/"),
    });
  }

  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

// ─── Module-level singletons ─────────────────────────────────────────────────

// Resolved through Rollup's module graph, so dev and build behave identically.
// Vite's default `server.fs.allow` is the pnpm workspace root, which covers both.
const storyModules = import.meta.glob<StoryModule>("../../../storybook/src/stories/*.stories.tsx", {
  eager: true,
});

export const manifest = manifestJson as unknown as ComponentManifest;

export const docsComponents: DocsComponent[] = buildRegistry(storyModules, manifest);

const bySlug = new Map(docsComponents.map((c) => [c.slug, c]));

export function getDocsComponent(slug: string | undefined): DocsComponent | undefined {
  return slug ? bySlug.get(slug) : undefined;
}

export interface DocsCategory {
  name: string;
  components: DocsComponent[];
}

/** Components grouped for the sidebar, in Storybook's `storySort` order. */
export function getDocsCategories(): DocsCategory[] {
  const groups = new Map<string, DocsComponent[]>();
  for (const component of docsComponents) {
    const list = groups.get(component.category) ?? [];
    list.push(component);
    groups.set(component.category, list);
  }

  const rank = (name: string) => {
    const i = (CATEGORY_ORDER as readonly string[]).indexOf(name);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };

  return [...groups.entries()]
    .map(([name, components]) => ({ name, components }))
    .sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));
}

/** The story an Inspect view should drive: `Inspect`, else the first story. */
export function inspectStory(component: DocsComponent): DocsStory | undefined {
  return component.stories.find((s) => s.isInspect) ?? component.stories[0];
}

/** Stories shown as examples on the Docs view — everything but the Inspect one. */
export function exampleStories(component: DocsComponent): DocsStory[] {
  const examples = component.stories.filter((s) => !s.isInspect);
  return examples.length ? examples : component.stories;
}
