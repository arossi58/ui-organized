/**
 * The panel beside the live preview: the component's controls and the element
 * inspector, behind a two-way switch.
 *
 * They used to sit in two places — controls in this column, the inspector in a
 * prose section far below the preview — which meant scrolling away from the
 * component to read what it was made of, and hover-highlighting an element in a
 * preview that was by then off-screen. Both are views of the same instance, so
 * they belong in the same frame.
 *
 * `SegmentedControl` rather than `Tabs` because the page header already renders
 * a `Tabs` strip (Docs / Inspect); a second tab bar inside it would read as two
 * competing levels of the same control.
 */
import { useMemo, useState } from "react";
import { SegmentedControl } from "@ui-organized/react";
import { FRAMEWORK_INFO } from "@ui-organized/code-connect/browser";
import type { InspectedNode } from "@ui-organized/storybook-inspector/inspect";
import { CodeBlock } from "../components";
import { liveSnippet, useDocsFramework } from "../frameworks";
import type { DocsComponent } from "../registry";
import { ElementInspector } from "./ElementInspector";
import { PropertyControls } from "./PropertyControls";
import styles from "./inspect.module.css";

const VIEWS = [
  { value: "properties", label: "Properties" },
  { value: "inspect", label: "Inspect" },
];

interface PropertiesPanelProps {
  component: DocsComponent;
  /** Story args with the live control overrides already merged in. */
  args: Record<string, unknown>;
  /** The same, minus what the page adds only to drive the preview, which is
   * not something a reader would write. */
  codeArgs: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
  onReset: () => void;
  nodes: InspectedNode[];
  onHighlight: (ref: number | null) => void;
  onReveal: (ref: number | null) => void;
}

export function PropertiesPanel({
  component,
  args,
  codeArgs,
  onChange,
  onReset,
  nodes,
  onHighlight,
  onReveal,
}: PropertiesPanelProps) {
  const [view, setView] = useState("properties");

  return (
    <div className={styles.panel}>
      <SegmentedControl
        className={styles.panelTabs}
        aria-label="Panel view"
        size="sm"
        items={VIEWS}
        value={view}
        onValueChange={setView}
      />

      {/* Both views stay mounted: switching tabs shouldn't lose the element you
          had selected, or the control you were part-way through editing. */}
      <div className={styles.panelView} hidden={view !== "properties"}>
        {component.entry ? (
          <>
            <PropertyControls
              props={component.entry.props}
              argTypes={component.argTypes}
              args={args}
              onChange={onChange}
              onReset={onReset}
            />
            <LiveCode component={component} args={codeArgs} />
          </>
        ) : (
          <p className={styles.empty}>
            No verified manifest entry matched this story, so there are no controls.
          </p>
        )}
      </div>

      <div className={styles.panelView} hidden={view !== "inspect"}>
        <ElementInspector nodes={nodes} onHighlight={onHighlight} onReveal={onReveal} />
      </div>
    </div>
  );
}

/** The code for exactly what the controls describe, in the chosen library. */
function LiveCode({
  component,
  args,
}: {
  component: DocsComponent;
  args: Record<string, unknown>;
}) {
  const { framework } = useDocsFramework();
  const snippet = useMemo(
    () => liveSnippet(component, args, framework),
    [component, args, framework],
  );
  const { label } = FRAMEWORK_INFO[framework];

  if (!snippet) {
    return <p className={styles.empty}>{label} doesn't have {component.name} yet.</p>;
  }
  return (
    <div className={styles.liveCode}>
      <CodeBlock title="Code" code={snippet.code} language={snippet.language} />
      {snippet.dropped.length ? (
        <p className={styles.empty}>
          Left out, because {label}'s {component.name} doesn't take them:{" "}
          {snippet.dropped.join(", ")}.
        </p>
      ) : null}
    </div>
  );
}
