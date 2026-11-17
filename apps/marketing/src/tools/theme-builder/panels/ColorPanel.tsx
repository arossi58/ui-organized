import { useId, useRef, useState, type CSSProperties, type ChangeEvent } from "react";
import { Button, Card, ColorPicker, Range, Select, Tag } from "@ui-organized/react";
import { useBuilderStore } from "../state/themeState";
import {
  BRAND_FAMILY_NAMES,
  NEUTRAL_FAMILY_NAMES,
  getCoreFamily,
  getNeutralRamp,
  MAX_NEUTRAL_TINT,
  MIN_NEUTRAL_TINT,
  type ColorRamp,
} from "@ui-organized/utils";
import { contrastLevel, getAccessibleShades, primaryLabelFor } from "../utils/accessibleShades";
import { describeReplaced, type ReplacedValue } from "../utils/themeDiff";
import styles from "./ColorPanel.module.css";

/** The ramp generator takes 3- or 6-digit hex; anything else is mid-edit. */
const isHex = (v: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

// ─── Constants ────────────────────────────────────────────────────────────────

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Ramp step used as the swatch preview in the family selects.
const BRAND_SWATCH_STEP = "1400";
const NEUTRAL_SWATCH_STEP = "1000";

/** Shown, disabled, while the color comes from the custom picker rather than a family. */
const CUSTOM = "custom";

interface FamilyOption {
  value: string;
  label: string;
  hex?: string;
  disabled?: boolean;
}

function familyOptions(
  names: readonly string[],
  hexFor: (name: string) => string | undefined,
): FamilyOption[] {
  return [
    ...names.map((name) => ({ value: name, label: titleCase(name), hex: hexFor(name) })),
    { value: CUSTOM, label: "Custom color", disabled: true },
  ];
}

const BRAND_OPTIONS = familyOptions(
  BRAND_FAMILY_NAMES,
  (name) => getCoreFamily(name)[BRAND_SWATCH_STEP]?.hex,
);
// Neutral swatches preview the *derived* ramp, not the authored family, so the
// list shows what picking that family will actually produce.
const NEUTRAL_OPTIONS = familyOptions(
  NEUTRAL_FAMILY_NAMES,
  (name) => getNeutralRamp(name)[NEUTRAL_SWATCH_STEP]?.hex,
);

// ─── Family select (DS Select plus swatches) ──────────────────────────────────

/**
 * The DS Select renders text-only options, so the swatches are painted on from
 * here: the popup is portalled into a host this component owns, and a rule per
 * option keys a swatch off the `data-value` Ark puts on each item. The trigger's
 * swatch reads a custom property set on the wrapper.
 */
function FamilySelect({
  label,
  options,
  value,
  swatch,
  onValueChange,
}: {
  label: string;
  options: FamilyOption[];
  value: string;
  swatch: string;
  onValueChange: (value: string) => void;
}) {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const hostClass = `family-select-${useId().replace(/:/g, "")}`;
  const rules = options
    .filter((o) => o.hex)
    .map((o) => `.${hostClass} [data-part="item"][data-value="${o.value}"] { --swatch: ${o.hex}; }`)
    .join("\n");

  return (
    <div className={styles.familySelect} style={{ "--swatch": swatch } as CSSProperties}>
      <style>{rules}</style>
      <Select
        size="sm"
        label={label}
        options={options}
        value={value}
        onValueChange={onValueChange}
        portalContainer={host}
      />
      <div ref={setHost} className={`${styles.familySelectHost} ${hostClass}`} />
    </div>
  );
}

// The ramp steps the surface tokens actually resolve to, in the order base,
// secondary, primary (lightest last in both modes).
const SURFACE_STEPS = {
  light: ["400", "300", "100"],
  dark: ["2400", "2300", "2200"],
} as const;

// ─── Primary shade selector (only accessible shades) ──────────────────────────

function PrimaryShadeSelector({
  ramp,
  neutralRamp,
  selectedShade,
  onSelect,
}: {
  ramp: ColorRamp;
  neutralRamp: ColorRamp;
  selectedShade: string;
  onSelect: (shade: string) => void;
}) {
  // Offer only shades whose button label — near-white or near-black, whichever
  // the resolver picks — clears 4.5:1, without the fill turning near-black or
  // near-white. Same rule the store uses to auto-select a shade on brand change.
  const validSteps = getAccessibleShades(ramp, neutralRamp);

  const selectedHex = ramp[selectedShade]?.hex ?? "#000000";
  const label = primaryLabelFor(selectedHex, neutralRamp);
  const contrastRatio = label.ratio;
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
              title={`${s} · ${primaryLabelFor(hex, neutralRamp).ratio.toFixed(1)}:1`}
            >
              {isSelected && <span className={styles.shadeCellCheck}>✓</span>}
            </button>
          );
        })}
      </div>

      {/* ── Contrast readout ── */}
      <Card padding="sm">
        <div className={styles.contrastReadout}>
          <div className={styles.contrastSwatch} style={{ backgroundColor: selectedHex }}>
            <span className={styles.contrastSwatchLabel} style={{ color: label.hex }}>
              Aa
            </span>
          </div>
          <div className={styles.contrastInfo}>
            <span className={styles.contrastRatio}>{contrastRatio.toFixed(2)}:1</span>
            <span className={styles.contrastLabel}>
              {passes ? `WCAG ${level}` : "Fails WCAG AA (4.5:1 min)"}
            </span>
          </div>
          {/* Subdued, not emphasized: the emphasized status fills are a known AA gap. */}
          <Tag
            variant={passes ? "success" : "error"}
            emphasized={false}
            size="sm"
            className={styles.contrastBadge}
          >
            {level === "fail" ? "Fail" : level}
          </Tag>
        </div>
      </Card>
    </div>
  );
}

