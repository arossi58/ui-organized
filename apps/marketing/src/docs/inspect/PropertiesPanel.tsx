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
import { useState } from "react";
import { SegmentedControl } from "@ui-organized/react";
import type { InspectedNode } from "@ui-organized/storybook-inspector/inspect";
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
  onChange: (name: string, value: unknown) => void;
  onReset: () => void;
  nodes: InspectedNode[];
  onHighlight: (ref: number | null) => void;
  onReveal: (ref: number | null) => void;
}

export function PropertiesPanel({
  component,
  args,
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
          <PropertyControls
            props={component.entry.props}
            argTypes={component.argTypes}
            args={args}
            onChange={onChange}
            onReset={onReset}
          />
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
