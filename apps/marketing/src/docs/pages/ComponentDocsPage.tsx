/**
 * A component's Docs view — the native equivalent of Storybook's autodocs page.
 *
 * Everything on it comes from the two joined sources: prose, examples and their
 * curated snippets from the CSF module; the prop table, import line and status
 * from the Code Connect manifest.
 */
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  DocsPageHeader,
  DocsProse,
  DocsSection,
  DocsTabs,
  InlineMarkdown,
  PrimaryExample,
  PropsTable,
  StatusBadge,
  StoryExample,
} from "../components";
import { exampleStories, getDocsComponent, inspectStory } from "../registry";
import { stalenessFor } from "../staleness";
import { useStorybookLink } from "../useStorybookLink";
import { CopyAiContext } from "../ai/CopyAiContext";
import { componentTabs } from "./componentTabs";
import { DocsNotFound } from "./DocsNotFound";
import styles from "../components/content.module.css";

export function ComponentDocsPage() {
  const { slug } = useParams();
  const component = getDocsComponent(slug);
  const storybookHref = useStorybookLink(component?.storyTitle);
  const staleness = useMemo(() => stalenessFor(component?.entry), [component]);

  if (!component) return <DocsNotFound slug={slug} />;

  const { entry, related } = component;
  const canonical = inspectStory(component);
  const examples = exampleStories(component);

  return (
    <>
      <DocsPageHeader
        title={component.name}
        lede={<InlineMarkdown text={component.description} />}
        // Only rendered when something is actually wrong — see StatusBadge.
        actions={<StatusBadge component={component} staleness={staleness} />}
      />

      <DocsTabs tabs={componentTabs(component.slug)} active="docs">
        {/* The canonical instance with its import + usage attached, then the AI
            context buttons directly beneath it — the copy action sits with the
            thing it copies rather than up in the page chrome. */}
        {canonical && <PrimaryExample component={component} story={canonical} />}

        <div className={styles.primaryActions}>
          <CopyAiContext
            component={component}
            staleness={staleness}
            storybookUrl={storybookHref ?? undefined}
          />
        </div>

        <DocsProse>
          {examples.length > 0 && (
            <DocsSection
              title="Examples"
              subtitle="Every example is the real component, rendered live."
            >
              {examples.map((story) => (
                <StoryExample key={story.exportName} story={story} />
              ))}
            </DocsSection>
          )}

          <DocsSection
            title="Props"
            subtitle={
              entry
                ? `The complete API of ${entry.codeName}, scanned from ${entry.codePath}.`
                : "No verified manifest entry matched this story, so there is no prop table."
            }
          >
            {entry && <PropsTable props={entry.props} />}
          </DocsSection>

          {related.length > 0 && (
            <DocsSection
              title="Subcomponents"
              subtitle={`${component.name} is compound. Compose it from these parts rather than looking for props on the root.`}
            >
              {related.map((sub) => (
                <div key={sub.codeName}>
                  <h3 className={styles.sectionTitle} style={{ fontSize: "var(--type-size-body-large)" }}>
                    {sub.codeName}
                  </h3>
                  <PropsTable props={sub.props} showPassthrough={false} />
                </div>
              ))}
            </DocsSection>
          )}

          <DocsSection title="Source">
            <p>
              Story file: <code>{component.storyPath}</code>
              {entry && (
                <>
                  <br />
                  Component: <code>{entry.codePath}</code>
                </>
              )}
            </p>
            <p>
              <Link to="/docs">Back to the introduction</Link>
            </p>
          </DocsSection>
        </DocsProse>
      </DocsTabs>
    </>
  );
}
