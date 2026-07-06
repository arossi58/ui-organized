/**
 * Plugin UI (runs in the iframe), built with the design-system component
 * library so it looks like the rest of UI Organized. Reads a theme.json by
 * file-drop, file-picker or paste, hands the parsed object to the sandbox via
 * postMessage, and renders the import report it sends back.
 */

// Roboto — the design system's type family (var(--type-font-*)). The plugin is
// offline (no Google Fonts), so the woff2 files are embedded into the bundle as
// data URIs (see the .woff2 loader in build.mjs). Latin subset, the weights the
// DS tokens use (regular/medium/semibold/bold).
import "@fontsource/roboto/latin-400.css";
import "@fontsource/roboto/latin-500.css";
import "@fontsource/roboto/latin-600.css";
import "@fontsource/roboto/latin-700.css";

// Design-system styles: token variables first, then component CSS, then our
// shell layout (so it can lean on the DS variables and override where needed).
import "@ui-organized/tokens/variables.css";
import "@ui-organized/react/styles";
import "./ui.css";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type DragEvent,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import { Alert, Button, IconProvider, TextArea } from "@ui-organized/react";
import type {
  ChangeStatus,
  CollectionSummary,
  ImportPlan,
  InventoryRow,
  NameFormat,
  PlanCell,
  PlanRow,
} from "./plan";

type Mode = "import" | "export" | "insert";

interface CollectionReport {
  name: string;
  created: number;
  updated: number;
}
interface ImportReport {
  collections: CollectionReport[];
  warnings: string[];
  variableCount: number;
}

/** Fixed order for the leading collections; anything else sorts after, alphabetical. */
const COLLECTION_ORDER = ["Primitives", "Semantic", "Scale", "Typography", "Icons"];

/** Group rows by collection (known collections first) and sort names numerically. */
function groupByCollection<T extends { collection: string; name: string }>(
  rows: T[],
): Array<{ collection: string; rows: T[] }> {
  const map = new Map<string, T[]>();
  for (const r of rows) {
    const list = map.get(r.collection);
    if (list) list.push(r);
    else map.set(r.collection, [r]);
  }
  const rank = (c: string) => {
    const i = COLLECTION_ORDER.indexOf(c);
    return i < 0 ? COLLECTION_ORDER.length : i;
  };
  return [...map.keys()]
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
    .map((collection) => ({
      collection,
      rows: map
        .get(collection)!
        .slice()
        .sort((x, y) => x.name.localeCompare(y.name, undefined, { numeric: true })),
    }));
}

const STATUS_LABEL: Record<ChangeStatus, string> = { add: "New", update: "Changed", unchanged: "Same" };

/**
 * A token reference (e.g. a semantic colour aliasing a primitive): shows the
 * token name, and reveals the raw resolved value in a tooltip when clicked.
 */
function TokenValue({ name, color }: { name: string; color?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="cell__value token">
      {color && <span className="swatch" style={{ "--swatch-color": color } as CSSProperties} />}
      <button
        type="button"
        className="token__name"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
      >
        {name}
      </button>
      {open && color && (
        <span className="token__tip" role="tooltip">
          {color}
        </span>
      )}
    </span>
  );
}

/** A swatch (when the cell is a color) plus its display text, or a token reference. */
function CellValue({ cell }: { cell?: PlanCell }) {
  if (!cell) return <span className="cell__val cell__val--empty">—</span>;
  if (cell.token) return <TokenValue name={cell.token} color={cell.color} />;
  return (
    <span className="cell__value">
      {cell.color && <span className="swatch" style={{ "--swatch-color": cell.color } as CSSProperties} />}
      <span className="cell__val">{cell.display}</span>
    </span>
  );
}

/** Stable left-to-right order for theme (mode) columns. */
const MODE_ORDER = ["Light", "Dark", "Value"];

/** The theme columns present in a set of rows, in canonical order. */
function modeColumns(present: Set<string>): string[] {
  return MODE_ORDER.filter((m) => present.has(m));
}

/** Grid template: a name column, then one equal-width column per theme. */
function gridTemplate(modes: string[]): string {
  return `minmax(150px, 1.4fr) ${modes.map(() => "minmax(130px, 1fr)").join(" ")}`;
}

/** Case-insensitive substring match on a variable name. */
function matchesQuery(name: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  return q === "" || name.toLowerCase().includes(q);
}

