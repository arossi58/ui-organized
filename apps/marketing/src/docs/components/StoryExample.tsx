/**
 * One story rendered live, above the snippet that produces it.
 *
 * In React the snippet is the story's own hand-curated
 * `parameters.docs.source.code` — the same string Storybook's Code panel shows —
 * so the copyable code is real usage rather than a serialization of the demo
 * layout wrappers around it. In the other frameworks there is no such string, so
 * a snippet appears only where one can be derived from the args and be the whole
 * example; see `frameworks/sample.ts`.
 */
import { exampleSnippet, useDocsFramework } from "../frameworks";
import type { DocsComponent, DocsStory } from "../registry";
import { CodeBlock } from "./CodeBlock";
import { PreviewSurface } from "./PreviewSurface";
import styles from "./preview.module.css";

export function StoryExample({
  component,
  story,
  heading = true,
}: {
  component: DocsComponent;
  story: DocsStory;
  heading?: boolean;
}) {
  const { framework } = useDocsFramework();
  const snippet = exampleSnippet(component, story, framework);

  return (
    <div className={styles.example}>
      {heading && <h3 className={styles.exampleTitle}>{story.name}</h3>}
      <PreviewSurface layout={story.layout} label={story.name}>
        <story.Story args={story.args} />
      </PreviewSurface>
      {snippet && (
        <div className={styles.exampleCode}>
          <CodeBlock code={snippet.code} language={snippet.language} />
        </div>
      )}
    </div>
  );
}
