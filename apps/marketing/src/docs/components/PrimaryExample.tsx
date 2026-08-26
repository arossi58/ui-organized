/**
 * The canonical instance of a component, with its complete code attached.
 *
 * "Complete" is the point: the snippet carries the import line *and* the usage,
 * inside the same frame as the preview it produces. A separate "Import" section
 * further down leaves a reader to assemble two halves themselves, and leaves
 * anyone who copies the usage with code that doesn't resolve.
 *
 * The code follows the selected framework; the preview does not, and cannot —
 * this is a React app rendering the React components. `FrameworkSwitcher` says
 * so on the page.
 */
import { FrameworkGapNote, gapFor, primarySnippet, useDocsFramework } from "../frameworks";
import type { DocsComponent, DocsStory } from "../registry";
import { CodeBlock } from "./CodeBlock";
import { PreviewSurface } from "./PreviewSurface";

export function PrimaryExample({
  component,
  story,
}: {
  component: DocsComponent;
  story: DocsStory;
}) {
  const { framework } = useDocsFramework();
  const snippet = primarySnippet(component, story, framework);
  // Only when the library hasn't got the component. A React page with no
  // snippet at all is a story with neither a curated one nor a manifest entry,
  // which the status badge already reports.
  const gap = snippet ? undefined : gapFor(component, story, framework);

  return (
    <PreviewSurface
      layout={story.layout}
      label={component.name}
      footer={
        snippet ? (
          <CodeBlock code={snippet.code} language={snippet.language} attached />
        ) : gap ? (
          <FrameworkGapNote component={component} gap={gap} />
        ) : undefined
      }
    >
      <story.Story args={story.args} />
    </PreviewSurface>
  );
}
