/**
 * Plugin UI (runs in the iframe), built with @ui-organized/react.
 *
 * Phase 2: a searchable "select a component" list driven by the committed
 * Component Manifest — every `@ui-organized/react` component with its inferred
 * variant axes and prop kinds. Nothing renders these yet (that's Phase 3); the
 * one buildable entry is `Button`, which runs the Phase 0 hand-authored slice
 * through the Builder and shows the build report + resolution queue.
 */

// Roboto — the design system's type family. Offline plugin, so the woff2 files
// are embedded into the bundle as data URIs (see the .woff2 loader in build.mjs).
import "@fontsource/roboto/latin-400.css";
import "@fontsource/roboto/latin-500.css";
import "@fontsource/roboto/latin-600.css";
import "@fontsource/roboto/latin-700.css";

import "@ui-organized/tokens/variables.css";
import "@ui-organized/react/styles";
import "./ui.css";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { createRoot } from "react-dom/client";
import { Alert, Badge, Button, IconProvider, Input, Select } from "@ui-organized/react";
import manifestJson from "./generated/component-manifest.json";
import { SPECS } from "./generated/specs";
import type { ComponentManifest, ComponentManifestEntry } from "./manifest";
import { resolutionKey, type Resolution } from "./resolution";
import type { UnresolvedKind } from "./spec";

const manifest = manifestJson as ComponentManifest;

/** Components with a committed, rendered spec — buildable straight from the list. */
const SPEC_NAMES = new Set(Object.keys(SPECS));

interface UnresolvedRecord {
  id: string;
  kind: string;
  where: string;
  found?: string;
  expected?: string;
  candidates?: string[];
}
interface BuildReport {
  component: string;
  variantsBuilt: number;
  boundTokens: number;
  acceptedRaw?: number;
  unresolved: UnresolvedRecord[];
  /** Every "Collection:name" Variable in the file — options for the dropdowns. */
  variables?: string[];
  /** Every local component name in the file — options for icon SLOT_DEFAULT. */
  components?: string[];
}

/** Build the dropdown options for an unresolved token: candidates, then same-collection Variables, then "accept raw". */
function resolutionOptions(
  rec: UnresolvedRecord,
  variables: string[],
): { value: string; label: string }[] {
  const collection = rec.expected?.split(":")[0];
  const sameCollection = collection ? variables.filter((v) => v.startsWith(`${collection}:`)) : variables;
  const refs = [...new Set([...(rec.candidates ?? []), ...sameCollection])];
  return [
    ...refs.map((v) => ({ value: `bind:${v}`, label: v })),
    { value: "raw", label: "Accept raw value" },
  ];
}

/** Build the dropdown options for an unresolved icon slot: candidates, then file components, then "keep vector". */
function slotOptions(rec: UnresolvedRecord, components: string[]): { value: string; label: string }[] {
  const refs = [...new Set([...(rec.candidates ?? []), ...components])];
  return [
    ...refs.map((c) => ({ value: `bind:${c}`, label: c })),
    { value: "raw", label: "Keep as vector" },
  ];
}

function parsePick(kind: UnresolvedKind, value: string): Resolution {
  if (value === "raw") return { kind, action: "accept-raw" };
  return { kind, action: "bind", variable: value.replace(/^bind:/, "") };
}

/** Buildable = has a committed rendered spec, or Button (the hand-authored slice). */
function isBuildable(component: string): boolean {
  return SPEC_NAMES.has(component) || component === "Button";
}

/** Collapse per-occurrence unresolved records (e.g. the same token across 36 variants). */
function dedupeUnresolved(records: UnresolvedRecord[]): { rec: UnresolvedRecord; count: number }[] {
  const map = new Map<string, { rec: UnresolvedRecord; count: number }>();
  for (const r of records) {
    const key = r.expected ?? r.found ?? r.id;
    const existing = map.get(key);
    if (existing) existing.count++;
    else map.set(key, { rec: r, count: 1 });
  }
  return [...map.values()];
}

