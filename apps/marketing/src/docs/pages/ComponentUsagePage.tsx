/**
 * A component's Usage view — when to reach for it, and when not to.
 *
 * The one tab whose content isn't derived from anything: the prop table is
 * scanned, the examples are the real stories, and this is hand-authored
 * judgement about which component the job actually calls for. It comes from
 * `@ui-organized/code-connect/usage`, so the same sentences reach the "Copy for
 * AI" block and the static `/ai/<Component>.md` files — a reader and an agent
 * get the same boundaries.
 */
import { useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { getUsageGuide } from "@ui-organized/code-connect/usage";
import {
  DocsPageHeader,
  DocsProse,
  DocsSection,
  DocsTabs,
  InlineMarkdown,
  StatusBadge,
  UsageAvoidList,
  UsageGuidanceGrid,
  UsageList,
  UsageRelatedList,
  UsageSummary,
} from "../components";
import { getDocsComponent } from "../registry";
import { stalenessFor } from "../staleness";
import { usageExamplesFor } from "../usage/examples";
import { componentTabs } from "./componentTabs";
import { DocsNotFound } from "./DocsNotFound";

export function ComponentUsagePage() {
  const { slug } = useParams();
  const component = getDocsComponent(slug);
  const staleness = useMemo(() => stalenessFor(component?.entry), [component]);
  const guide = getUsageGuide(component?.slug);

  if (!component) return <DocsNotFound slug={slug} />;
  // A component with no guide has no Usage tab, so this URL is only reachable by
  // hand or from a stale link. Send it to the page that does exist rather than
  // to a not-found — the component is real, this view of it isn't written yet.
  if (!guide) return <Navigate to={`/docs/${component.slug}`} replace />;

  return (
    <>
      {/* Identical header to the Docs and Inspect views, so nothing above the
          tab strip moves as you switch between them. */}
      <DocsPageHeader
        title={component.name}
        lede={<InlineMarkdown text={component.description} />}
        actions={<StatusBadge component={component} staleness={staleness} />}
      />

      <DocsTabs tabs={componentTabs(component.slug)} active="usage">
        <DocsProse>
          <UsageSummary text={guide.summary} />

          <DocsSection title="When to use">
            <UsageList items={guide.useWhen} />
          </DocsSection>

          <DocsSection
            title="When not to use"
            subtitle="Each line names the component that does the job instead, where one does."
          >
            <UsageAvoidList items={guide.avoid} />
          </DocsSection>

          {/* No subtitle: the cards are labelled Do and Don't, which is the whole
              explanation the section needs. */}
          <DocsSection title="Best practices">
            <UsageGuidanceGrid
              pairs={guide.guidance}
              examples={usageExamplesFor(component.slug)}
              componentName={component.name}
            />
          </DocsSection>

          {guide.content?.length ? (
            <DocsSection title="Writing">
              <UsageList items={guide.content} />
            </DocsSection>
          ) : null}

          <DocsSection
            title="Accessibility"
            subtitle="What the component already handles, and what it still needs from you."
          >
            <UsageList items={guide.accessibility} />
          </DocsSection>

          {guide.related?.length ? (
            <DocsSection title="Related components">
              <UsageRelatedList items={guide.related} />
            </DocsSection>
          ) : null}
        </DocsProse>
      </DocsTabs>
    </>
  );
}
