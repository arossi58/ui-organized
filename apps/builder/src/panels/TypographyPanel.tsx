import { useState, useMemo } from "react";
import { useBuilderStore, DEFAULT_LINE_HEIGHT_SCALE } from "../state/themeState";
import { useGoogleFonts, getAvailableWeights, loadGoogleFont, type GoogleFont } from "../hooks/useGoogleFonts";
import { TYPE_SCALE_STEP_NAMES, LINE_HEIGHT_MULTIPLIERS } from "@ds/utils";
import styles from "./TypographyPanel.module.css";

// ─── Scale ratio options ──────────────────────────────────────────────────────

const RATIO_PRESETS = [
  { label: "Minor Second (1.067)", value: 1.067 },
  { label: "Major Second (1.125)", value: 1.125 },
  { label: "Minor Third (1.2)", value: 1.2 },
  { label: "Major Third (1.25)", value: 1.25 },
  { label: "Perfect Fourth (1.333)", value: 1.333 },
  { label: "Augmented Fourth (1.414)", value: 1.414 },
  { label: "Perfect Fifth (1.5)", value: 1.5 },
];

const HEADING_STEPS = ["display-xlarge","display-large","display-medium","heading-large","heading-medium","heading-small"];

const WEIGHT_ROLES = [
  { key: "default",  label: "Default (Regular)" },
  { key: "emphasis", label: "Emphasis (Medium)" },
  { key: "strong",   label: "Strong (SemiBold)" },
  { key: "heavy",    label: "Heavy (Bold)" },
];

// ─── Font search dropdown ─────────────────────────────────────────────────────

