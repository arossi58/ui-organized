/**
 * The canonical instance of a component, with its complete code attached.
 *
 * "Complete" is the point: the snippet carries the import line *and* the usage,
 * inside the same frame as the preview it produces. A separate "Import" section
 * further down leaves a reader to assemble two halves themselves, and leaves
 * anyone who copies the usage with code that doesn't resolve.
 */
import { jsxFromArgs } from "@ui-organized/code-connect/browser";
import type { DocsComponent, DocsStory } from "../registry";
import { CodeBlock } from "./CodeBlock";
import { PreviewSurface } from "./PreviewSurface";

/** A compound family imports as one statement — that's how it's actually used. */
export function importStatementFor(component: DocsComponent): string | undefined {
  const { entry, related } = component;
  if (!entry) return undefined;
  if (!related.length) return entry.importStatement;
  const names = [entry.codeName, ...related.map((r) => r.codeName)].join(", ");
  return `import { ${names} } from '@ui-organized/react';`;
}

/** Import + usage for a story, as one copyable block. */
export function exampleCode(component: DocsComponent, story: DocsStory): string {
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

export function PrimaryExample({
  component,
  story,
}: {
  component: DocsComponent;
  story: DocsStory;
}) {
  const code = exampleCode(component, story);
  return (
    <PreviewSurface
      layout={story.layout}
      label={component.name}
      footer={code ? <CodeBlock code={code} attached /> : undefined}
    >
      <story.Story args={story.args} />
    </PreviewSurface>
  );
}
