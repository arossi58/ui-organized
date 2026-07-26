/**
 * One story rendered live, above the snippet that produces it.
 *
 * The snippet is the story's own hand-curated `parameters.docs.source.code` —
 * the same string Storybook's Code panel shows — so the copyable code is real
 * usage rather than a serialization of the demo layout wrappers around it.
 */
import type { DocsStory } from "../registry";
import { CodeBlock } from "./CodeBlock";
import { PreviewSurface } from "./PreviewSurface";
import styles from "./preview.module.css";

export function StoryExample({ story, heading = true }: { story: DocsStory; heading?: boolean }) {
  return (
    <div className={styles.example}>
      {heading && <h3 className={styles.exampleTitle}>{story.name}</h3>}
      <PreviewSurface layout={story.layout} label={story.name}>
        <story.Story args={story.args} />
      </PreviewSurface>
      {story.code && (
        <div className={styles.exampleCode}>
          <CodeBlock code={story.code} />
        </div>
      )}
    </div>
  );
}
