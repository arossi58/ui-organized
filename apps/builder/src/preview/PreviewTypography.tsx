import type { CSSProperties } from "react";
import { useBuilderStore } from "../state/themeState";
import styles from "./PreviewTypography.module.css";

// CSS custom properties aren't in React.CSSProperties — cast inline style objects with this.
type LooseStyle = CSSProperties & Record<string, string>;

// Scale steps in display order, grouped by role
const DISPLAY_STEPS  = ["display-xlarge", "display-large", "display-medium"] as const;
const HEADING_STEPS  = ["heading-large",  "heading-medium", "heading-small"]  as const;
const BODY_STEPS     = ["body-large",     "body-medium",    "body-small", "caption"] as const;

// Sample text scaled to feel natural at each size
const SAMPLE: Record<string, string> = {
  "display-xlarge": "Display XL",
  "display-large":  "Display Large",
  "display-medium": "Display Medium",
  "heading-large":  "Heading Large",
  "heading-medium": "Heading Medium",
  "heading-small":  "Heading Small",
  "body-large":     "The quick brown fox jumps over the lazy dog.",
  "body-medium":    "The quick brown fox jumps over the lazy dog.",
  "body-small":     "The quick brown fox jumps over the lazy dog.",
  "caption":        "Caption — supplementary label text used for metadata and timestamps.",
};

const WEIGHT_LABELS: Record<string, string> = {
  default:  "Regular",
  emphasis: "Medium",
  strong:   "Semibold",
  heavy:    "Bold",
};

// Maps store weight key → CSS var suffix
const HEADING_WEIGHT_VARS: Record<string, string> = {
  default:  "var(--type-weight-heading-regular)",
  emphasis: "var(--type-weight-heading-medium)",
  strong:   "var(--type-weight-heading-semibold)",
  heavy:    "var(--type-weight-heading-bold)",
};

const BODY_WEIGHT_VARS: Record<string, string> = {
  default:  "var(--type-weight-body-regular)",
  emphasis: "var(--type-weight-body-medium)",
  strong:   "var(--type-weight-body-semibold)",
  heavy:    "var(--type-weight-body-bold)",
};

export function PreviewTypography() {
  const { headingFamily, bodyFamily, headingWeights, bodyWeights, typeScaleSteps } = useBuilderStore();

  return (
    <div className={styles.root}>

      {/* ── Display ───────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Display</h2>
        <div className={styles.scaleList}>
          {DISPLAY_STEPS.map((step) => (
            <div key={step} className={styles.scaleRow}>
              <div className={styles.rowMeta}>
                <span className={styles.stepName}>{step}</span>
                <span className={styles.stepSize}>{typeScaleSteps[step] ?? "—"}px</span>
              </div>
              <span
                className={styles.sample}
                style={{
                  fontSize: `var(--type-size-${step})`,
                  fontFamily: "var(--type-font-heading)",
                  fontWeight: "var(--type-weight-heading-semibold)",
                } as LooseStyle}
              >
                {SAMPLE[step]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Headings ──────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Headings</h2>
        <div className={styles.scaleList}>
          {HEADING_STEPS.map((step) => (
            <div key={step} className={styles.scaleRow}>
              <div className={styles.rowMeta}>
                <span className={styles.stepName}>{step}</span>
                <span className={styles.stepSize}>{typeScaleSteps[step] ?? "—"}px</span>
              </div>
              <span
                className={styles.sample}
                style={{
                  fontSize: `var(--type-size-${step})`,
                  fontFamily: "var(--type-font-heading)",
                  fontWeight: "var(--type-weight-heading-semibold)",
                } as LooseStyle}
              >
                {SAMPLE[step]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Body & Caption ────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Body &amp; Caption</h2>
        <div className={styles.scaleList}>
          {BODY_STEPS.map((step) => (
            <div key={step} className={styles.scaleRow}>
              <div className={styles.rowMeta}>
                <span className={styles.stepName}>{step}</span>
                <span className={styles.stepSize}>{typeScaleSteps[step] ?? "—"}px</span>
              </div>
              <span
                className={styles.sample}
                style={{
                  fontSize: `var(--type-size-${step})`,
                  fontFamily: "var(--type-font-body)",
                  fontWeight: "var(--type-weight-body-regular)",
                } as LooseStyle}
              >
                {SAMPLE[step]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Heading weights ───────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Heading weights
          <span className={styles.familyName}>{headingFamily}</span>
        </h2>
        <div className={styles.weightList}>
          {Object.keys(headingWeights).map((key) => (
            <div key={key} className={styles.weightRow}>
              <div className={styles.rowMeta}>
                <span className={styles.weightLabel}>{WEIGHT_LABELS[key] ?? key}</span>
                <span className={styles.weightValue}>{headingWeights[key]}</span>
              </div>
              <span
                className={styles.weightSample}
                style={{
                  fontFamily: "var(--type-font-heading)",
                  fontWeight: HEADING_WEIGHT_VARS[key],
                } as LooseStyle}
              >
                Almost before we knew it, we had left the ground.
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Body weights ──────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Body weights
          <span className={styles.familyName}>{bodyFamily}</span>
        </h2>
        <div className={styles.weightList}>
          {Object.keys(bodyWeights).map((key) => (
            <div key={key} className={styles.weightRow}>
              <div className={styles.rowMeta}>
                <span className={styles.weightLabel}>{WEIGHT_LABELS[key] ?? key}</span>
                <span className={styles.weightValue}>{bodyWeights[key]}</span>
              </div>
              <span
                className={styles.weightSample}
                style={{
                  fontFamily: "var(--type-font-body)",
                  fontWeight: BODY_WEIGHT_VARS[key],
                } as LooseStyle}
              >
                Almost before we knew it, we had left the ground.
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
