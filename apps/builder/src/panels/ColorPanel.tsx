import { useBuilderStore } from "../state/themeState";
import { NEUTRAL_PRESET_NAMES, type NeutralPresetName } from "@ds/utils";
import styles from "./ColorPanel.module.css";

// ─── Color swatch strip ───────────────────────────────────────────────────────

const RAMP_STEPS = ["100","200","300","400","500","600","700","800","900","1000","1100","1200","1300","1400","1500","1600"];

function RampStrip({ ramp }: { ramp: Record<string, { hex: string }> }) {
  return (
    <div className={styles.rampStrip}>
      {RAMP_STEPS.map((step) => (
        <div
          key={step}
          className={styles.rampSwatch}
          style={{ backgroundColor: ramp[step]?.hex ?? "#000" }}
          title={`${step}: ${ramp[step]?.hex ?? "?"}`}
        >
          <span className={styles.rampStep}>{step}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Neutral preset card ──────────────────────────────────────────────────────

import { neutralPresets } from "@ds/utils";

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
  const { brandHex, brandRamp, neutralPreset, setBrandColor, setNeutralPreset } =
    useBuilderStore();

  function handleHexInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) {
      setBrandColor(val);
    }
  }

  function handleColorPicker(e: React.ChangeEvent<HTMLInputElement>) {
    setBrandColor(e.target.value);
  }

  return (
    <div className={styles.panel}>
      {/* ── Brand Color ─────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Brand Color</h3>
        <p className={styles.hint}>Pick your primary brand color. A full 16-step ramp will be generated automatically.</p>

        <div className={styles.colorPickerRow}>
          <input
            type="color"
            value={brandHex}
            onChange={handleColorPicker}
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
            { label: "Info", color: "#3182ce" },
            { label: "Caution", color: "#d69e2e" },
            { label: "Warning", color: "#d53f8c" },
            { label: "Error", color: "#e63030" },
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