function BrandMark() {
  return (
    <svg className="app__brand-glyph" viewBox="0 0 144 144" fill="currentColor" aria-hidden="true">
      <path d="M86.1392 86.3589C85.1792 86.3589 84.4858 86.2256 84.0592 85.9589C83.6325 85.6656 83.3658 85.2789 83.2592 84.7989C83.1792 84.3189 83.1392 83.8256 83.1392 83.3189V61.4389C83.1392 60.9056 83.1792 60.4123 83.2592 59.9589C83.3658 59.5056 83.6325 59.1323 84.0592 58.8389C84.4858 58.5456 85.1925 58.3989 86.1792 58.3989C87.1925 58.3989 87.8992 58.5456 88.2992 58.8389C88.7258 59.1323 88.9792 59.5056 89.0592 59.9589C89.1658 60.4123 89.2192 60.9189 89.2192 61.4789V83.3589C89.2192 83.8656 89.1658 84.3589 89.0592 84.8389C88.9525 85.2923 88.6858 85.6656 88.2592 85.9589C87.8592 86.2256 87.1525 86.3589 86.1392 86.3589Z" />
      <path d="M67.6802 86.7191C65.7335 86.7191 64.0135 86.3458 62.5202 85.5991C61.0535 84.8258 59.8002 83.8125 58.7602 82.5591C57.7469 81.2791 56.9869 79.8525 56.4802 78.2791C55.9735 76.6791 55.7202 75.0525 55.7202 73.3991V61.4391C55.7202 60.9058 55.7602 60.4125 55.8402 59.9591C55.9469 59.4791 56.2135 59.0925 56.6402 58.7991C57.0669 58.5058 57.7735 58.3591 58.7602 58.3591C59.7735 58.3591 60.4935 58.5058 60.9202 58.7991C61.3469 59.0925 61.6002 59.4791 61.6802 59.9591C61.7869 60.4125 61.8402 60.9191 61.8402 61.4791V73.3991C61.8402 74.5725 62.0269 75.7058 62.4002 76.7991C62.8002 77.8925 63.4402 78.7991 64.3202 79.5191C65.2002 80.2391 66.3602 80.5991 67.8002 80.5991C69.0269 80.5991 70.0802 80.3058 70.9602 79.7191C71.8402 79.1058 72.5202 78.2658 73.0002 77.1991C73.4802 76.1058 73.7202 74.8258 73.7202 73.3591V61.1991C73.7202 60.7191 73.7736 60.2658 73.8802 59.8391C73.9869 59.4125 74.2535 59.0658 74.6802 58.7991C75.1069 58.5058 75.8136 58.3591 76.8002 58.3591C77.7869 58.3591 78.4802 58.5191 78.8802 58.8391C79.3069 59.1325 79.5602 59.5058 79.6402 59.9591C79.7469 60.4125 79.8002 60.9191 79.8002 61.4791V73.4791C79.8002 75.1591 79.5335 76.7858 79.0002 78.3591C78.4935 79.9325 77.7202 81.3458 76.6802 82.5991C75.6669 83.8525 74.4002 84.8525 72.8802 85.5991C71.3869 86.3458 69.6535 86.7191 67.6802 86.7191Z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M46 32.427C46 35.5043 48.4947 37.999 51.572 37.999H93.4221C96.4995 37.999 98.9941 35.5043 98.9941 32.427V21C98.9941 18.7909 100.785 17 102.994 17C105.203 17 106.994 18.7909 106.994 21V32.427C106.994 35.5043 109.489 37.999 112.566 37.999H120C122.209 37.999 124 39.7899 124 41.999C124 44.2082 122.209 45.999 120 45.999H112.566C109.489 45.999 106.994 48.4937 106.994 51.571V91.3948C106.994 94.4721 109.489 96.9668 112.566 96.9668H140C142.209 96.9668 144 98.7577 144 100.967C144 103.176 142.209 104.967 140 104.967H112.566C109.489 104.967 106.994 107.461 106.994 110.539V122C106.994 124.209 105.203 126 102.994 126C100.785 126 98.9941 124.209 98.9941 122V110.539C98.9941 107.461 96.4995 104.967 93.4221 104.967H51.572C48.4947 104.967 46 107.461 46 110.539V121C46 123.209 44.2091 125 42 125C39.7909 125 38 123.209 38 121V110.539C38 107.461 35.5053 104.967 32.428 104.967H24C21.7909 104.967 20 103.176 20 100.967C20 98.7577 21.7909 96.9668 24 96.9668H32.428C35.5053 96.9668 38 94.4721 38 91.3948V51.571C38 48.4937 35.5053 45.999 32.428 45.999H4C1.79086 45.999 0 44.2082 0 41.999C0 39.7899 1.79086 37.999 4 37.999H32.428C35.5053 37.999 38 35.5043 38 32.427V21C38 18.7909 39.7909 17 42 17C44.2091 17 46 18.7909 46 21V32.427ZM51.572 45.999C48.4947 45.999 46 48.4937 46 51.571V91.3948C46 94.4721 48.4947 96.9668 51.572 96.9668H93.4221C96.4995 96.9668 98.9941 94.4721 98.9941 91.3948V51.571C98.9941 48.4937 96.4995 45.999 93.4221 45.999H51.572Z"
      />
    </svg>
  );
}

