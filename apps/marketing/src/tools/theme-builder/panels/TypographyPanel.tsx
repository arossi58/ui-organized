import { useState, useEffect } from "react";
import { useBuilderStore, DEFAULT_HEADING_PREVIEW, DEFAULT_BODY_PREVIEW } from "../state/themeState";
import {
  useGoogleFonts,
  getAvailableWeights,
  loadGoogleFont,
  weightCoverageWarning,
  type GoogleFont,
} from "../hooks/useGoogleFonts";
import { Select, Combobox, Input, NumberField, Range, Switch, type SelectOption, type ComboboxOption } from "@ui-organized/react";
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

const RATIO_OPTIONS: SelectOption[] = [
  ...RATIO_PRESETS.map((p) => ({ value: String(p.value), label: p.label })),
  { value: "custom", label: "Custom…" },
];

const WEIGHT_ROLES = [
  { key: "default",  label: "Default" },
  { key: "emphasis", label: "Emphasis" },
  { key: "strong",   label: "Strong" },
  { key: "heavy",    label: "Heavy" },
];

// ─── Font picker ──────────────────────────────────────────────────────────────

function FontPicker({
  label,
  value,
  weights,
  fonts,
  loading,
  portalContainer,
  onSelect,
  previewText,
  previewPlaceholder,
  onPreviewTextChange,
}: {
  label: string;
  value: string;
  weights: Record<string, number>;
  fonts: GoogleFont[];
  loading: boolean;
  portalContainer: HTMLElement | null;
  onSelect: (family: string, weights: Record<string, number>, available?: number[]) => void;
  previewText: string;
  previewPlaceholder: string;
  onPreviewTextChange: (text: string) => void;
}) {
  const fontOptions: ComboboxOption[] = fonts.map((f) => ({ value: f.family, label: f.family }));

  const selectedFont = fonts.find((f) => f.family === value) ?? null;
  const availableWeights = selectedFont ? getAvailableWeights(selectedFont) : [400];
  const weightOptions: SelectOption[] = availableWeights.map((w) => ({ value: String(w), label: String(w) }));

  // Catching this at pick time beats any downstream build warning: the variant
  // list is already in hand, so it costs no extra request. Never blocks the
  // choice — a display face with one weight is a legitimate pick, it just
  // shouldn't be a surprise when Strong and Heavy look identical.
  const coverageWarning = selectedFont
    ? weightCoverageWarning(value, weights, availableWeights)
    : null;

  function handleFontChange(family: string) {
    const font = fonts.find((f) => f.family === family);
    if (!font) return;
    const ws = getAvailableWeights(font);
    loadGoogleFont(font.family, ws);
    const nearest = (target: number) =>
      ws.reduce((prev, curr) =>
        Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev,
      );
    onSelect(
      font.family,
      {
        default:  nearest(400),
        emphasis: nearest(500),
        strong:   nearest(600),
        heavy:    nearest(700),
      },
      ws,
    );
  }

  return (
    <div className={styles.pickerWrap}>
      <Combobox
        label={label}
        value={value}
        options={fontOptions}
        onValueChange={(family) => family && handleFontChange(family)}
        disabled={loading}
        size="sm"
        placeholder="Search fonts…"
        emptyMessage="No matching Figma fonts."
        portalContainer={portalContainer}
      />
      {coverageWarning && (
        <p className={styles.weightWarning} role="status">
          {coverageWarning}
        </p>
      )}
      <div className={styles.weightRoles}>
        {WEIGHT_ROLES.map(({ key, label: wLabel }) => (
          <div key={key} className={styles.weightRow}>
            <span className={styles.weightRoleLabel}>{wLabel}</span>
            <div className={styles.weightSelectWrap}>
              <Select
                value={String(weights[key] ?? 400)}
                options={weightOptions}
                onValueChange={(v) => onSelect(value, { ...weights, [key]: Number(v) })}
                size="sm"
                portalContainer={portalContainer}
              />
            </div>
          </div>
        ))}
      </div>
      <Input
        label="Preview text"
        size="sm"
        value={previewText}
        placeholder={previewPlaceholder}
        onChange={(e) => onPreviewTextChange(e.target.value)}
      />
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function TypographyPanel() {
  const {
    headingFamily, headingWeights, headingFontAvailable, bodyFontAvailable,
    bodyFamily, bodyWeights,
    typeScaleBase, typeScaleRatio, typeScaleMode,
    headingLineHeight, bodyLineHeight, lineHeightMode, lineHeightGuides,
    headingPreviewText, bodyPreviewText,
    setHeadingFont, setBodyFont, setTypeScale,
    setHeadingLineHeight, setBodyLineHeight, setLineHeightGuides,
    setHeadingPreviewText, setBodyPreviewText,
    resetTypeScale, resetLineHeight,
  } = useBuilderStore();

  const { fonts, loading } = useGoogleFonts();

  // Keep the active fonts loaded with their full weight set — including the
  // defaults, which were never picked through the dropdown — so changing any
  // weight role renders against a real font file rather than a fallback.
  //
  // Also records each family's real variant list in state. The defaults never go
  // through `handleFontChange`, so without this the export would fall back to
  // "available = whatever the theme declares" and could never tell the user a
  // weight is being synthesised.
  useEffect(() => {
    if (!fonts.length) return;
    const same = (a: number[], b: number[]) =>
      a.length === b.length && a.every((w, i) => w === b[i]);

    const heading = fonts.find((f) => f.family === headingFamily);
    if (heading) {
      const ws = getAvailableWeights(heading);
      loadGoogleFont(headingFamily, ws);
      // Only write when it actually changed — an unconditional set() would push a
      // fresh store object and re-render every subscriber on each pass.
      if (!same(ws, headingFontAvailable)) setHeadingFont(headingFamily, headingWeights, ws);
    }

    const body = fonts.find((f) => f.family === bodyFamily);
    if (body) {
      const ws = getAvailableWeights(body);
      loadGoogleFont(bodyFamily, ws);
      if (!same(ws, bodyFontAvailable)) setBodyFont(bodyFamily, bodyWeights, ws);
    }
    // The weight maps are deliberately not dependencies: this only needs to run
    // when the font list or a chosen family changes, and including them would
    // cycle through the setters it calls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fonts, headingFamily, bodyFamily, headingFontAvailable, bodyFontAvailable]);

  // Portal Select dropdowns into the panel root so they inherit the dark DS theme.
  const [portalEl, setPortalEl] = useState<HTMLDivElement | null>(null);

  const [customMode, setCustomMode] = useState(false);
  const isCustomRatio = !RATIO_PRESETS.some((p) => p.value === typeScaleRatio);
  const showCustom = customMode || isCustomRatio;
  const ratioSelectValue = showCustom ? "custom" : String(typeScaleRatio);

  return (
    <div className={styles.panel} ref={setPortalEl}>
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
            portalContainer={portalEl}
            onSelect={setHeadingFont}
            previewText={headingPreviewText}
            previewPlaceholder={DEFAULT_HEADING_PREVIEW}
            onPreviewTextChange={setHeadingPreviewText}
          />
          <FontPicker
            label="Body Font"
            value={bodyFamily}
            weights={bodyWeights}
            fonts={fonts}
            loading={loading}
            portalContainer={portalEl}
            onSelect={setBodyFont}
            previewText={bodyPreviewText}
            previewPlaceholder={DEFAULT_BODY_PREVIEW}
            onPreviewTextChange={setBodyPreviewText}
          />
        </div>
      </section>

      {/* ── Type Scale ───────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h3 className={styles.sectionTitle}>Type Scale</h3>
          {typeScaleMode === "system" ? (
            <span className={styles.systemBadge}>Design system default</span>
          ) : (
            <button type="button" className={styles.resetBtn} onClick={resetTypeScale}>
              Reset to design system
            </button>
          )}
        </div>

        <div className={styles.scaleControls}>
          <div className={styles.baseField}>
            <NumberField
              label="Base size"
              size="sm"
              value={typeScaleBase}
              min={10}
              max={32}
              step={1}
              onValueChange={(v) => setTypeScale(Math.max(10, v ?? typeScaleBase), typeScaleRatio)}
            />
          </div>
          <div className={styles.ratioField}>
            <Select
              label="Scale ratio"
              size="sm"
              value={ratioSelectValue}
              options={RATIO_OPTIONS}
              portalContainer={portalEl}
              onValueChange={(v) => {
                if (v === "custom") {
                  setCustomMode(true);
                } else {
                  setCustomMode(false);
                  setTypeScale(typeScaleBase, Number(v));
                }
              }}
            />
          </div>
        </div>

        {showCustom && (
          <div className={styles.baseField}>
            <NumberField
              label="Custom ratio"
              size="sm"
              value={typeScaleRatio}
              min={1.01}
              max={2}
              step={0.01}
              onValueChange={(v) => {
                if (v && v > 1) setTypeScale(typeScaleBase, v);
              }}
            />
          </div>
        )}

        <div className={styles.sectionHead}>
          <span className={styles.weightRoleLabel}>Line height</span>
          {lineHeightMode === "system" ? (
            <span className={styles.systemBadge}>Per-step design system default</span>
          ) : (
            <button type="button" className={styles.resetBtn} onClick={resetLineHeight}>
              Reset to design system
            </button>
          )}
        </div>

        <Range
          label="Heading line height"
          size="sm"
          value={headingLineHeight}
          min={0.75}
          max={2}
          step={0.05}
          formatValue={(v) => `${v.toFixed(2)}×`}
          onValueChange={setHeadingLineHeight}
        />

        <Range
          label="Body & caption line height"
          size="sm"
          value={bodyLineHeight}
          min={0.75}
          max={2}
          step={0.05}
          formatValue={(v) => `${v.toFixed(2)}×`}
          onValueChange={setBodyLineHeight}
        />

        <div className={styles.guideRow}>
          <Switch
            label="Preview line height"
            checked={lineHeightGuides}
            onCheckedChange={setLineHeightGuides}
          />
        </div>
      </section>
    </div>
  );
}
