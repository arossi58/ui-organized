/**
 * A component's Inspect view — the native equivalent of Storybook's `Inspect`
 * story plus the Figma-style Inspector panel.
 *
 * One live instance driven by real controls, with the element/token inspector,
 * the colour-vision simulations and an axe run all pointed at the same rendered
 * DOM. The variant matrix lives on the Docs tab instead: its examples already
 * enumerate the variants, and showing them twice made this view a scroll.
 */
import { useCallback, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@ui-organized/react";
import {
  DocsPageHeader,
  DocsProse,
  DocsSection,
  DocsTabs,
  InlineMarkdown,
  PreviewSurface,
  StatusBadge,
} from "../components";
import { getDocsComponent, inspectStory } from "../registry";
import { stalenessFor } from "../staleness";
import { useStorybookLink } from "../useStorybookLink";
import { CopyAiContext } from "../ai/CopyAiContext";
import { PropertyControls } from "../inspect/PropertyControls";
import { ElementInspector } from "../inspect/ElementInspector";
import { useInspection } from "../inspect/useInspection";
import { A11yResults, A11yRunButton } from "../a11y/A11yResults";
import { useA11yScan } from "../a11y/useA11yScan";
import { VisionFilterDefs, VisionFilterMenu, visionFilterValue } from "../a11y/VisionFilters";
import { componentTabs } from "./componentTabs";
import { DocsNotFound } from "./DocsNotFound";
import styles from "../inspect/inspect.module.css";

export function ComponentInspectPage() {
  const { slug } = useParams();
  const component = getDocsComponent(slug);
  const storybookHref = useStorybookLink(component?.storyTitle);
  const staleness = useMemo(() => stalenessFor(component?.entry), [component]);

  const story = component ? inspectStory(component) : undefined;
  const [overrides, setOverrides] = useState<Record<string, unknown>>({});
  const [vision, setVision] = useState<string | null>(null);
  const stage = useRef<HTMLDivElement>(null);

  const args = useMemo(() => ({ ...(story?.args ?? {}), ...overrides }), [story, overrides]);
  const { inspection, refresh, highlight } = useInspection(stage, args);
  const scan = useA11yScan(stage, args);

  const setArg = useCallback((name: string, value: unknown) => {
    setOverrides((current) => ({ ...current, [name]: value }));
  }, []);
  const reset = useCallback(() => setOverrides({}), []);

  if (!component) return <DocsNotFound slug={slug} />;
  if (!story) {
    return (
      <>
        <DocsPageHeader title={component.name} />
        <p className={styles.empty}>This component has no story to inspect.</p>
      </>
    );
  }

  return (
    <>
      <VisionFilterDefs />

      <DocsPageHeader
        title={component.name}
        lede={<InlineMarkdown text={component.description} />}
        actions={<StatusBadge component={component} staleness={staleness} />}
      />

      <DocsTabs tabs={componentTabs(component.slug)} active="inspect">
        {/* Controls on the left, preview on the right — you read the property
            you're about to change, then watch the component respond, rather
            than tracking back across the page. */}
        <div className={styles.grid}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Properties</h2>
            {component.entry ? (
              <PropertyControls
                props={component.entry.props}
                argTypes={component.argTypes}
                args={args}
                onChange={setArg}
                onReset={reset}
              />
            ) : (
              <p className={styles.empty}>
                No verified manifest entry matched this story, so there are no controls to show.
              </p>
            )}
          </div>

          <div>
            <PreviewSurface
              layout={story.layout}
              label={component.name}
              stageRef={stage}
              visionFilter={visionFilterValue(vision)}
              toolbar={
                <>
                  <VisionFilterMenu value={vision} onChange={setVision} />
                  <A11yRunButton scan={scan} />
                  <Button intent="ghost" size="sm" icon="refresh" onClick={refresh}>
                    Re-read
                  </Button>
                </>
              }
            >
              <story.Story args={args} />
            </PreviewSurface>

            {/* Findings sit directly under the component they describe. */}
            <A11yResults scan={scan} />

            {/* Matching the Docs tab. Here it picks up the live control values,
                so it copies what you've actually built. */}
            <div className={styles.primaryActions}>
              <CopyAiContext
                component={component}
                staleness={staleness}
                liveArgs={args}
                storybookUrl={storybookHref ?? undefined}
              />
            </div>
          </div>
        </div>

        <DocsProse>
          <DocsSection
            title="Inspect"
            subtitle="The rendered element tree, with each style property tagged as token-backed, inherited, or a hardcoded value that should have been a token."
          >
            <ElementInspector nodes={inspection.nodes} onHighlight={highlight} />
          </DocsSection>
        </DocsProse>
      </DocsTabs>
    </>
  );
}