function summarize(entry: ComponentManifestEntry): string {
  const c = { BOOLEAN: 0, TEXT: 0, INSTANCE_SWAP: 0 } as Record<string, number>;
  for (const p of entry.properties) if (p.kind in c) c[p.kind] = (c[p.kind] ?? 0) + 1;
  const bits: string[] = [];
  if (c.BOOLEAN) bits.push(`${c.BOOLEAN} boolean`);
  if (c.TEXT) bits.push(`${c.TEXT} text`);
  if (c.INSTANCE_SWAP) bits.push(`${c.INSTANCE_SWAP} icon`);
  return bits.join(" · ") || "no other props";
}

function ComponentCard({
  entry,
  onBuild,
  busy,
}: {
  entry: ComponentManifestEntry;
  onBuild: () => void;
  busy: boolean;
}) {
  const axes = entry.properties.filter((p) => p.kind === "VARIANT");
  return (
    <div className="comp">
      <div className="comp__head">
        <span className="comp__name">{entry.component}</span>
        {isBuildable(entry.component) && (
          <Button intent="secondary" size="sm" onClick={onBuild} disabled={busy}>
            {busy ? "Building…" : "Build"}
          </Button>
        )}
      </div>
      <div className="comp__axes">
        {axes.length > 0 ? (
          axes.map((a) => (
            <Badge key={a.name} variant="info" size="sm" title={(a.values ?? []).join(" · ")}>
              {a.name} · {a.values?.length}
            </Badge>
          ))
        ) : (
          <span className="comp__muted">no variant axes</span>
        )}
      </div>
      <div className="comp__meta">{summarize(entry)}</div>
    </div>
  );
}

