import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Button, Input } from "@ui-organized/react";
import { useBuilderStore } from "../state/themeState";
import {
  BRAND_FAMILY_NAMES,
  NEUTRAL_FAMILY_NAMES,
  getCoreFamily,
  type ColorRamp,
} from "@ui-organized/utils";
import {
  PRIMARY_TEXT_HEX,
  wcagContrast,
  contrastLevel,
  getAccessibleShades,
} from "../utils/accessibleShades";
import styles from "./ColorPanel.module.css";

// ─── Constants ────────────────────────────────────────────────────────────────

// Ramp step used as the swatch preview in the family pickers.
const BRAND_SWATCH_STEP = "1400";
const NEUTRAL_SWATCH_STEP = "1000";

// Neutral-palette picker is hidden for launch — users get the default grey
// neutral only. The selector needs more work before release; flip this to
// re-enable choosing a tinted-grey family. (Keep the section code intact.)
const SHOW_NEUTRAL_PALETTE = false;

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
  ramp: ColorRamp;
  selectedShade: string;
  onSelect: (shade: string) => void;
}) {
  // Offer only shades that clear 4.5:1 against white button text (not too light)
  // and stay under the near-black cap (not too dark). Same rule the store uses to
  // auto-select an accessible shade when the brand changes.
  const validSteps = getAccessibleShades(ramp);

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
    loadFromThemeJson,
  } = useBuilderStore();

  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [importError, setImportError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleHexInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) {
      setBrandColor(val);
    }
  }

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const theme = JSON.parse(await file.text());
      loadFromThemeJson(theme);
      setImportStatus("success");
      setImportError("");
      setTimeout(() => setImportStatus("idle"), 3000);
    } catch (err) {
      setImportStatus("error");
      setImportError(err instanceof Error ? err.message : String(err));
    } finally {
      e.target.value = ""; // allow re-selecting the same file
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

      {/* ── Neutral Family — hidden for launch (grey-only); flip
           SHOW_NEUTRAL_PALETTE to re-enable. Needs more work first. ── */}
      {SHOW_NEUTRAL_PALETTE && (
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
      )}

      {/* ── Import Theme ────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Import Theme</h3>
        <p className={styles.hint}>
          Load a <code>theme.json</code> back into the builder — a previous export, or one
          round-tripped from Figma via the <strong>UI Organized - Theme Import</strong> plugin.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={handleImport}
        />
        <div>
          <Button intent="secondary" size="sm" onClick={() => fileRef.current?.click()}>
            Load theme.json…
          </Button>
        </div>
        {importStatus === "success" && (
          <p className={styles.importSuccess}>✓ Theme loaded into the builder.</p>
        )}
        {importStatus === "error" && (
          <p className={styles.importError}>
            <strong>Couldn't load:</strong> {importError}
          </p>
        )}
      </section>
    </div>
  );
}
