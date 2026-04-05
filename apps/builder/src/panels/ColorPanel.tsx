import { useBuilderStore } from "../state/themeState";
import { NEUTRAL_PRESET_NAMES, type NeutralPresetName, neutralPresets } from "@ds/utils";
import styles from "./ColorPanel.module.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const RAMP_STEPS = ["100","200","300","400","500","600","700","800","900","1000","1100","1200","1300","1400","1500","1600"];

// White (#fcfcfc) is the primary text/icon color on dark backgrounds in the DS.
const PRIMARY_TEXT_HEX = "#fcfcfc";

// ─── WCAG contrast utilities ──────────────────────────────────────────────────

function hexToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * hexToLinear(r) + 0.7152 * hexToLinear(g) + 0.0722 * hexToLinear(b);
}

function wcagContrast(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function contrastLevel(ratio: number): "AAA" | "AA" | "fail" {
  if (ratio >= 7)   return "AAA";
  if (ratio >= 4.5) return "AA";
  return "fail";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RampStrip({ ramp }: { ramp: Record<string, { hex: string }> }) {
  return (
    <div className={styles.rampStrip}>
      {RAMP_STEPS.map((s) => (
        <div
          key={s}
          className={styles.rampSwatch}
          style={{ backgroundColor: ramp[s]?.hex ?? "#000" }}
          title={`${s}: ${ramp[s]?.hex ?? "?"}`}
        >
          <span className={styles.rampStep}>{s}</span>
        </div>
      ))}
    </div>
  );
}

function PrimaryShadeSelector({
  ramp,
  brandHex,
  selectedShade,
  onSelect,
}: {
  ramp: Record<string, { hex: string; oklch: string }>;
  brandHex: string;
  selectedShade: string;
  onSelect: (shade: string) => void;
}) {
  // Resolve the hex of whatever is currently selected
  const selectedHex = selectedShade === "input" ? brandHex : (ramp[selectedShade]?.hex ?? "#000000");
  const contrastRatio = wcagContrast(selectedHex, PRIMARY_TEXT_HEX);
  const level = contrastLevel(contrastRatio);
  const passes = level !== "fail";

  // Check whether the input hex is identical to one of the ramp steps so we
  // can show the "Input" badge on that cell instead of adding a duplicate.
  const inputMatchesStep = RAMP_STEPS.find(
    (s) => ramp[s]?.hex.toLowerCase() === brandHex.toLowerCase()
  );

  return (
    <div className={styles.shadeSelector}>
      <div className={styles.shadePalette}>
        {/* ── Input color cell (only shown when it doesn't match a ramp step) ── */}
        {!inputMatchesStep && (() => {
          const ratio = wcagContrast(brandHex, PRIMARY_TEXT_HEX);
          const ok = ratio >= 4.5;
          const isSelected = selectedShade === "input";
          return (
            <button
              key="input"
              type="button"
              disabled={!ok}
              onClick={() => onSelect("input")}
              className={[
                styles.shadeCell,
                styles.shadeCellInput,
                isSelected ? styles.shadeCellSelected : "",
                !ok ? styles.shadeCellDisabled : "",
              ].join(" ")}
              style={{ backgroundColor: brandHex }}
              title={ok ? `Input color ${brandHex} — ${ratio.toFixed(1)}:1` : `Input color ${brandHex} — fails 4.5:1 (${ratio.toFixed(1)}:1)`}
            >
              <span className={styles.shadeCellInputLabel}>↗</span>
              {isSelected && <span className={styles.shadeCellCheck}>✓</span>}
              {!ok && <span className={styles.shadeCellBan}>✕</span>}
            </button>
          );
        })()}

        {/* ── Ramp steps ── */}
        {RAMP_STEPS.map((s) => {
          const hex = ramp[s]?.hex ?? "#000000";
          const ratio = wcagContrast(hex, PRIMARY_TEXT_HEX);
          const ok = ratio >= 4.5;
          const isSelected = selectedShade === s;
          const isInput = inputMatchesStep === s;

          return (
            <button
              key={s}
              type="button"
              disabled={!ok}
              onClick={() => onSelect(s)}
              className={[
                styles.shadeCell,
                isSelected ? styles.shadeCellSelected : "",
                !ok ? styles.shadeCellDisabled : "",
              ].join(" ")}
              style={{ backgroundColor: hex }}
              title={ok ? `${s} — ${ratio.toFixed(1)}:1${isInput ? " · Your input color" : ""}` : `${s} — fails 4.5:1 (${ratio.toFixed(1)}:1)`}
            >
              {isInput && !isSelected && <span className={styles.shadeCellInputDot} />}
              {isSelected && <span className={styles.shadeCellCheck}>✓</span>}
              {!ok && <span className={styles.shadeCellBan}>✕</span>}
            </button>
          );
        })}
      </div>

      {/* ── Contrast readout ── */}
      <div className={`${styles.contrastReadout} ${passes ? styles.contrastReadoutPass : styles.contrastReadoutFail}`}>
        <div className={styles.contrastSwatch} style={{ backgroundColor: selectedHex }}>
          <span className={styles.contrastSwatchLabel} style={{ color: PRIMARY_TEXT_HEX }}>Aa</span>
        </div>
        <div className={styles.contrastInfo}>
          <span className={styles.contrastRatio}>{contrastRatio.toFixed(2)}:1</span>
          <span className={styles.contrastLabel}>
            {passes ? `WCAG ${level}` : "Fails WCAG AA (4.5:1 min)"}
          </span>
          <span className={styles.contrastShade}>
            {selectedShade === "input" ? `Input · ${brandHex}` : `Shade ${selectedShade} · ${selectedHex}`}
            {inputMatchesStep === selectedShade ? " · Input color" : ""}
          </span>
        </div>
        <div className={`${styles.contrastBadge} ${passes ? styles.contrastBadgePass : styles.contrastBadgeFail}`}>
          {level === "fail" ? "Fail" : level}
        </div>
      </div>
    </div>
  );
}

function NeutralCard({
  name,
  selected,
  onClick,
}: {
  name: NeutralPresetName;
  selected: boolean;
  onClick: () => void;
}) {
  const ramp = neutralPresets[name];
  const midShades = ["400", "700", "900", "1100", "1300"];

  return (
    <button
      className={`${styles.neutralCard} ${selected ? styles.neutralCardSelected : ""}`}
      onClick={onClick}
      type="button"
      title={name}
    >
      <div className={styles.neutralSwatchRow}>
        {midShades.map((s) => (
          <div
            key={s}
            className={styles.neutralMiniSwatch}
            style={{ backgroundColor: ramp[s]?.hex ?? "#000" }}
          />
        ))}
      </div>
      <span className={styles.neutralName}>{name}</span>
    </button>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function ColorPanel() {
  const {
    brandHex, brandRamp, brandShade,
    neutralPreset,
    setBrandColor, setBrandShade, setNeutralPreset,
  } = useBuilderStore();

  function handleHexInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) {
      setBrandColor(val);
    }
  }

  return (
    <div className={styles.panel}>
      {/* ── Brand Color ─────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Brand Color</h3>
        <p className={styles.hint}>
          Pick your primary brand color. A full 16-step ramp will be generated automatically.
        </p>

        <div className={styles.colorPickerRow}>
          <input
            type="color"
            value={brandHex}
            onChange={(e) => setBrandColor(e.target.value)}
            className={styles.colorPicker}
            title="Pick brand color"
          />
          <input
            type="text"
            defaultValue={brandHex}
            key={brandHex}
            onBlur={handleHexInput}
            onKeyDown={(e) => e.key === "Enter" && handleHexInput(e as unknown as React.ChangeEvent<HTMLInputElement>)}
            className={styles.hexInput}
            placeholder="#008ffb"
            maxLength={7}
            spellCheck={false}
          />
        </div>

        <RampStrip ramp={brandRamp} />
      </section>

      {/* ── Primary Shade ───────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Primary Color</h3>
        <p className={styles.hint}>
          Choose which shade is used as your primary interactive color.
          Only shades that meet 4.5:1 contrast against white text are selectable.
          The ↗ cell is your exact input color.
        </p>
        <PrimaryShadeSelector
          ramp={brandRamp}
          brandHex={brandHex}
          selectedShade={brandShade}
          onSelect={setBrandShade}
        />
      </section>

      {/* ── Neutral Preset ──────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Neutral Palette</h3>
        <p className={styles.hint}>
          Select a neutral ramp. This drives surface colors, secondary interactive states, and UI controls.
        </p>
        <div className={styles.neutralGrid}>
          {NEUTRAL_PRESET_NAMES.map((name) => (
            <NeutralCard
              key={name}
              name={name}
              selected={neutralPreset === name}
              onClick={() => setNeutralPreset(name)}
            />
          ))}
        </div>
      </section>

      {/* ── Functional Colors (read-only) ────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Functional Colors</h3>
        <p className={styles.hint}>
          Status colors (success, info, caution, warning, error) are system-defined and not configurable.
        </p>
        <div className={styles.functionalRow}>
          {[
            { label: "Success", color: "#38a169" },
            { label: "Info",    color: "#3182ce" },
            { label: "Caution", color: "#d69e2e" },
            { label: "Warning", color: "#d53f8c" },
            { label: "Error",   color: "#e63030" },
          ].map(({ label, color }) => (
            <div key={label} className={styles.functionalChip}>
              <div className={styles.functionalDot} style={{ backgroundColor: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