/** One theme cell of a preview row: before → after for updates, else the value. */
function PlanModeCell({ row, mode }: { row: PlanRow; mode: string }) {
  const after = row.after.find((c) => c.mode === mode);
  const before = row.before.find((c) => c.mode === mode);
  if (!after && !before) return <div className="mcell mcell--empty" aria-hidden />;
  if (row.status === "update" && before) {
    return (
      <div className="mcell mcell--change">
        <CellValue cell={before} />
        <span className="arrow">→</span>
        <CellValue cell={after} />
      </div>
    );
  }
  return (
    <div className="mcell">
      <CellValue cell={after ?? before} />
    </div>
  );
}

/** Coloured count chips summarising a plan. */
function PlanSummary({ counts }: { counts: ImportPlan["counts"] }) {
  return (
    <div className="summary">
      <span className="chip chip--add">{counts.add} new</span>
      <span className="chip chip--update">{counts.update} changed</span>
      <span className="chip chip--unchanged">{counts.unchanged} unchanged</span>
    </div>
  );
}

/** A collection section: sticky title, a header row, then one row per variable. */
function TableGroup({
  collection,
  count,
  modes,
  children,
}: {
  collection: string;
  count: number;
  modes: string[];
  children: ReactNode;
}) {
  const cols = gridTemplate(modes);
  return (
    <section className="tgroup">
      <div className="tgroup__head">
        {collection} <span className="table__count">{count}</span>
      </div>
      <div className="trow trow--head" style={{ gridTemplateColumns: cols }}>
        <div className="thead">Variable</div>
        {modes.map((m) => (
          <div className="thead" key={m}>
            {m}
          </div>
        ))}
      </div>
      {children}
    </section>
  );
}

/** Import preview: every affected variable, grouped by collection, themes in columns. */
function PreviewTable({
  rows,
  hideUnchanged,
  query,
}: {
  rows: PlanRow[];
  hideUnchanged: boolean;
  query: string;
}) {
  const visible = rows.filter(
    (r) => (!hideUnchanged || r.status !== "unchanged") && matchesQuery(r.name, query),
  );
  const groups = groupByCollection(visible);
  if (groups.length === 0) return <p className="table__empty">No variables match.</p>;
  return (
    <div className="table">
      {groups.map(({ collection, rows: group }) => {
        const modes = modeColumns(new Set(group.flatMap((r) => r.after.map((c) => c.mode))));
        const cols = gridTemplate(modes);
        return (
          <TableGroup collection={collection} count={group.length} modes={modes} key={collection}>
            {group.map((row) => (
              <div className={`trow trow--${row.status}`} style={{ gridTemplateColumns: cols }} key={row.name}>
                <div className="trow__name">
                  <span className={`badge badge--${row.status}`}>{STATUS_LABEL[row.status]}</span>
                  <span className="trow__label" title={row.name}>
                    {row.name}
                  </span>
                </div>
                {modes.map((m) => (
                  <PlanModeCell key={m} row={row} mode={m} />
                ))}
              </div>
            ))}
          </TableGroup>
        );
      })}
    </div>
  );
}

