import { useState, useEffect } from "react";
import { useBuilderStore } from "../state/themeState";
import { useGoogleFonts, getAvailableWeights, loadGoogleFont, type GoogleFont } from "../hooks/useGoogleFonts";
import { Select, NumberField, Range, Switch, type SelectOption } from "@ui-organized/react";
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
}: {
  label: string;
  value: string;
  weights: Record<string, number>;
  fonts: GoogleFont[];
  loading: boolean;
  portalContainer: HTMLElement | null;
  onSelect: (family: string, weights: Record<string, number>) => void;
}) {
  const fontOptions: SelectOption[] = fonts.map((f) => ({ value: f.family, label: f.family }));

  const selectedFont = fonts.find((f) => f.family === value) ?? null;
  const availableWeights = selectedFont ? getAvailableWeights(selectedFont) : [400];
  const weightOptions: SelectOption[] = availableWeights.map((w) => ({ value: String(w), label: String(w) }));

  function handleFontChange(family: string) {
    const font = fonts.find((f) => f.family === family);
    if (!font) return;
    const ws = getAvailableWeights(font);
    loadGoogleFont(font.family, ws);
    const nearest = (target: number) =>
      ws.reduce((prev, curr) =>
        Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev,
      );
    onSelect(font.family, {
      default:  nearest(400),
      emphasis: nearest(500),
      strong:   nearest(600),
      heavy:    nearest(700),
    });
  }

  return (
    <div className={styles.pickerWrap}>
      <Select
        label={label}
        value={value}
        options={fontOptions}
        onValueChange={handleFontChange}
        disabled={loading}
        size="sm"
        portalContainer={portalContainer}
      />
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
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function TypographyPanel() {
  const {
    headingFamily, headingWeights,
    bodyFamily, bodyWeights,
    typeScaleBase, typeScaleRatio,
    headingLineHeight, bodyLineHeight, lineHeightGuides,
    setHeadingFont, setBodyFont, setTypeScale,
    setHeadingLineHeight, setBodyLineHeight, setLineHeightGuides,
  } = useBuilderStore();

  const { fonts, loading } = useGoogleFonts();

  // Keep the active fonts loaded with their full weight set — including the
  // defaults, which were never picked through the dropdown — so changing any
  // weight role renders against a real font file rather than a fallback.
  useEffect(() => {
    if (!fonts.length) return;
    for (const family of [headingFamily, bodyFamily]) {
      const font = fonts.find((f) => f.family === family);
      if (font) loadGoogleFont(family, getAvailableWeights(font));
    }
  }, [fonts, headingFamily, bodyFamily]);

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
          />
          <FontPicker
            label="Body Font"
            value={bodyFamily}
            weights={bodyWeights}
            fonts={fonts}
            loading={loading}
            portalContainer={portalEl}
            onSelect={setBodyFont}
          />
        </div>
      </section>

      {/* ── Type Scale ───────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Type Scale</h3>

        <div className={styles.scaleControls}>
          <div className={styles.baseField}>
            <NumberField
              label="Base size"
              size="sm"
              value={typeScaleBase}
              min={8}
              max={32}
              step={1}
              onValueChange={(v) => setTypeScale(v ?? typeScaleBase, typeScaleRatio)}
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
          <span className={styles.guideHint}>
            Outlines the top and bottom of each line's box in the preview.
          </span>
        </div>
      </section>
    </div>
  );
}