function App() {
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<BuildReport | null>(null);
  // Pending manual resolutions, keyed by resolutionKey(); cleared on each rebuild.
  const [picks, setPicks] = useState<Record<string, Resolution>>({});

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const msg = e.data?.pluginMessage;
      if (!msg) return;
      setBusy(false);
      if (msg.type === "built") {
        setReport(msg.report as BuildReport);
        setPicks({});
        setError(null);
      } else if (msg.type === "error") {
        setError(msg.message as string);
        setReport(null);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const buildComponent = (component: string) => {
    setError(null);
    setReport(null);
    setPicks({});
    setBusy(true);
    // A committed rendered spec builds by name; Button falls back to the slice.
    const message = SPEC_NAMES.has(component)
      ? { type: "build", component }
      : { type: "build-slice" };
    parent.postMessage({ pluginMessage: message }, "*");
  };

  const applyResolutions = () => {
    if (!report) return;
    setError(null);
    setBusy(true);
    parent.postMessage(
      { pluginMessage: { type: "resolve", component: report.component, resolutions: picks } },
      "*",
    );
  };

  const components = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const list = q
      ? manifest.components.filter((c) => c.component.toLowerCase().includes(q))
      : manifest.components;
    return list;
  }, [filter]);

  const unresolved = report?.unresolved ?? [];

  return (
    <IconProvider library="lucide" style="outline" strokeAdjustment={false}>
      <div className="app">
        <header className="app__header">
          <div className="app__brand">
            <BrandMark />
            <h1>Component Bridge</h1>
          </div>
          <p>
            {manifest.componentCount} components from <code>{manifest.source}</code> with their
            inferred variant axes. Building renders the spec into a Figma component.
          </p>
        </header>

        <p className="app__phase">
          <strong>Phase 2 — component manifest.</strong> Axes are inferred statically from each
          component's props. Only <code>Button</code> builds today (the Phase 0 slice); rendering
          the rest arrives in Phase 3. Import a theme first so the <code>interactive/*</code>{" "}
          Variables exist to bind against.
        </p>

        <Input
          size="sm"
          placeholder="Filter components…"
          value={filter}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
        />

        {report && (
          <Alert
            variant={unresolved.length > 0 ? "warning" : "success"}
            title={unresolved.length > 0 ? `Built ${report.component} with unresolved items` : `Built ${report.component}`}
          >
            <div className="report__stats">
              <span className="report__stat">
                <b>{report.variantsBuilt}</b>
                <span>variant{report.variantsBuilt === 1 ? "" : "s"}</span>
              </span>
              <span className="report__stat">
                <b>{report.boundTokens}</b>
                <span>token{report.boundTokens === 1 ? "" : "s"} bound</span>
              </span>
              <span className="report__stat">
                <b>{unresolved.length}</b>
                <span>unresolved</span>
              </span>
            </div>
          </Alert>
        )}

        {report && unresolved.length > 0 && (
          <div className="queue">
            {dedupeUnresolved(unresolved).map(({ rec, count }) => {
              const kind = rec.kind as UnresolvedKind;
              const key = resolutionKey(report.component, kind, rec.found ?? rec.id);
              const pick = picks[key];
              const value = pick ? (pick.action === "accept-raw" ? "raw" : `bind:${pick.variable}`) : "";
              const options =
                kind === "TOKEN_NO_MATCH"
                  ? resolutionOptions(rec, report.variables ?? [])
                  : kind === "SLOT_DEFAULT"
                    ? slotOptions(rec, report.components ?? [])
                    : null;
              return (
                <div className="queue__card" key={key}>
                  <div className="queue__head">
                    <span className="queue__kind">{rec.kind}</span>
                    {count > 1 && <span className="queue__count">×{count}</span>}
                  </div>
                  {kind === "SLOT_DEFAULT" ? (
                    <p className="queue__found">
                      No icon component matches <code>{rec.found}</code>.
                    </p>
                  ) : (
                    <>
                      {rec.expected && (
                        <p className="queue__found">
                          Looked for Variable <code>{rec.expected}</code> — not in this file.
                        </p>
                      )}
                      {rec.found && (
                        <p className="queue__found">
                          From <code>{rec.found}</code>
                        </p>
                      )}
                    </>
                  )}
                  {options ? (
                    <Select
                      size="sm"
                      placeholder={kind === "SLOT_DEFAULT" ? "Pick an icon component" : "Leave unresolved"}
                      value={value}
                      options={options}
                      onValueChange={(v: string) => setPicks((p) => ({ ...p, [key]: parsePick(kind, v) }))}
                    />
                  ) : (
                    rec.candidates &&
                    rec.candidates.length > 0 && (
                      <ul className="queue__candidates">
                        {rec.candidates.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    )
                  )}
                </div>
              );
            })}
            <Button
              intent="primary"
              size="sm"
              disabled={busy || Object.keys(picks).length === 0}
              onClick={applyResolutions}
            >
              {busy ? "Applying…" : `Apply ${Object.keys(picks).length} & rebuild`}
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="error" title="Something went wrong">
            {error}
          </Alert>
        )}

        <div className="list">
          <div className="list__count">
            {components.length} component{components.length === 1 ? "" : "s"}
          </div>
          {components.map((c) => (
            <ComponentCard
              key={c.component}
              entry={c}
              onBuild={() => buildComponent(c.component)}
              busy={busy}
            />
          ))}
        </div>
      </div>
    </IconProvider>
  );
}

/** Mirror Figma's light/dark editor appearance onto `data-theme`. */
function syncFigmaTheme() {
  const root = document.documentElement;
  const mode = root.classList.contains("figma-dark")
    ? "dark"
    : root.classList.contains("figma-light")
      ? "light"
      : window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  root.setAttribute("data-theme", mode);
}

syncFigmaTheme();
new MutationObserver(syncFigmaTheme).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class"],
});
window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", syncFigmaTheme);

const rootEl = document.getElementById("root");
if (rootEl) createRoot(rootEl).render(<App />);