// ─── Surface preview ──────────────────────────────────────────────────────────

/**
 * Shows the neutral ramp at the steps the surface tokens actually use, for both
 * modes. A single mid-ramp swatch says little about what a page will look like;
 * these are the page background, the card, and the raised surface.
 */
function SurfacePreview({ ramp }: { ramp: ColorRamp }) {
  return (
    <div className={styles.surfacePreview}>
      {(["light", "dark"] as const).map((mode) => (
        <div key={mode} className={styles.surfaceRow}>
          <span className={styles.surfaceRowLabel}>{titleCase(mode)}</span>
          <div className={styles.surfaceSwatches}>
            {SURFACE_STEPS[mode].map((step) => {
              const hex = ramp[step]?.hex ?? "#000000";
              return (
                <div
                  key={step}
                  className={styles.surfaceSwatch}
                  style={{
                    backgroundColor: hex,
                    color: mode === "light" ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.75)",
                  }}
                  title={`${step} · ${hex}`}
                >
                  {hex}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * What a load replaced. The builder keeps its inputs and re-derives every color,
 * spacing step, radius and component size, so a variable edited in Figma comes
 * back as the derived value. Saying so, with the list, beats a "✓ loaded" that
 * lets someone find out a week later. An export from an older builder lands here
 * too, legitimately: the derivation has moved on since it was written.
 */
function ReplacedNotice({ changes }: { changes: ReplacedValue[] }) {
  return (
    <div className={styles.importNotice}>
      <p>
        <strong>Loaded.</strong> {describeReplaced(changes)} in this file differ from what the
        builder derives from its settings, so the builder's values replaced them. Make those
        changes here, or keep this file as your source.
      </p>
      <details>
        <summary>Show what was replaced</summary>
        <ul className={styles.importNoticeList}>
          {changes.map((c) => (
            <li key={c.path}>
              <code>{c.path}</code>: {c.file} → {c.builder ?? "not kept"}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function ColorPanel() {
  const {
    brandMode,
    brandFamily,
    brandHex,
    brandRamp,
    brandShade,
    neutralMode,
    neutralFamily,
    neutralHex,
    neutralTint,
    neutralRamp,
    setBrandFamily,
    setBrandColor,
    setBrandShade,
    setNeutralFamily,
    setNeutralColor,
    setNeutralTint,
    loadFromThemeJson,
  } = useBuilderStore();

  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [importError, setImportError] = useState("");
  const [replaced, setReplaced] = useState<ReplacedValue[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout>>();

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    clearTimeout(clearTimer.current);
    try {
      const theme = JSON.parse(await file.text());
      const changes = loadFromThemeJson(theme);
      setReplaced(changes);
      setImportStatus("success");
      setImportError("");
      // A clean load is a confirmation and can fade. A list of replaced values
      // is something to read, so it stays until the next import.
      if (changes.length === 0) {
        clearTimer.current = setTimeout(() => setImportStatus("idle"), 3000);
      }
    } catch (err) {
      setImportStatus("error");
      setImportError(err instanceof Error ? err.message : String(err));
    } finally {
      e.target.value = ""; // allow re-selecting the same file
    }
  }

  // `grey` is the "no tint" choice; everything else carries a hue.
  const isTinted = neutralMode === "custom" || neutralFamily !== "grey";

  return (
    <div className={styles.panel}>
      {/* ── Brand Color ─────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Brand color</h3>
        <FamilySelect
          label="Brand family"
          options={BRAND_OPTIONS}
          value={brandMode === "custom" ? CUSTOM : brandFamily}
          swatch={brandMode === "custom" ? brandHex : (brandRamp[brandShade]?.hex ?? brandHex)}
          onValueChange={setBrandFamily}
        />

        <ColorPicker
          size="sm"
          label="Or use a custom color"
          format="hex"
          value={brandHex}
          onValueChange={(v) => isHex(v) && setBrandColor(v)}
        />
      </section>

      {/* ── Primary Shade ───────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Accessible Shades</h3>
        <PrimaryShadeSelector
          ramp={brandRamp}
          neutralRamp={neutralRamp}
          selectedShade={brandShade}
          onSelect={setBrandShade}
        />
      </section>

      {/* ── Neutral & Surface Tint ──────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Neutral &amp; surface tint</h3>
        <FamilySelect
          label="Neutral family"
          options={NEUTRAL_OPTIONS}
          value={neutralMode === "custom" ? CUSTOM : neutralFamily}
          swatch={neutralRamp[NEUTRAL_SWATCH_STEP]?.hex ?? neutralHex}
          onValueChange={setNeutralFamily}
        />

        <ColorPicker
          size="sm"
          label="Or use a custom color"
          format="hex"
          value={neutralHex}
          onValueChange={(v) => isHex(v) && setNeutralColor(v)}
        />

        {/* Grey is achromatic, so strength has nothing to act on and the surfaces
            are just the stock ramp — both controls would be inert. */}
        {isTinted && (
          <>
            <Range
              label="Tint strength"
              size="sm"
              value={neutralTint}
              min={MIN_NEUTRAL_TINT}
              max={MAX_NEUTRAL_TINT}
              step={0.001}
              formatValue={(v) => `${Math.round((v / MAX_NEUTRAL_TINT) * 100)}%`}
              onValueChange={setNeutralTint}
            />

            <SurfacePreview ramp={neutralRamp} />
          </>
        )}
      </section>

      {/* ── Import Theme ────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Import theme</h3>
        <p className={styles.hint}>
          Load a <code>theme.json</code> back into the builder: a previous export, or one
          round-tripped from Figma via the <strong>UI Organized - Theme Import</strong> plugin.
          The builder restores its settings and derives the rest from them, so edits to
          individual variables don't carry back.
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
        {/* Always mounted, so the outcome is announced when it changes. */}
        <div role="status">
          {importStatus === "success" &&
            (replaced.length === 0 ? (
              <p className={styles.importSuccess}>✓ Theme loaded into the builder.</p>
            ) : (
              <ReplacedNotice changes={replaced} />
            ))}
          {importStatus === "error" && (
            <p className={styles.importError}>
              <strong>Couldn't load:</strong> {importError}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
