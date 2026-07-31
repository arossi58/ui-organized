/**
 * A component's Inspect view — the native equivalent of Storybook's `Inspect`
 * story plus the Figma-style Inspector panel.
 *
 * One live instance driven by real controls, with the element/token inspector,
 * the colour-vision simulations and an axe run all pointed at the same rendered
 * DOM. The controls and the inspector are two views of one panel beside the
 * preview (see `PropertiesPanel`). The variant matrix lives on the Docs tab
 * instead: its examples already enumerate the variants, and showing them twice
 * made this view a scroll.
 */
import { useCallback, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@ui-organized/react";
import {
  DocsPageHeader,
  DocsTabs,
  InlineMarkdown,
  PreviewSurface,
  StatusBadge,
} from "../components";
import { getDocsComponent, inspectStory } from "../registry";
import { stalenessFor } from "../staleness";
import { useStorybookLink } from "../useStorybookLink";
import { CopyAiContext } from "../ai/CopyAiContext";
import { PropertiesPanel } from "../inspect/PropertiesPanel";
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

  // Opening an overlay from the State switch makes it controlled, and a
  // controlled overlay whose own trigger and close button can no longer move it
  // is a trap. Hand the story an `onOpenChange` that writes back to the same
  // override, so the switch and the component always agree in both directions —
  // clicking the trigger in the preview flips the switch, and vice versa.
  const entryProps = component?.entry?.props;
  const args = useMemo(() => {
    const merged: Record<string, unknown> = { ...(story?.args ?? {}), ...overrides };
    const controllable = entryProps?.some((prop) => prop.name === "onOpenChange");
    if (controllable && !("onOpenChange" in merged)) {
      merged.onOpenChange = (open: boolean) =>
        setOverrides((current) => ({ ...current, open }));
    }
    return merged;
  }, [story, overrides, entryProps]);
  const { inspection, refresh, highlight, reveal } = useInspection(stage, args);
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
        {/* Panel on the left, preview on the right — you read the property
            you're about to change, then watch the component respond, rather
            than tracking back across the page. The inspector shares the panel,
            so hovering an element outlines it in the preview beside it. */}
        <div className={styles.grid}>
          <PropertiesPanel
            component={component}
            args={args}
            onChange={setArg}
            onReset={reset}
            nodes={inspection.nodes}
            onHighlight={highlight}
            onReveal={reveal}
          />

          <div>
            <PreviewSurface
              layout={story.layout}
              label={component.name}
              stageRef={stage}
              containOverlays
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
      </DocsTabs>
    </>
  );
}