/** Export listing: every exported variable and its resolved value(s), themes in columns. */
function InventoryTable({ rows, query }: { rows: InventoryRow[]; query: string }) {
  const visible = rows.filter((r) => matchesQuery(r.name, query));
  const groups = groupByCollection(visible);
  if (groups.length === 0) return <p className="table__empty">No variables match.</p>;
  return (
    <div className="table">
      {groups.map(({ collection, rows: group }) => {
        const modes = modeColumns(new Set(group.flatMap((r) => r.cells.map((c) => c.mode))));
        const cols = gridTemplate(modes);
        return (
          <TableGroup collection={collection} count={group.length} modes={modes} key={collection}>
            {group.map((row) => (
              <div className="trow" style={{ gridTemplateColumns: cols }} key={row.name}>
                <div className="trow__name">
                  <span className="trow__label" title={row.name}>
                    {row.name}
                  </span>
                </div>
                {modes.map((m) => {
                  const cell = row.cells.find((c) => c.mode === m);
                  return (
                    <div className="mcell" key={m}>
                      {cell ? <CellValue cell={cell} /> : <span className="cell__val--empty">—</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </TableGroup>
        );
      })}
    </div>
  );
}

/**
 * The UI Organized logomark (apps/assets/logo-mark.svg), inlined so it paints
 * with `currentColor`. It inherits the header text color, so it flips with the
 * light/dark theme automatically — no separate light/dark asset needed.
 */
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

function App() {
  const [mode, setMode] = useState<Mode>("import");
  const [json, setJson] = useState("");
  const [filename, setFilename] = useState("");
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [applied, setApplied] = useState(false);
  const [hideUnchanged, setHideUnchanged] = useState(false);
  const [query, setQuery] = useState("");
  const [report, setReport] = useState<ImportReport | null>(null);
  const [exportJson, setExportJson] = useState("");
  const [exportWarnings, setExportWarnings] = useState<string[]>([]);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [copied, setCopied] = useState(false);
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [includeScopes, setIncludeScopes] = useState(true);
  const [nameFormat, setNameFormat] = useState<NameFormat>("figma");
  const [inserted, setInserted] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // The parsed theme captured at preview time — Apply reuses it, so the diff the
  // user saw and what gets written can't drift apart from a later text edit.
  const pendingTheme = useRef<unknown>(null);

  // Results streamed back from the sandbox (code.ts).
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const msg = e.data?.pluginMessage;
      if (!msg) return;
      if (msg.type === "planned") {
        setBusy(false);
        setPlan(msg.plan as ImportPlan);
        setApplied(false);
        setError(null);
      } else if (msg.type === "done") {
        setBusy(false);
        setReport(msg.report as ImportReport);
        setApplied(true);
        setError(null);
      } else if (msg.type === "exported") {
        setBusy(false);
        setExportJson(msg.json as string);
        setExportWarnings((msg.warnings as string[]) ?? []);
        setInventory((msg.inventory as InventoryRow[]) ?? []);
        setError(null);
      } else if (msg.type === "collections") {
        // Collections start unchecked — the user opts in to what they insert.
        setCollections((msg.collections as CollectionSummary[]) ?? []);
      } else if (msg.type === "inserted") {
        setBusy(false);
        setInserted(msg.inserted as number);
        setError(null);
      } else if (msg.type === "error") {
        setBusy(false);
        setError(msg.message as string);
        setPlan(null);
        setReport(null);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // The import preview takes over the whole window; the export listing just needs extra room.
  const previewActive = mode === "import" && plan !== null;
  const wide = previewActive || (mode === "export" && inventory.length > 0);
  useEffect(() => {
    parent.postMessage(
      { pluginMessage: { type: "resize", width: wide ? 780 : 380, height: wide ? 760 : 600 } },
      "*",
    );
  }, [wide]);

  const backToEdit = () => setPlan(null);

  // Pull the collection list whenever the Insert tab is opened.
  useEffect(() => {
    if (mode === "insert") parent.postMessage({ pluginMessage: { type: "list-collections" } }, "*");
  }, [mode]);

  // Any edit to the source invalidates a computed preview.
  const resetPreview = () => {
    setPlan(null);
    setReport(null);
    setApplied(false);
    pendingTheme.current = null;
  };

  const loadFile = async (file: File) => {
    setJson(await file.text());
    setFilename(file.name);
    setError(null);
    resetPreview();
  };

  /** Parse the textarea/file contents, or surface a JSON error. */
  const parseJson = (): unknown | undefined => {
    const raw = json.trim();
    if (!raw) {
      setError("Paste or choose a theme.json first.");
      return undefined;
    }
    try {
      return JSON.parse(raw);
    } catch (err) {
      setError(`Invalid JSON: ${(err as Error).message}`);
      return undefined;
    }
  };

  const onPreview = () => {
    setError(null);
    resetPreview();
    const theme = parseJson();
    if (theme === undefined) return;
    pendingTheme.current = theme;
    setBusy(true);
    parent.postMessage({ pluginMessage: { type: "preview", theme } }, "*");
  };

  const onApply = () => {
    if (pendingTheme.current == null) return;
    setError(null);
    setBusy(true);
    parent.postMessage({ pluginMessage: { type: "import", theme: pendingTheme.current } }, "*");
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setQuery("");
    setInserted(null);
  };

  const toggleCollection = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onInsert = () => {
    setError(null);
    setInserted(null);
    setBusy(true);
    parent.postMessage(
      { pluginMessage: { type: "insert", collectionIds: [...selected], includeScopes, format: nameFormat } },
      "*",
    );
  };

  const onExport = () => {
    setError(null);
    // Keep any existing results on screen until the fresh ones arrive, so a
    // re-export doesn't flash back to the empty intro state.
    setBusy(true);
    parent.postMessage({ pluginMessage: { type: "export" } }, "*");
  };

  const downloadExport = () => {
    const url = URL.createObjectURL(new Blob([exportJson], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "theme.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportJson);
    } catch {
      // Clipboard API can be blocked in the iframe — fall back to a throwaway
      // off-screen textarea and execCommand("copy").
      const el = document.createElement("textarea");
      el.value = exportJson;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // ── Full-window import preview: takes over the entire plugin while reviewing. ──
  if (previewActive && plan) {
    const pending = plan.counts.add + plan.counts.update;
    return (
      <IconProvider library="lucide" style="outline" strokeAdjustment={false}>
        <div className="preview-screen">
          <header className="preview-screen__head">
            <div className="preview-screen__bar">
              <Button intent="ghost" size="sm" onClick={backToEdit} disabled={busy}>
                ‹ Back
              </Button>
              <strong className="preview-screen__title">Review changes</strong>
              <span className="preview-screen__spacer" />
              {applied ? (
                <span className="chip chip--add">Applied</span>
              ) : (
                <Button intent="primary" size="sm" onClick={onApply} disabled={busy}>
                  {busy ? "Applying…" : `Apply import (${pending})`}
                </Button>
              )}
            </div>
            <div className="preview-screen__controls">
              <PlanSummary counts={plan.counts} />
              <input
                className="search"
                type="search"
                placeholder="Search variables…"
                value={query}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              />
              {plan.counts.unchanged > 0 && (
                <label className="preview__toggle">
                  <input
                    type="checkbox"
                    checked={hideUnchanged}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setHideUnchanged(e.target.checked)}
                  />
                  Hide unchanged
                </label>
              )}
            </div>
          </header>

          <div className="preview-screen__body">
            {!applied && (
              <p className="app__hint">
                Nothing has been written yet — review the changes, then <strong>Apply import</strong>.
              </p>
            )}
            {applied && report && (
              <Alert
                variant={report.warnings.length > 0 ? "warning" : "success"}
                title={report.warnings.length > 0 ? "Imported with warnings" : "Import complete"}
              >
                Imported {report.variableCount} variable{report.variableCount === 1 ? "" : "s"}.
              </Alert>
            )}
            {plan.warnings.length > 0 && (
              <Alert
                variant="warning"
                title={`${plan.warnings.length} warning${plan.warnings.length === 1 ? "" : "s"}`}
              >
                <ul className="app__warnings">
                  {plan.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </Alert>
            )}
            {error && (
              <Alert variant="error" title="Something went wrong">
                {error}
              </Alert>
            )}
            <PreviewTable rows={plan.rows} hideUnchanged={hideUnchanged} query={query} />
          </div>
        </div>
      </IconProvider>
    );
  }

  return (
    <IconProvider library="lucide" style="outline" strokeAdjustment={false}>
      <div className={mode === "export" && exportJson ? "app app--fill" : "app"}>
        <header className="app__header">
          <div className="app__brand">
            <BrandMark />
            <h1>UI Organized - Theme Import</h1>
          </div>
          <p>
            Import a <code>theme.json</code> into Figma Variables, or export your edited
            variables back to a <code>theme.json</code>. Build one with the{" "}
            <a
              href="https://uiorganized.com/tools/theme-builder"
              className="app__link"
              onClick={(e) => {
                e.preventDefault();
                parent.postMessage(
                  { pluginMessage: { type: "open-url", url: "https://uiorganized.com/tools/theme-builder" } },
                  "*",
                );
              }}
            >
              Theme Builder
            </a>
            .
          </p>
        </header>

        <div className="app__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "import"}
            className="app__tab"
            onClick={() => switchMode("import")}
          >
            Import
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "export"}
            className="app__tab"
            onClick={() => switchMode("export")}
          >
            Export
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "insert"}
            className="app__tab"
            onClick={() => switchMode("insert")}
          >
            Insert
          </button>
        </div>

        {mode === "import" ? (
          <>
            <div
              className={over ? "drop drop--over" : "drop"}
              onDragOver={(e: DragEvent) => {
                e.preventDefault();
                setOver(true);
              }}
              onDragLeave={() => setOver(false)}
              onDrop={(e: DragEvent) => {
                e.preventDefault();
                setOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) void loadFile(file);
              }}
            >
              Drop <code>theme.json</code> here, or{" "}
              <span className="drop__browse" onClick={() => fileRef.current?.click()}>
                browse
              </span>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) void loadFile(file);
                }}
              />
            </div>

            <TextArea
              label="theme.json"
              placeholder="…or paste theme.json contents here"
              value={json}
              resize="vertical"
              rows={6}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                setJson(e.target.value);
                resetPreview();
              }}
            />

            {json.trim() && (
              <div className="app__actions">
                <Button intent="primary" onClick={onPreview} disabled={busy}>
                  {busy ? "Checking…" : "Preview changes"}
                </Button>
                {filename && <span className="app__filename">{filename}</span>}
              </div>
            )}

            {applied && report && (
              <Alert
                variant={report.warnings.length > 0 ? "warning" : "success"}
                title={report.warnings.length > 0 ? "Imported with warnings" : "Import complete"}
              >
                Imported {report.variableCount} variable
                {report.variableCount === 1 ? "" : "s"}.
                {report.warnings.length > 0 && (
                  <details className="app__warnings">
                    <summary>
                      {report.warnings.length} warning
                      {report.warnings.length === 1 ? "" : "s"}
                    </summary>
                    <ul>
                      {report.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </Alert>
            )}
          </>
        ) : mode === "export" ? (
          <>
            {!exportJson && (
              <>
                <p className="app__hint">
                  Read the current Primitives / Semantic / Scale / Typography variables back into a{" "}
                  <code>theme.json</code> — load it into the theme builder or use it in code.
                </p>
                <div className="app__actions">
                  <Button intent="primary" onClick={onExport} disabled={busy}>
                    {busy ? "Loading…" : "Load variables"}
                  </Button>
                </div>
              </>
            )}

            {exportJson && (
              <div className="export-result">
                <div className="preview__head">
                  <div className="preview__head-left">
                    <span className="chip">
                      {inventory.length} variable{inventory.length === 1 ? "" : "s"}
                    </span>
                    {inventory.length > 0 && (
                      <input
                        className="search"
                        type="search"
                        placeholder="Search variables…"
                        value={query}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                      />
                    )}
                  </div>
                  <div className="app__actions">
                    <Button intent="ghost" size="sm" onClick={onExport} disabled={busy}>
                      {busy ? "Reloading…" : "Reload"}
                    </Button>
                    <Button intent="secondary" size="sm" onClick={copyExport}>
                      {copied ? "Copied" : "Copy JSON"}
                    </Button>
                    <Button intent="secondary" size="sm" onClick={downloadExport}>
                      Download theme.json
                    </Button>
                  </div>
                </div>

                {exportWarnings.length > 0 && (
                  <Alert
                    variant="warning"
                    title={`${exportWarnings.length} warning${exportWarnings.length === 1 ? "" : "s"}`}
                  >
                    <ul className="app__warnings">
                      {exportWarnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </Alert>
                )}

                {inventory.length > 0 && (
                  <div className="table-scroll">
                    <InventoryTable rows={inventory} query={query} />
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <p className="app__hint">
              Insert tables of your variables as native Figma frames — one per collection, styled with
              your own variables. Columns: Name, one per mode, then Scopes.
            </p>

            {collections.length === 0 ? (
              <p className="app__hint">Loading collections…</p>
            ) : (
              <>
                <div className="insert__list">
                  {collections.map((c) => (
                    <label className="insert__item" key={c.id}>
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => toggleCollection(c.id)}
                      />
                      <span className="insert__name">{c.name}</span>
                      <span className="insert__meta">
                        {c.variableCount} variable{c.variableCount === 1 ? "" : "s"}
                        {c.modes.length > 0 && ` · ${c.modes.map((m) => m.name).join(", ")}`}
                      </span>
                    </label>
                  ))}
                </div>

                <label className="insert__field">
                  <span>Name format</span>
                  <select
                    className="insert__select"
                    value={nameFormat}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setNameFormat(e.target.value as NameFormat)}
                  >
                    <option value="figma">Figma default (border/primary)</option>
                    <option value="css">CSS (--border-primary)</option>
                    <option value="scss">SCSS ($border-primary)</option>
                  </select>
                </label>

                <label className="preview__toggle">
                  <input
                    type="checkbox"
                    checked={includeScopes}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setIncludeScopes(e.target.checked)}
                  />
                  Include scopes column
                </label>

                <div className="app__actions">
                  <Button intent="primary" onClick={onInsert} disabled={busy || selected.size === 0}>
                    {busy ? "Inserting…" : `Insert ${selected.size} table${selected.size === 1 ? "" : "s"}`}
                  </Button>
                </div>

                {inserted != null && (
                  <Alert variant="success" title="Inserted">
                    Added {inserted} table{inserted === 1 ? "" : "s"} to your canvas.
                  </Alert>
                )}
              </>
            )}
          </>
        )}

        {error && (
          <Alert variant="error" title="Something went wrong">
            {error}
          </Alert>
        )}
      </div>
    </IconProvider>
  );
}

/**
 * Match Figma's editor appearance. Figma adds a `figma-light` / `figma-dark`
 * class to <html> in plugin iframes; we mirror it onto `data-theme` (what the
 * design-system CSS keys off), falling back to the OS preference. The whole UI
 * — including the brandmark, which paints with `currentColor` — flips with it.
 * Re-runs if the editor's appearance changes while the plugin is open.
 */
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
window
  .matchMedia?.("(prefers-color-scheme: dark)")
  .addEventListener?.("change", syncFigmaTheme);

const rootEl = document.getElementById("root");
if (rootEl) createRoot(rootEl).render(<App />);
