/**
 * Plugin UI (Connect.md §4.2). The iframe realm — it has `fetch` and the DOM, so
 * all manifest/GitHub work happens here; the sandbox only touches the `figma` API.
 *
 * Phase 4 flow: pick a component → see its state (Unmapped / Connected) → search
 * or accept a suggestion → confirm, which opens a manifest PR (§4.6) and writes the
 * pluginData pointer. Staleness UI is a later phase (§4.4, §11 step 5).
 */

import { createRoot } from "react-dom/client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  searchEntries,
  type ComponentManifest,
  type ComponentManifestEntry,
  type LatestHashes,
} from "@ui-organized/code-connect/browser";
import {
  EMPTY_SETTINGS,
  type GhSettings,
  type SandboxToUI,
  type SelectionInfo,
  type UIToSandbox,
} from "./messages.js";
import { fetchLatestScan, fetchManifestFile, openMappingPr } from "./github-client.js";
import { applyMapping, entryForKey, parseManifest, serializeManifest } from "./manifest-remote.js";
import { suggest } from "./matcher.js";
import { previewPayload } from "./preview.js";
import { describeDiff, pluginStaleness } from "./staleness-view.js";

function sandbox(msg: UIToSandbox): void {
  parent.postMessage({ pluginMessage: msg }, "*");
}

const settingsComplete = (s: GhSettings): boolean =>
  Boolean(s.token && s.owner && s.repo && s.branch && s.manifestPath);

// ─── Root component ───────────────────────────────────────────────────────────