function FontPicker({
  label,
  value,
  weights,
  fonts,
  loading,
  onSelect,
}: {
  label: string;
  value: string;
  weights: Record<string, number>;
  fonts: GoogleFont[];
  loading: boolean;
  onSelect: (family: string, weights: Record<string, number>) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query) return fonts.slice(0, 50);
    const q = query.toLowerCase();
    return fonts.filter((f) => f.family.toLowerCase().includes(q)).slice(0, 50);
  }, [fonts, query]);

  const selectedFont = fonts.find((f) => f.family === value) ?? null;
  const availableWeights = selectedFont ? getAvailableWeights(selectedFont) : [400];

  function handleSelect(font: GoogleFont) {
    const ws = getAvailableWeights(font);
    loadGoogleFont(font.family, ws);

    // Map semantic weight roles to nearest available weight
    function nearest(target: number): number {
      return ws.reduce((prev, curr) =>
        Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev,
      );
    }
    const newWeights = {
      default:  nearest(400),
      emphasis: nearest(500),
      strong:   nearest(600),
      heavy:    nearest(700),
    };
    onSelect(font.family, newWeights);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className={styles.pickerWrap}>
      <label className={styles.pickerLabel}>{label}</label>

      <div className={styles.pickerField} onClick={() => setOpen((o) => !o)}>
        <span style={{ fontFamily: `'${value}', sans-serif` }}>{value}</span>
        <span className={styles.chevron}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div className={styles.dropdown}>
          <input
            autoFocus
            className={styles.searchInput}
            placeholder="Search fonts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          {loading ? (
            <div className={styles.dropdownLoading}>Loading fonts…</div>
          ) : (
            <ul className={styles.fontList}>
              {filtered.map((font) => (
                <li
                  key={font.family}
                  className={`${styles.fontItem} ${font.family === value ? styles.fontItemActive : ""}`}
                  onClick={() => handleSelect(font)}
                >
                  <span style={{ fontFamily: `'${font.family}', sans-serif` }}>
                    {font.family}
                  </span>
                  <span className={styles.fontWeightHint}>
                    {getAvailableWeights(font).join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Weight role assignment */}
      <div className={styles.weightRoles}>
        {WEIGHT_ROLES.map(({ key, label: wLabel }) => (
          <div key={key} className={styles.weightRow}>
            <span className={styles.weightRoleLabel}>{wLabel}</span>
            <select
              className={styles.weightSelect}
              value={weights[key] ?? 400}
              onChange={(e) => {
                const newWeights = { ...weights, [key]: Number(e.target.value) };
                onSelect(value, newWeights);
              }}
            >
              {availableWeights.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Type scale specimen ──────────────────────────────────────────────────────

function TypeScaleSpecimen({
  steps,
  headingFamily,
  bodyFamily,
  lineHeightScale,
}: {
  steps: Record<string, number>;
  headingFamily: string;
  bodyFamily: string;
  lineHeightScale: number;
}) {
  return (
    <div className={styles.specimen}>
      {TYPE_SCALE_STEP_NAMES.map((stepName) => {
        const px = steps[stepName] ?? 16;
        const isHeading = HEADING_STEPS.includes(stepName);
        const lhMultiplier = LINE_HEIGHT_MULTIPLIERS[stepName] ?? 1.5;
        const lh = Math.round(px * lhMultiplier * lineHeightScale * 10) / 10;
        return (
          <div key={stepName} className={styles.specimenRow}>
            <div className={styles.specimenMeta}>
              <span className={styles.specimenName}>{stepName}</span>
              <span className={styles.specimenPx}>{px}px / {lh}</span>
            </div>
            <span
              className={styles.specimenText}
              style={{
                fontSize: `${px}px`,
                fontFamily: isHeading
                  ? `'${headingFamily}', sans-serif`
                  : `'${bodyFamily}', sans-serif`,
              }}
            >
              The quick brown fox
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function TypographyPanel() {
  const {
    headingFamily, headingWeights,
    bodyFamily, bodyWeights,
    typeScaleBase, typeScaleRatio, typeScaleSteps,
    lineHeightScale,
    setHeadingFont, setBodyFont, setTypeScale, setLineHeightScale,
  } = useBuilderStore();

  const { fonts, loading } = useGoogleFonts();

  const [customRatio, setCustomRatio] = useState("");
  const isCustomRatio = !RATIO_PRESETS.some((p) => p.value === typeScaleRatio);

  return (
    <div className={styles.panel}>
      {/* ── Fonts ────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Fonts</h3>
        <div className={styles.fontPickers}>
          <FontPicker
            label="Heading Font"
            value={headingFamily}
            weights={headingWeights}
            fonts={fonts}
            loading={loading}
            onSelect={setHeadingFont}
          />
          <FontPicker
            label="Body Font"
            value={bodyFamily}
            weights={bodyWeights}
            fonts={fonts}
            loading={loading}
            onSelect={setBodyFont}
          />
        </div>
      </section>

      {/* ── Type Scale ───────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Type Scale</h3>

        <div className={styles.scaleControls}>
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Base size (body-large)</label>
            <div className={styles.numberRow}>
              <input
                type="number"
                className={styles.numberInput}
                value={typeScaleBase}
                min={8}
                max={32}
                step={1}
                onChange={(e) => setTypeScale(Number(e.target.value), typeScaleRatio)}
              />
              <span className={styles.unit}>px</span>
            </div>
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Scale ratio</label>
            <select
              className={styles.ratioSelect}
              value={isCustomRatio ? "custom" : String(typeScaleRatio)}
              onChange={(e) => {
                if (e.target.value !== "custom") {
                  setTypeScale(typeScaleBase, Number(e.target.value));
                  setCustomRatio("");
                }
              }}
            >
              {RATIO_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
              <option value="custom">Custom…</option>
            </select>
            {(isCustomRatio || customRatio !== "") && (
              <input
                type="number"
                className={styles.numberInput}
                placeholder="1.25"
                step={0.001}
                min={1.01}
                max={2}
                value={isCustomRatio ? typeScaleRatio : customRatio}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v > 1) {
                    setCustomRatio(e.target.value);
                    setTypeScale(typeScaleBase, v);
                  }
                }}
              />
            )}
          </div>
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Line height scale
            <span className={styles.sliderValue}>{lineHeightScale.toFixed(2)}×</span>
          </label>
          <input
            type="range"
            className={styles.slider}
            min={0.75}
            max={1.5}
            step={0.05}
            value={lineHeightScale}
            onChange={(e) => setLineHeightScale(Number(e.target.value))}
          />
          <div className={styles.sliderTicks}>
            <span>0.75</span>
            <span>1.00</span>
            <span>1.25</span>
            <span>1.50</span>
          </div>
        </div>

        <TypeScaleSpecimen
          steps={typeScaleSteps}
          headingFamily={headingFamily}
          bodyFamily={bodyFamily}
          lineHeightScale={lineHeightScale}
        />
      </section>
    </div>
  );
}
