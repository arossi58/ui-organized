import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Button,
  Select,
  Range,
  Input,
  Card,
  CardBody,
  Icon,
} from "@ui-organized/react";
import { PRESET_SIZES, ICON_LIBRARIES } from "./constants.js";
import { STORAGE_KEY, loadSaved } from "./storage.js";
import { calcStroke, rewriteSvg, detectBaseStroke } from "./svg.js";
import IconBrowser from "./components/IconBrowser.jsx";
import WorkspaceRow from "./components/WorkspaceRow.jsx";
import CurveGraph from "./components/CurveGraph.jsx";
import "./icon-scaler.css";

const RECOMMENDED_INTENSITY = 0.5;

export default function IconScalerApp() {
  const [workspace, setWorkspace] = useState(() => {
    const s = loadSaved();
    return Array.isArray(s.workspace) ? s.workspace : [];
  });
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);
  const [refSize, setRefSize] = useState(() => loadSaved().refSize ?? 24);
  const [refStroke, setRefStroke] = useState(() => loadSaved().refStroke ?? 2);
  const [scalingMode, setScalingMode] = useState(() => loadSaved().scalingMode ?? "auto");
  const [autoIntensity, setAutoIntensity] = useState(() => loadSaved().autoIntensity ?? RECOMMENDED_INTENSITY);
  const [activeSizes, setActiveSizes] = useState(() => {
    const s = loadSaved();
    return Array.isArray(s.activeSizes) ? s.activeSizes : [12, 16, 20, 24, 32, 48];
  });
  const [manualStrokes, setManualStrokes] = useState(() => loadSaved().manualStrokes ?? {});
  const [savedCurves, setSavedCurves] = useState(() => loadSaved().savedCurves ?? []);
  const [curveName, setCurveName] = useState("");
  const [iconColor, setIconColor] = useState(() => loadSaved().iconColor ?? "");
  const [showBrowser, setShowBrowser] = useState(false);
  const [exportProgress, setExportProgress] = useState(null); // null | {done, total}
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        workspace, refSize, refStroke, scalingMode, autoIntensity, activeSizes, manualStrokes, savedCurves, iconColor,
      }));
    } catch (e) {
      console.warn("Failed to save state:", e.message);
    }
  }, [workspace, refSize, refStroke, scalingMode, autoIntensity, activeSizes, manualStrokes, savedCurves, iconColor]);

  const clearAll = useCallback(() => {
    setWorkspace([]);
    setRefSize(24);
    setRefStroke(2);
    setScalingMode("auto");
    setAutoIntensity(RECOMMENDED_INTENSITY);
    setActiveSizes([12, 16, 20, 24, 32, 48]);
    setManualStrokes({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const workspaceIds = useMemo(
    () => new Set(workspace.map((item) => `${item.lib}:${item.name}`)),
    [workspace]
  );

  const getStrokeForSize = useCallback((size) => {
    if (scalingMode === "manual") {
      return manualStrokes[size] ?? calcStroke(refStroke, refSize, size, autoIntensity);
    }
    return calcStroke(refStroke, refSize, size, autoIntensity);
  }, [scalingMode, manualStrokes, refStroke, refSize, autoIntensity]);

  const addToWorkspace = useCallback(async (list) => {
    setLoadingWorkspace(true);
    const newItems = [];
    for (const { lib, name } of list) {
      const id = `${lib}:${name}`;
      try {
        const svgText = await ICON_LIBRARIES[lib].fetchSvg(name);
        newItems.push({ id, lib, name, svgText, detectedStroke: detectBaseStroke(svgText) });
      } catch (e) {
        console.warn(`Failed to load ${name}:`, e.message);
      }
    }
    setWorkspace((prev) => {
      const existing = new Set(prev.map((item) => item.id));
      return [...prev, ...newItems.filter((item) => !existing.has(item.id))];
    });
    setLoadingWorkspace(false);
  }, []);

  const removeFromWorkspace = useCallback((id) => {
    setWorkspace((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const saveCurrentCurve = useCallback(() => {
    const name = curveName.trim();
    if (!name) return;
    setSavedCurves((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, refSize, refStroke, scalingMode, autoIntensity, manualStrokes },
    ]);
    setCurveName("");
  }, [curveName, refSize, refStroke, scalingMode, autoIntensity, manualStrokes]);

  const loadCurve = useCallback((curve) => {
    setRefSize(curve.refSize);
    setRefStroke(curve.refStroke);
    setScalingMode(curve.scalingMode);
    setAutoIntensity(curve.autoIntensity);
    setManualStrokes(curve.manualStrokes);
  }, []);

  const deleteCurve = useCallback((id) => {
    setSavedCurves((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const switchToAuto = useCallback(() => setScalingMode("auto"), []);

  const switchToManual = useCallback(() => {
    setManualStrokes((prev) => {
      const seeded = { ...prev };
      activeSizes.forEach((s) => {
        if (seeded[s] === undefined) seeded[s] = calcStroke(refStroke, refSize, s, autoIntensity);
      });
      return seeded;
    });
    setScalingMode("manual");
  }, [activeSizes, refStroke, refSize, autoIntensity]);

  const seedManualFromAuto = useCallback(() => {
    const seeded = {};
    activeSizes.forEach((s) => { seeded[s] = calcStroke(refStroke, refSize, s, autoIntensity); });
    setManualStrokes(seeded);
  }, [activeSizes, refStroke, refSize, autoIntensity]);

  const toggleSize = (s) =>
    setActiveSizes((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s].sort((a, b) => a - b));

  const handleUploadFiles = useCallback(async (files) => {
    const svgFiles = [...files].filter((f) => f.name.toLowerCase().endsWith(".svg") || f.type === "image/svg+xml");
    if (svgFiles.length === 0) return;
    setLoadingWorkspace(true);
    const newItems = [];
    for (const file of svgFiles) {
      try {
        const text = await file.text();
        const name = file.name.replace(/\.svg$/i, "");
        const id = `upload:${name}`;
        newItems.push({ id, lib: "upload", name, svgText: text, detectedStroke: detectBaseStroke(text) });
      } catch (e) {
        console.warn(`Failed to read ${file.name}:`, e.message);
      }
    }
    setWorkspace((prev) => {
      const existing = new Set(prev.map((item) => item.id));
      return [...prev, ...newItems.filter((item) => !existing.has(item.id))];
    });
    setLoadingWorkspace(false);
  }, []);

  const exportAll = useCallback(async () => {
    if (workspace.length === 0 || activeSizes.length === 0) return;
    setExportProgress({ done: 0, total: workspace.length });
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    for (let i = 0; i < workspace.length; i++) {
      const { name, svgText } = workspace[i];
      activeSizes.forEach((size) => {
        const sw = getStrokeForSize(size);
        zip.file(`${name}-${size}px.svg`, rewriteSvg(svgText, sw, size, iconColor));
      });
      setExportProgress({ done: i + 1, total: workspace.length });
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "icons.zip"; a.click();
    URL.revokeObjectURL(url);
    setExportProgress(null);
  }, [workspace, activeSizes, getStrokeForSize, iconColor]);

  const isNearRecommended = Math.abs(autoIntensity - RECOMMENDED_INTENSITY) < 0.03;

  return (
    <div className="icon-scaler-tool">

        {showBrowser && (
          <IconBrowser
            onAddToWorkspace={addToWorkspace}
            onClose={() => setShowBrowser(false)}
            existingIds={workspaceIds}
          />
        )}

        {exportProgress && (
          <div className="is-export-overlay">
            <div className="is-export-overlay-inner">
              <div className="is-export-overlay-title">Exporting…</div>
              <div className="is-export-progress-track">
                <div className="is-export-progress-fill" style={{ width: `${(exportProgress.done / exportProgress.total) * 100}%` }} />
              </div>
              <div className="is-export-progress-count">{exportProgress.done} / {exportProgress.total}</div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="is-header">
          <div className="is-header-brand">
            <h2 className="is-header-title" style={{ margin: 0 }}>Icon Scaler</h2>
            {workspace.length > 0 && (
              <span className="is-header-count">{workspace.length} icon{workspace.length !== 1 ? "s" : ""}</span>
            )}
          </div>
          {workspace.length > 0 && (
            <Button intent="ghost" size="sm" onClick={clearAll}>Clear all</Button>
          )}
          <Button intent="ghost" size="sm" icon="upload" onClick={() => document.getElementById("is-header-upload").click()}>
            Upload SVG
          </Button>
          <input id="is-header-upload" type="file" accept=".svg,image/svg+xml" multiple style={{ display: "none" }}
            onChange={(e) => { handleUploadFiles(e.target.files); e.target.value = ""; }} />
          <Button intent="primary" size="sm" icon="grid" onClick={() => setShowBrowser(true)}>Browse Icons</Button>
        </div>

        <div className="is-layout">

          {/* ── Sidebar ── */}
          <div className="is-sidebar">

            {/* Reference */}
            <Card className="is-card" padding="md">
              <CardBody>
                <div className="is-sec-label">Reference</div>
                <div className="is-ref-row">
                  <div className="is-ref-field">
                    <Select
                      label="Design size"
                      size="lg"
                      value={String(refSize)}
                      onValueChange={(v) => setRefSize(Number(v))}
                      options={PRESET_SIZES.map((s) => ({ value: String(s), label: `${s}px` }))}
                    />
                  </div>
                </div>
                <Range
                  label="Base stroke weight"
                  min={0.25}
                  max={8}
                  step={0.25}
                  value={refStroke}
                  onValueChange={(v) => setRefStroke(v)}
                  rangeLabels
                  formatValue={(v) => String(v)}
                />
              </CardBody>
            </Card>

            {/* Scaling */}
            <Card className="is-card" padding="md">
              <CardBody>
                <div className="is-mode-tabs">
                  {[["auto", "Auto"], ["manual", "Manual"]].map(([mode, label]) => (
                    <Button
                      key={mode}
                      intent={scalingMode === mode ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => mode === "auto" ? switchToAuto() : switchToManual()}
                      className="is-mode-tab"
                    >
                      {label}
                    </Button>
                  ))}
                </div>

                {scalingMode === "auto" ? (
                  <>
                    <Range
                      label="Compensation intensity"
                      min={0}
                      max={1.5}
                      step={0.05}
                      value={autoIntensity}
                      onValueChange={(v) => {
                        setAutoIntensity(Math.abs(v - RECOMMENDED_INTENSITY) < 0.08 ? RECOMMENDED_INTENSITY : v);
                      }}
                      formatValue={(v) => v.toFixed(2)}
                    />
                    <div className="is-intensity-labels">
                      <span className="is-intensity-limit">0</span>
                      <Button
                        intent={isNearRecommended ? "primary" : "ghost"}
                        size="sm"
                        icon={isNearRecommended ? "star" : "check"}
                        onClick={() => setAutoIntensity(RECOMMENDED_INTENSITY)}
                        className="is-recommend-btn"
                      >
                        recommended
                      </Button>
                      <span className="is-intensity-limit">1.5</span>
                    </div>
                    <div className="is-curve-wrap">
                      <CurveGraph intensity={autoIntensity} refSize={refSize} refStroke={refStroke} sizes={activeSizes} />
                    </div>
                    <div className="is-curve-label">
                      stroke = detected × (size/{refSize})^{autoIntensity.toFixed(2)}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="is-manual-header">
                      <div className="is-field-label">Stroke per size</div>
                      <Button intent="ghost" size="sm" icon="refresh" onClick={seedManualFromAuto}>Reset to auto</Button>
                    </div>
                    <div className="is-manual-list">
                      {activeSizes.map((size) => {
                        const val = manualStrokes[size] ?? calcStroke(refStroke, refSize, size, autoIntensity);
                        return (
                          <div key={size} className="is-manual-row">
                            <span className={`is-manual-size-label${size === refSize ? " is-manual-size-label--ref" : ""}`}>{size}</span>
                            <div className="is-manual-range">
                              <Range
                                min={0.25}
                                max={6}
                                step={0.25}
                                value={val}
                                hideValue
                                onValueChange={(v) => setManualStrokes((p) => ({ ...p, [size]: v }))}
                              />
                            </div>
                            <span className="is-manual-stroke-val">{val}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="is-manual-footer">Applied to all icons</div>
                  </>
                )}
              </CardBody>
            </Card>

            {/* Color */}
            <Card className="is-card" padding="md">
              <CardBody>
                <div className="is-sec-label">Color</div>
                <div className="is-color-row">
                  <div className="is-color-swatch-wrap">
                    <div className="is-color-swatch-bg">
                      <div className="is-color-swatch-fg" style={iconColor ? { background: iconColor } : {}} />
                    </div>
                    <input
                      type="color"
                      value={/^#[0-9a-fA-F]{6}$/.test(iconColor) ? iconColor : "#888888"}
                      onChange={(e) => setIconColor(e.target.value)}
                      className="is-color-picker-hidden"
                      aria-label="Pick color"
                    />
                  </div>
                  <div className="is-color-text">
                    <Input
                      size="sm"
                      value={iconColor}
                      onChange={(e) => setIconColor(e.target.value)}
                      placeholder="currentColor"
                      spellCheck={false}
                      aria-label="Icon color value"
                    />
                  </div>
                  {iconColor && (
                    <Button intent="ghost" size="sm" icon="close" onClick={() => setIconColor("")} aria-label="Clear color" />
                  )}
                </div>
                <div className="is-color-hint">#hex · rgb() · oklch() · var(--token)</div>
              </CardBody>
            </Card>

            {/* Export Sizes */}
            <Card className="is-card" padding="md">
              <CardBody>
                <div className="is-sec-label">Export Sizes</div>
                <div className="is-size-grid">
                  {PRESET_SIZES.map((s) => {
                    const active = activeSizes.includes(s);
                    return (
                      <Button
                        key={s}
                        intent={active ? "primary" : "ghost"}
                        size="sm"
                        onClick={() => toggleSize(s)}
                        className="is-size-btn"
                      >
                        {s}
                      </Button>
                    );
                  })}
                </div>
              </CardBody>
            </Card>

            <div className="is-sidebar-spacer" />

            <Button
              intent="primary"
              size="lg"
              icon="download"
              onClick={exportAll}
              disabled={workspace.length === 0 || activeSizes.length === 0}
              className="is-export-btn"
            >
              {workspace.length > 0 ? `Export all (${workspace.length})` : "Export all"}
            </Button>
          </div>

          {/* ── Main Content ── */}
          <div
            className="is-main-content"
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false); }}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUploadFiles(e.dataTransfer.files); }}
          >
            {dragOver && (
              <div className="is-drag-overlay">
                <div className="is-drag-overlay-inner">
                  <div className="is-drag-overlay-arrow">
                    <Icon name="arrow-down" size={28} />
                  </div>
                  <div className="is-drag-overlay-label">Drop SVG files</div>
                </div>
              </div>
            )}

            {workspace.length === 0 && !loadingWorkspace ? (
              <div className="is-empty-state">
                <div className="is-empty-diamond">
                  <Icon name="grid" size={32} />
                </div>
                <span>Browse the icon library or upload your own SVGs</span>
                <div className="is-empty-actions">
                  <Button intent="primary" size="md" icon="grid" onClick={() => setShowBrowser(true)}>Browse Icons</Button>
                  <Button intent="secondary" size="md" icon="upload" onClick={() => document.getElementById("is-empty-upload").click()}>
                    Upload SVG
                  </Button>
                  <input id="is-empty-upload" type="file" accept=".svg,image/svg+xml" multiple style={{ display: "none" }}
                    onChange={(e) => { handleUploadFiles(e.target.files); e.target.value = ""; }} />
                </div>
                <div className="is-empty-tips-grid">
                  {[
                    {
                      label: "Figma",
                      tips: [
                        ["Center stroke alignment", "inside/outside strokes are expanded to filled paths on SVG export"],
                        ["Avoid Outline Stroke", "the right-click option converts strokes to fills — keep strokes live"],
                        ["Export from a Frame", "bare groups may omit the viewBox; frames always include it"],
                        ["Don't Flatten Selection", "flattening merges paths and discards individual stroke data"],
                      ],
                    },
                    {
                      label: "Adobe Illustrator",
                      tips: [
                        ["Avoid Object → Expand", "expands strokes into filled outlines before export"],
                        ["Presentation Attributes", "in SVG Options — not CSS Properties or Style Element"],
                        ["Enable Responsive", "removes fixed width/height while preserving viewBox"],
                        ["File → Save As → SVG", "produces cleaner output than Export As → SVG"],
                      ],
                    },
                  ].map(({ label, tips }) => (
                    <div key={label} className="is-tip-card">
                      <div className="is-tip-card-label">{label}</div>
                      <div className="is-tip-list">
                        {tips.map(([title, desc]) => (
                          <div key={title} className="is-tip-item">
                            <span className="is-tip-title">{title}</span>
                            <span className="is-tip-desc">{desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {/* Column headers */}
                <div className="is-col-headers">
                  <div className="is-col-icon-label">Icon</div>
                  <div className="is-col-sizes">
                    {activeSizes.map((size) => {
                      const dim = Math.max(size + 16, 40);
                      return (
                        <div key={size} className="is-col-size-header" style={{ width: dim }}>
                          <span className={`is-col-size-label${size === refSize ? " is-col-size-label--ref" : ""}`}>{size}px</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="is-col-spacer" />
                </div>

                {workspace.map((item) => (
                  <WorkspaceRow
                    key={item.id}
                    item={item}
                    activeSizes={activeSizes}
                    getStrokeForSize={getStrokeForSize}
                    onRemove={() => removeFromWorkspace(item.id)}
                    iconColor={iconColor}
                  />
                ))}

                {loadingWorkspace && (
                  <div className="is-loading-row">
                    <span>Loading icons…</span>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
  );
}