function App() {
  const [settings, setSettings] = useState<GhSettings>(EMPTY_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [manifest, setManifest] = useState<ComponentManifest | null>(null);
  const [latestScan, setLatestScan] = useState<LatestHashes | null>(null);
  const [manifestState, setManifestState] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastPr, setLastPr] = useState<string | null>(null);
  const gotSettings = useRef(false);

  // Wire up the sandbox channel and ask for initial state.
  useEffect(() => {
    window.onmessage = (e: MessageEvent) => {
      const msg = e.data?.pluginMessage as SandboxToUI | undefined;
      if (!msg) return;
      if (msg.type === "settings") {
        setSettings(msg.settings);
        gotSettings.current = true;
        setShowSettings(!settingsComplete(msg.settings));
      } else if (msg.type === "selection") {
        setSelection(msg.selection);
      }
    };
    sandbox({ type: "ready" });
  }, []);

  async function loadManifest(s: GhSettings) {
    setManifestState("loading");
    setError(null);
    try {
      const { text } = await fetchManifestFile(s);
      setManifest(parseManifest(text));
      setManifestState("loaded");
      // Best-effort — staleness is optional and never blocks mapping (§4.4).
      setLatestScan(await fetchLatestScan(s));
    } catch (e) {
      setManifestState("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  // Load the manifest once settings are complete.
  useEffect(() => {
    if (gotSettings.current && settingsComplete(settings) && manifestState === "idle") {
      void loadManifest(settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, manifestState]);

  function saveSettings(next: GhSettings) {
    setSettings(next);
    sandbox({ type: "save-settings", settings: next });
    setShowSettings(false);
    setManifestState("idle"); // re-fetch against the new target
    setManifest(null);
  }

  async function confirmMapping(entry: ComponentManifestEntry) {
    if (!selection || selection.kind === "none" || selection.kind === "multiple") return;
    setBusy(true);
    setError(null);
    setLastPr(null);
    const componentKey = selection.figmaKey;
    try {
      // Always re-read the file for a fresh blob sha before committing.
      const { text, sha } = await fetchManifestFile(settings);
      const fresh = parseManifest(text);
      const { manifest: updated, changed } = applyMapping(fresh, {
        codePath: entry.codePath,
        codeName: entry.codeName,
        componentKey,
        figmaName: selection.nodeName,
      });

      if (changed) {
        const pr = await openMappingPr(settings, {
          updatedText: serializeManifest(updated),
          sha,
          codeName: entry.codeName,
          codePath: entry.codePath,
          componentKey,
          nodeName: selection.nodeName,
          stamp: Date.now(),
        });
        setLastPr(pr.url);
      } else {
        sandbox({ type: "notify", message: "Manifest already mapped — updated the node pointer only" });
      }

      // Write the pointer onto the node regardless (it may have been missing).
      sandbox({ type: "write-mapping", componentKey });
      setManifest(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function unmap() {
    sandbox({ type: "clear-mapping" });
    setLastPr(null);
  }

  return (
    <div style={S.app}>
      <style>{CSS}</style>
      <header style={S.header}>
        <strong>Code Connect</strong>
        <button style={S.iconBtn} onClick={() => setShowSettings((v) => !v)} title="Settings">
          ⚙
        </button>
      </header>

      {showSettings || !settingsComplete(settings) ? (
        <SettingsForm initial={settings} onSave={saveSettings} onCancel={settingsComplete(settings) ? () => setShowSettings(false) : undefined} />
      ) : (
        <Body
          selection={selection}
          manifest={manifest}
          latestScan={latestScan}
          manifestState={manifestState}
          busy={busy}
          error={error}
          lastPr={lastPr}
          onConfirm={confirmMapping}
          onUnmap={unmap}
          onReload={() => loadManifest(settings)}
        />
      )}
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function SettingsForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: GhSettings;
  onSave: (s: GhSettings) => void;
  onCancel?: () => void;
}) {
  const [s, setS] = useState<GhSettings>(initial);
  const set = (k: keyof GhSettings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setS({ ...s, [k]: e.target.value });

  return (
    <div style={S.body}>
      <p style={S.hint}>Point the plugin at the repo that holds the component manifest.</p>
      <Label t="GitHub token (PAT with repo scope)">
        <input style={S.input} type="password" value={s.token} onChange={set("token")} placeholder="ghp_…" />
      </Label>
      <div style={{ display: "flex", gap: 8 }}>
        <Label t="Owner"><input style={S.input} value={s.owner} onChange={set("owner")} placeholder="arossi58" /></Label>
        <Label t="Repo"><input style={S.input} value={s.repo} onChange={set("repo")} placeholder="ui-organized" /></Label>
      </div>
      <Label t="Base branch"><input style={S.input} value={s.branch} onChange={set("branch")} /></Label>
      <Label t="Manifest path"><input style={S.input} value={s.manifestPath} onChange={set("manifestPath")} /></Label>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button style={S.primary} disabled={!settingsComplete(s)} onClick={() => onSave(s)}>Save</button>
        {onCancel && <button style={S.secondary} onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
}

// ─── Main body ────────────────────────────────────────────────────────────────

function Body({
  selection,
  manifest,
  latestScan,
  manifestState,
  busy,
  error,
  lastPr,
  onConfirm,
  onUnmap,
  onReload,
}: {
  selection: SelectionInfo | null;
  manifest: ComponentManifest | null;
  latestScan: LatestHashes | null;
  manifestState: "idle" | "loading" | "loaded" | "error";
  busy: boolean;
  error: string | null;
  lastPr: string | null;
  onConfirm: (e: ComponentManifestEntry) => void;
  onUnmap: () => void;
  onReload: () => void;
}) {
  if (manifestState === "loading" || manifestState === "idle") {
    return <div style={S.body}><p style={S.hint}>Loading manifest…</p></div>;
  }
  if (manifestState === "error" || !manifest) {
    return (
      <div style={S.body}>
        <div style={S.error}>{error ?? "Could not load the manifest."}</div>
        <button style={S.secondary} onClick={onReload}>Retry</button>
      </div>
    );
  }

  return (
    <div style={S.body}>
      {error && <div style={S.error}>{error}</div>}
      {lastPr && (
        <div style={S.success}>
          Opened PR — <a href={lastPr} target="_blank" rel="noreferrer" style={S.link}>review it on GitHub</a>
        </div>
      )}
      {!selection || selection.kind === "none" ? (
        <p style={S.hint}>Select a component or main component to map.</p>
      ) : selection.kind === "multiple" ? (
        <p style={S.hint}>Select a single component (multiple are selected).</p>
      ) : selection.mappedKey ? (
        <Connected
          selection={selection}
          entry={entryForKey(manifest, selection.mappedKey)}
          latestScan={latestScan}
          onUnmap={onUnmap}
        />
      ) : (
        <Unmapped selection={selection} manifest={manifest} busy={busy} onConfirm={onConfirm} />
      )}
    </div>
  );
}

function Connected({
  selection,
  entry,
  latestScan,
  onUnmap,
}: {
  selection: SelectionInfo;
  entry: ComponentManifestEntry | undefined;
  latestScan: LatestHashes | null;
  onUnmap: () => void;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const stale = useMemo(
    () => (entry ? pluginStaleness(entry, latestScan) : null),
    [entry, latestScan],
  );
  return (
    <div>
      {stale?.isStale ? (
        <div style={S.badgeStale}>▲ Stale — code has changed since this was mapped</div>
      ) : (
        <div style={S.badgeConnected}>● Connected</div>
      )}
      <div style={S.nodeName}>{selection.nodeName}</div>
      {entry ? (
        <>
          <div style={S.row}><span style={S.k}>Component</span><span>{entry.codeName}</span></div>
          <div style={S.row}><span style={S.k}>Path</span><span style={S.mono}>{entry.codePath}</span></div>
          <div style={S.row}><span style={S.k}>Props</span><span>{entry.props.length}</span></div>
          {stale?.isStale && stale.diff.length > 0 && (
            <div style={S.staleBox}>
              <div style={S.sectionLabel}>What changed</div>
              {stale.diff.map((d) => (
                <div key={d.name} style={S.diffLine}>{describeDiff(d)}</div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button style={S.secondary} onClick={() => setShowPreview((v) => !v)}>
              {showPreview ? "Hide" : "Preview"} payload
            </button>
            <button style={S.danger} onClick={onUnmap}>Unmap</button>
          </div>
          {showPreview && <pre style={S.pre}>{previewPayload(entry)}</pre>}
        </>
      ) : (
        <p style={S.hint}>
          This node points at key <span style={S.mono}>{selection.mappedKey}</span>, which isn’t in the
          loaded manifest. It may have been mapped against a different branch.
        </p>
      )}
    </div>
  );
}

function Unmapped({
  selection,
  manifest,
  busy,
  onConfirm,
}: {
  selection: SelectionInfo;
  manifest: ComponentManifest;
  busy: boolean;
  onConfirm: (e: ComponentManifestEntry) => void;
}) {
  const [query, setQuery] = useState("");
  const suggestions = useMemo(
    () => suggest(manifest.components, selection.nodeName, selection.variantProps),
    [manifest, selection],
  );
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const keys = searchEntries(manifest.components, { query });
    // searchEntries returns by key/name; map back to entries for full data.
    const byPath = new Map(manifest.components.map((c) => [c.codePath, c]));
    return keys.map((r) => byPath.get(r.codePath)).filter(Boolean) as ComponentManifestEntry[];
  }, [query, manifest]);

  const Item = ({ entry, note }: { entry: ComponentManifestEntry; note?: string }) => (
    <button style={S.result} disabled={busy} onClick={() => onConfirm(entry)}>
      <span style={S.resultName}>{entry.codeName}</span>
      <span style={S.resultMeta}>{note ?? entry.codePath}</span>
    </button>
  );

  return (
    <div>
      <div style={S.badgeUnmapped}>○ Unmapped — {selection.nodeName}</div>
      {suggestions.length > 0 && !query.trim() && (
        <>
          <div style={S.sectionLabel}>Suggestions</div>
          {suggestions.map((s) => (
            <Item key={s.entry.codeName} entry={s.entry} note={s.reason} />
          ))}
          <div style={S.sectionLabel}>Or search</div>
        </>
      )}
      <input
        style={S.input}
        placeholder="Search components…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      <div style={{ marginTop: 6 }}>
        {results.map((entry) => (
          <Item key={entry.codeName} entry={entry} />
        ))}
        {query.trim() && results.length === 0 && <p style={S.hint}>No matches.</p>}
      </div>
      {busy && <p style={S.hint}>Opening PR…</p>}
    </div>
  );
}

function Label({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <label style={S.label}>
      <span style={S.labelText}>{t}</span>
      {children}
    </label>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
* { box-sizing: border-box; }
body { margin: 0; font: 12px/1.4 -apple-system, "Segoe UI", Roboto, sans-serif;
  color: #e6e6e6; background: #1e1e1e; }
input:focus { outline: 1px solid #7aa2ff; }
`;

const S: Record<string, React.CSSProperties> = {
  app: { display: "flex", flexDirection: "column", height: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 12px", borderBottom: "1px solid #333" },
  iconBtn: { background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: 14 },
  body: { padding: 12, overflowY: "auto", flex: 1 },
  hint: { color: "#9a9a9a" },
  label: { display: "block", marginBottom: 8, width: "100%" },
  labelText: { display: "block", color: "#9a9a9a", marginBottom: 3 },
  input: { width: "100%", padding: "6px 8px", background: "#2a2a2a", border: "1px solid #3a3a3a",
    borderRadius: 4, color: "#e6e6e6" },
  primary: { padding: "6px 14px", background: "#4c7dff", border: "none", borderRadius: 4,
    color: "#fff", cursor: "pointer" },
  secondary: { padding: "6px 12px", background: "#2a2a2a", border: "1px solid #3a3a3a",
    borderRadius: 4, color: "#e6e6e6", cursor: "pointer" },
  danger: { padding: "6px 12px", background: "#3a2323", border: "1px solid #5a3333",
    borderRadius: 4, color: "#ff9b9b", cursor: "pointer" },
  sectionLabel: { color: "#7a7a7a", textTransform: "uppercase", fontSize: 10,
    letterSpacing: 0.5, margin: "10px 0 4px" },
  result: { display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%",
    textAlign: "left", padding: "7px 9px", marginBottom: 4, background: "#242424",
    border: "1px solid #333", borderRadius: 5, color: "#e6e6e6", cursor: "pointer" },
  resultName: { fontWeight: 600 },
  resultMeta: { color: "#8a8a8a", fontSize: 11 },
  badgeConnected: { color: "#54c98a", marginBottom: 6 },
  badgeStale: { color: "#e0a03a", background: "#3a3220", border: "1px solid #5a4a24",
    borderRadius: 4, padding: "5px 8px", marginBottom: 8 },
  badgeUnmapped: { color: "#c9a854", marginBottom: 8 },
  staleBox: { marginTop: 8, padding: 8, background: "#241f14", border: "1px solid #4a3d20",
    borderRadius: 4 },
  diffLine: { fontFamily: "ui-monospace, monospace", fontSize: 11, color: "#d8c48a", padding: "1px 0" },
  nodeName: { fontWeight: 600, marginBottom: 8 },
  row: { display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #2a2a2a" },
  k: { color: "#8a8a8a" },
  mono: { fontFamily: "ui-monospace, monospace", fontSize: 11 },
  pre: { marginTop: 8, padding: 8, background: "#111", border: "1px solid #2a2a2a", borderRadius: 4,
    fontSize: 10.5, overflowX: "auto", whiteSpace: "pre" },
  error: { padding: 8, background: "#3a2323", border: "1px solid #5a3333", borderRadius: 4,
    color: "#ff9b9b", marginBottom: 8 },
  success: { padding: 8, background: "#20362a", border: "1px solid #2f5a42", borderRadius: 4,
    color: "#9be3bb", marginBottom: 8 },
  link: { color: "#9be3bb" },
};
