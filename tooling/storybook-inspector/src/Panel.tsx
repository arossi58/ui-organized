/**
 * Root panel. Leads with a Figma-Dev-Mode-style inspection of the REAL rendered
 * story — element/class tree + applied token variables, typography, icon, and
 * layout for the selected element — and keeps the manifest-driven live args in a
 * collapsed section below (still real `useArgs` writes).
 */
import { useEffect, useState } from "react";
import { useArgTypes } from "storybook/manager-api";
import { useTheme } from "storybook/theming";
import { useManifestEntry } from "./hooks/useManifestEntry.js";
import { useLiveArgs } from "./hooks/useLiveArgs.js";
import { usePreviewInspection } from "./hooks/usePreviewInspection.js";
import {
  controlsFor,
  controlFromArgType,
  defaultOf,
  type Control,
  type StoryArgTypeInput,
} from "./controls.js";
import { matchesQuery } from "./inspect/format.js";
import { driftedPropNames } from "./arg-drift.js";
import { StatusBadge } from "./components/StatusBadge.js";
import { PropertySection } from "./components/PropertySection.js";
import { InspectorTree } from "./components/InspectorTree.js";
import { ElementDetails } from "./components/ElementDetails.js";
import { VariantMatrix } from "./components/VariantMatrix.js";
import { VariantPropertyRow } from "./components/VariantPropertyRow.js";
import { BooleanPropertyRow } from "./components/BooleanPropertyRow.js";
import { TextPropertyRow } from "./components/TextPropertyRow.js";
import { NumberPropertyRow } from "./components/NumberPropertyRow.js";
import { ColorPropertyRow } from "./components/ColorPropertyRow.js";
import { RangePropertyRow } from "./components/RangePropertyRow.js";
import { ObjectPropertyRow } from "./components/ObjectPropertyRow.js";

function Row({
  control,
  value,
  drift,
  setArg,
}: {
  control: Control;
  value: unknown;
  drift?: string;
  setArg: (name: string, value: unknown) => void;
}) {
  const onChange = (v: unknown) => setArg(control.name, v);
  switch (control.kind) {
    case "variant":
      return <VariantPropertyRow control={control} value={value} drift={drift} onChange={onChange} />;
    case "boolean":
      return <BooleanPropertyRow control={control} value={value} drift={drift} onChange={onChange} />;
    case "number":
      return <NumberPropertyRow control={control} value={value} drift={drift} onChange={onChange} />;
    case "range":
      return <RangePropertyRow control={control} value={value} drift={drift} onChange={onChange} />;
    case "color":
      return <ColorPropertyRow control={control} value={value} drift={drift} onChange={onChange} />;
    case "object":
      return <ObjectPropertyRow control={control} value={value} drift={drift} onChange={onChange} />;
    default:
      return <TextPropertyRow control={control} value={value} drift={drift} onChange={onChange} />;
  }
}

function ArgControls() {
  const { resolution, staleness, drift } = useManifestEntry();
  const argTypes = (useArgTypes() ?? {}) as Record<string, StoryArgTypeInput>;
  const { args, setArg, reset } = useLiveArgs();
  const entry = resolution.entry;

  const drifted = driftedPropNames(drift);
  const driftDetail = (name: string) => drift.find((d) => d.prop === name)?.detail;

  // Full Controls-panel parity: build a control for every arg from its argType, and
  // where the manifest has a verified variant (accurate enum options from code) use
  // that instead. Order follows the argTypes definition order, like Controls.
  const manifestByName = new Map((entry ? controlsFor(entry.props) : []).map((c) => [c.name, c]));
  const controls: Control[] = [];
  const seen = new Set<string>();
  for (const [name, at] of Object.entries(argTypes)) {
    seen.add(name);
    const fromArg = controlFromArgType(name, at);
    const manifest = manifestByName.get(name);
    // Prefer the manifest's variant (verified options); else the argType control.
    const chosen = manifest?.kind === "variant" ? manifest : fromArg ?? manifest;
    if (!chosen) continue;
    controls.push({
      ...chosen,
      description: chosen.description ?? at.description,
      defaultValue: chosen.defaultValue ?? defaultOf(at),
      verified: manifestByName.has(name),
    });
  }
  // Manifest props Storybook didn't surface as argTypes (rare).
  for (const [name, c] of manifestByName) if (!seen.has(name)) controls.push({ ...c, verified: true });

  if (controls.length === 0) {
    return <p className="fcp-empty">This story has no controllable args.</p>;
  }

  return (
    <>
      <div className="fcp-args-head">
        {entry ? (
          <StatusBadge
            confidence={resolution.confidence}
            isStale={staleness?.isStale}
            changedProps={staleness?.changedProps}
            deprecated={entry.status === "deprecated"}
          />
        ) : (
          <span className="fcp-empty" style={{ padding: 0 }}>Story args</span>
        )}
        <button type="button" className="fcp-link" onClick={reset}>↺ Reset all</button>
      </div>

      {controls.map((control) => (
        <Row
          key={control.name}
          control={control}
          value={args[control.name]}
          drift={drifted.has(control.name) ? driftDetail(control.name) : undefined}
          setArg={setArg}
        />
      ))}
    </>
  );
}

