import { useBuilderStore } from "../state/themeState";
import {
  BRAND_FAMILY_NAMES,
  NEUTRAL_FAMILY_NAMES,
  CORE_STEPS,
  coreColors,
  getCoreFamily,
} from "@ds/utils";
import styles from "./ColorPanel.module.css";

// ─── Constants ────────────────────────────────────────────────────────────────

// White (#fcfcfc) is the primary text/icon color on brand buttons in the DS.
const PRIMARY_TEXT_HEX = "#fcfcfc";

// Representative steps shown on a family preview card.
const CARD_STEPS = ["400", "800", "1200", "1600", "2000"];

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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
      {CORE_STEPS.map((s) => (
        <div
          key={s}
          className={styles.rampSwatch}
          style={{ backgroundColor: ramp[s]?.hex ?? "#000" }}
          title={`${s}: ${ramp[s]?.hex ?? "?"}`}
        />
      ))}
    </div>
  );
}

function FamilyCard({
  name,
  selected,
  onClick,
}: {
  name: string;
  selected: boolean;
  onClick: () => void;
}) {
  const ramp = getCoreFamily(name);
  return (
    <button
      className={`${styles.neutralCard} ${selected ? styles.neutralCardSelected : ""}`}
      onClick={onClick}
      type="button"
      title={name}
    >
      <div className={styles.neutralSwatchRow}>
        {CARD_STEPS.map((s) => (
          <div
            key={s}
            className={styles.neutralMiniSwatch}
            style={{ backgroundColor: ramp[s]?.hex ?? "#000" }}
          />
        ))}
      </div>
      <span className={styles.neutralName}>{titleCase(name)}</span>
    </button>
  );
}

function PrimaryShadeSelector({
  ramp,
  selectedShade,
  onSelect,
}: {
  ramp: Record<string, { hex: string }>;
  selectedShade: string;
  onSelect: (shade: string) => void;
}) {
  const selectedHex = ramp[selectedShade]?.hex ?? "#000000";
  const contrastRatio = wcagContrast(selectedHex, PRIMARY_TEXT_HEX);
  const level = contrastLevel(contrastRatio);
  const passes = level !== "fail";

  return (
    <div className={styles.shadeSelector}>
      <div className={styles.shadePalette}>
        {CORE_STEPS.map((s) => {
          const hex = ramp[s]?.hex ?? "#000000";
          const ratio = wcagContrast(hex, PRIMARY_TEXT_HEX);
          const ok = ratio >= 4.5;
          const isSelected = selectedShade === s;
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
              title={ok ? `${s} — ${ratio.toFixed(1)}:1` : `${s} — fails 4.5:1 (${ratio.toFixed(1)}:1)`}
            >
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
          <span className={styles.contrastShade}>Shade {selectedShade} · {selectedHex}</span>
        </div>
        <div className={`${styles.contrastBadge} ${passes ? styles.contrastBadgePass : styles.contrastBadgeFail}`}>
          {level === "fail" ? "Fail" : level}
        </div>
      </div>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function ColorPanel() {
  const {
    brandMode, brandFamily, brandHex, brandRamp, brandShade,
    neutralFamily,
    setBrandFamily, setBrandColor, setBrandShade, setNeutralFamily,
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
          Pick a brand family from the core palette, or enter a custom color to
          generate a matching 24-step ramp.
        </p>

        <div className={styles.neutralGrid}>
          {BRAND_FAMILY_NAMES.map((name) => (
            <FamilyCard
              key={name}
              name={name}
              selected={brandMode === "family" && brandFamily === name}
              onClick={() => setBrandFamily(name)}
            />
          ))}
        </div>

        <p className={styles.hint} style={{ marginTop: 16 }}>Or use a custom color:</p>
        <div className={styles.colorPickerRow}>
          <input
            type="color"
            value={brandHex}
            onChange={(e) => setBrandColor(e.target.value)}
            className={styles.colorPicker}
            title="Pick a custom brand color"
          />
          <input
            type="text"
            defaultValue={brandHex}
            key={brandHex}
            onBlur={handleHexInput}
            onKeyDown={(e) => e.key === "Enter" && handleHexInput(e as unknown as React.ChangeEvent<HTMLInputElement>)}
            className={styles.hexInput}
            placeholder="#bc4900"
            maxLength={7}
            spellCheck={false}
          />
          {brandMode === "custom" && <span className={styles.hint}>Custom</span>}
        </div>

        <RampStrip ramp={brandRamp} />
      </section>

      {/* ── Primary Shade ───────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Primary Color</h3>
        <p className={styles.hint}>
          Choose which shade of the brand ramp is the primary interactive color.
          Only shades that meet 4.5:1 contrast against white text are selectable.
        </p>
        <PrimaryShadeSelector
          ramp={brandRamp}
          selectedShade={brandShade}
          onSelect={setBrandShade}
        />
      </section>

      {/* ── Neutral Family ──────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Neutral Palette</h3>
        <p className={styles.hint}>
          Select a neutral family. This drives surfaces, borders, text, and UI
          control colors.
        </p>
        <div className={styles.neutralGrid}>
          {NEUTRAL_FAMILY_NAMES.map((name) => (
            <FamilyCard
              key={name}
              name={name}
              selected={neutralFamily === name}
              onClick={() => setNeutralFamily(name)}
            />
          ))}
        </div>
      </section>

      {/* ── Functional Colors (read-only) ────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Functional Colors</h3>
        <p className={styles.hint}>
          Status colors (success, info, caution, warning, error) are system-defined
          and not configurable.
        </p>
        <div className={styles.functionalRow}>
          {[
            { label: "Success", family: "lima" },
            { label: "Info",    family: "cerulean" },
            { label: "Caution", family: "candlelight" },
            { label: "Warning", family: "cerise" },
            { label: "Error",   family: "crimson" },
          ].map(({ label, family }) => (
            <div key={label} className={styles.functionalChip}>
              <div
                className={styles.functionalDot}
                style={{ backgroundColor: coreColors[family]?.["1000"]?.hex ?? "#000" }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
