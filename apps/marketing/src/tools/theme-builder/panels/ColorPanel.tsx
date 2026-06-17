import { useEffect, useRef, useState } from "react";
import { Input } from "@ui-organized/react";
import { useBuilderStore } from "../state/themeState";
import {
  BRAND_FAMILY_NAMES,
  NEUTRAL_FAMILY_NAMES,
  CORE_STEPS,
  getCoreFamily,
} from "@ui-organized/utils";
import styles from "./ColorPanel.module.css";

// ─── Constants ────────────────────────────────────────────────────────────────

// White (#fcfcfc) is the primary text/icon color on brand buttons in the DS.
const PRIMARY_TEXT_HEX = "#fcfcfc";

// A usable primary color must read with white text (≥4.5:1) AND not be so dark
// it's effectively black. As a shade darkens its contrast with white climbs
// toward 21, so we cap it — shades above this ratio are near-black and hidden.
// 12 keeps a healthy band (3–7 shades/family) and never drops the default 1400.
const PRIMARY_MAX_CONTRAST = 12;

// Ramp step used as the swatch preview in the family pickers.
const BRAND_SWATCH_STEP = "1400";
const NEUTRAL_SWATCH_STEP = "1000";

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface FamilyOption {
  name: string;
  label: string;
  hex: string;
}

function buildOptions(names: readonly string[], step: string): FamilyOption[] {
  return names.map((name) => ({
    name,
    label: titleCase(name),
    hex: getCoreFamily(name)[step]?.hex ?? "#000000",
  }));
}

const BRAND_OPTIONS = buildOptions(BRAND_FAMILY_NAMES, BRAND_SWATCH_STEP);
const NEUTRAL_OPTIONS = buildOptions(NEUTRAL_FAMILY_NAMES, NEUTRAL_SWATCH_STEP);

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

// ─── Icons ────────────────────────────────────────────────────────────────────

const ChevronDown = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
    <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckMark = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
    <path d="M5 10.5l3.4 3.4L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Family picker (single-select with swatches) ──────────────────────────────

function FamilyPicker({
  ariaLabel,
  options,
  selectedName,
  triggerSwatch,
  triggerLabel,
  onSelect,
}: {
  ariaLabel: string;
  options: FamilyOption[];
  /** Currently selected family, or null when none (e.g. custom brand). */
  selectedName: string | null;
  triggerSwatch: string;
  triggerLabel: string;
  onSelect: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.picker} ref={rootRef}>
      <button
        type="button"
        className={styles.pickerTrigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.pickerSwatch} style={{ background: triggerSwatch }} aria-hidden="true" />
        <span className={styles.pickerTriggerLabel}>{triggerLabel}</span>
        <span className={styles.pickerChevron}><ChevronDown /></span>
      </button>

      {open && (
        <div className={styles.pickerPanel} role="listbox" aria-label={ariaLabel}>
          {options.map((opt) => {
            const selected = opt.name === selectedName;
            return (
              <button
                key={opt.name}
                type="button"
                role="option"
                aria-selected={selected}
                className={`${styles.pickerItem} ${selected ? styles.pickerItemSelected : ""}`}
                onClick={() => {
                  onSelect(opt.name);
                  setOpen(false);
                }}
              >
                <span className={styles.pickerSwatch} style={{ background: opt.hex }} aria-hidden="true" />
                <span className={styles.pickerItemLabel}>{opt.label}</span>
                {selected && <span className={styles.pickerCheck}><CheckMark /></span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Primary shade selector (only accessible shades) ──────────────────────────

function PrimaryShadeSelector({
  ramp,
  selectedShade,
  onSelect,
}: {
  ramp: Record<string, { hex: string }>;
  selectedShade: string;
  onSelect: (shade: string) => void;
}) {
  // Offer only shades that clear 4.5:1 against white button text (not too light)
  // and stay under the near-black cap (not too dark).
  const validSteps = CORE_STEPS.filter((s) => {
    const hex = ramp[s]?.hex;
    if (!hex) return false;
    const contrast = wcagContrast(hex, PRIMARY_TEXT_HEX);
    return contrast >= 4.5 && contrast <= PRIMARY_MAX_CONTRAST;
  });

  const selectedHex = ramp[selectedShade]?.hex ?? "#000000";
  const contrastRatio = wcagContrast(selectedHex, PRIMARY_TEXT_HEX);
  const level = contrastLevel(contrastRatio);
  const passes = level !== "fail";

  return (
    <div className={styles.shadeSelector}>
      <div className={styles.shadePalette}>
        {validSteps.map((s) => {
          const hex = ramp[s]?.hex ?? "#000000";
          const isSelected = selectedShade === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onSelect(s)}
              className={`${styles.shadeCell} ${isSelected ? styles.shadeCellSelected : ""}`}
              style={{ backgroundColor: hex }}
              title={`${s} — ${wcagContrast(hex, PRIMARY_TEXT_HEX).toFixed(1)}:1`}
            >
              {isSelected && <span className={styles.shadeCellCheck}>✓</span>}
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

  const brandTriggerSwatch = brandMode === "custom"
    ? brandHex
    : brandRamp[brandShade]?.hex ?? brandHex;
  const brandTriggerLabel = brandMode === "custom" ? "Custom color" : titleCase(brandFamily);

  return (
    <div className={styles.panel}>
      {/* ── Brand Color ─────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Brand Color</h3>
        <p className={styles.hint}>
          Pick a brand family from the core palette, or enter a custom color to
          generate a matching 24-step ramp.
        </p>

        <FamilyPicker
          ariaLabel="Brand family"
          options={BRAND_OPTIONS}
          selectedName={brandMode === "family" ? brandFamily : null}
          triggerSwatch={brandTriggerSwatch}
          triggerLabel={brandTriggerLabel}
          onSelect={setBrandFamily}
        />

        <p className={styles.hint} style={{ marginTop: 4 }}>Or use a custom color:</p>
        <div className={styles.colorPickerRow}>
          <input
            type="color"
            value={brandHex}
            onChange={(e) => setBrandColor(e.target.value)}
            className={styles.colorPicker}
            title="Pick a custom brand color"
          />
          <Input
            size="sm"
            className={styles.hexField}
            defaultValue={brandHex}
            key={brandHex}
            onBlur={handleHexInput}
            onKeyDown={(e) => e.key === "Enter" && handleHexInput(e as unknown as React.ChangeEvent<HTMLInputElement>)}
            placeholder="#bc4900"
            maxLength={7}
            spellCheck={false}
            aria-label="Custom brand hex"
          />
          {brandMode === "custom" && <span className={styles.hint}>Custom</span>}
        </div>
      </section>

      {/* ── Primary Shade ───────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Primary Color</h3>
        <p className={styles.hint}>
          Choose which shade of the brand ramp is the primary interactive color.
          Only shades that read clearly with white text — neither too light nor
          too dark (near-black) — are shown.
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
        <FamilyPicker
          ariaLabel="Neutral family"
          options={NEUTRAL_OPTIONS}
          selectedName={neutralFamily}
          triggerSwatch={getCoreFamily(neutralFamily)[NEUTRAL_SWATCH_STEP]?.hex ?? "#000000"}
          triggerLabel={titleCase(neutralFamily)}
          onSelect={setNeutralFamily}
        />
      </section>
    </div>
  );
}