export function Panel() {
  const { nodes, error, refresh, reveal, pick } = usePreviewInspection();
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState("");
  const [picking, setPicking] = useState(false);

  // Filter the element list; nodes keep their original `ref`, so selection +
  // highlighting stay correct against the full list.
  const visible = query.trim() ? nodes.filter((n) => matchesQuery(n, query)) : nodes;

  // Keep the selection valid when the story (and its node list) changes.
  useEffect(() => {
    if (selected >= nodes.length) setSelected(0);
  }, [nodes, selected]);

  // Reveal (open portal if needed) + highlight the selected element whenever it or
  // the tree changes.
  useEffect(() => {
    if (nodes.length) reveal(selected);
  }, [selected, nodes, reveal]);

  // Pick mode: click an element in the preview to select its tree node.
  useEffect(() => {
    if (!picking) return;
    const stop = pick((ref) => {
      // ref < 0 means the user clicked empty space — cancel picking and leave the
      // selection untouched (the highlight was already cleared in the hook).
      if (ref >= 0) setSelected(ref);
      setPicking(false);
    });
    return stop;
  }, [picking, pick, nodes]);

  const current = nodes[selected] ?? nodes[0];

  // Drive the injected DS tokens (see manager.tsx) light/dark. The manager theme
  // is built with `base: mode` from the visitor's site theme, so `theme.base` is
  // the same mode the chrome uses — keeping the panel consistent with it rather
  // than tracking the preview canvas toolbar (which only re-themes the story).
  const theme = useTheme() as { base?: string };
  const mode = theme?.base === "dark" ? "dark" : "light";

  return (
    <div className="fcp-root" data-theme={mode}>
      <div className="fcp-toolbar">
        <span className="fcp-toolbar-title">Inspect</span>
        <span className="fcp-toolbar-actions">
          <button
            type="button"
            className="fcp-link"
            data-active={String(picking)}
            title="Pick an element in the preview"
            onClick={() => setPicking((v) => !v)}
          >
            ⌖ {picking ? "Picking…" : "Pick"}
          </button>
          <button type="button" className="fcp-link" onClick={refresh}>
            ⟳ Refresh
          </button>
        </span>
      </div>

      {error && nodes.length === 0 ? (
        <p className="fcp-empty">{error}</p>
      ) : nodes.length === 0 ? (
        <p className="fcp-empty">Nothing rendered to inspect.</p>
      ) : (
        <>
          <input
            className="fcp-input fcp-search"
            placeholder="Filter elements by tag / class / text…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
          />
          <InspectorTree
            nodes={visible}
            selected={selected}
            onSelect={setSelected}
            collapsible={!query.trim()}
          />
          <div className="fcp-divider" />
          {current && <ElementDetails node={current} />}
        </>
      )}

      <PropertySection title="Variants" defaultCollapsed>
        <VariantMatrix />
      </PropertySection>

      <PropertySection title="Args (live)">
        <ArgControls />
      </PropertySection>
    </div>
  );
}
