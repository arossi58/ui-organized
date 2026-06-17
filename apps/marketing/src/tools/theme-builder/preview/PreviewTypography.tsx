import type { CSSProperties } from "react";
import { useBuilderStore } from "../state/themeState";
import styles from "./PreviewTypography.module.css";

// CSS custom properties aren't in React.CSSProperties — cast inline style objects with this.
type LooseStyle = CSSProperties & Record<string, string>;

// Scale steps grouped by role
const HEADING_STEPS = ["display-xlarge", "display-large", "display-medium", "heading-large", "heading-medium", "heading-small"] as const;
const BODY_STEPS    = ["body-large", "body-medium", "body-small", "caption"] as const;

// A short sample per step so the four weight columns stay readable side by side.
const SAMPLE: Record<string, string> = {
  "display-xlarge": "Ag",
  "display-large":  "Ag",
  "display-medium": "Ag",
  "heading-large":  "Almost",
  "heading-medium": "Almost",
  "heading-small":  "Almost",
  "body-large":     "The quick brown fox",
  "body-medium":    "The quick brown fox",
  "body-small":     "The quick brown fox",
  "caption":        "The quick brown fox",
};

// Weight roles, in column order, mapped to the themed weight custom properties.
const WEIGHTS = [
  { key: "default",  label: "Default" },
  { key: "emphasis", label: "Emphasis" },
  { key: "strong",   label: "Strong" },
  { key: "heavy",    label: "Heavy" },
] as const;

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

function WeightGrid({
  steps,
  fontVar,
  weightVars,
  weights,
  sizes,
  guides,
}: {
  steps: readonly string[];
  fontVar: string;
  weightVars: Record<string, string>;
  weights: Record<string, number>;
  sizes: Record<string, number>;
  guides: boolean;
}) {
  return (
    <div className={styles.grid}>
      <div className={styles.headRow}>
        <div className={styles.metaHead} />
        {WEIGHTS.map((w) => (
          <div key={w.key} className={styles.colHead}>
            <span className={styles.colHeadLabel}>{w.label}</span>
            <span className={styles.colHeadWeight}>{weights[w.key]}</span>
          </div>
        ))}
      </div>

      {steps.map((step) => (
        <div key={step} className={styles.row}>
          <div className={styles.meta}>
            <span className={styles.stepName}>{step}</span>
            <span className={styles.stepSize}>{sizes[step] ?? 0}px</span>
          </div>
          {WEIGHTS.map((w) => (
            <span
              key={w.key}
              className={`${styles.cell} ${guides ? styles.cellGuide : ""}`}
              style={{
                fontSize: `var(--type-size-${step})`,
                lineHeight: `var(--type-leading-${step})`,
                fontFamily: fontVar,
                fontWeight: weightVars[w.key],
              } as LooseStyle}
            >
              {SAMPLE[step]}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function PreviewTypography() {
  const { headingWeights, bodyWeights, typeScaleSteps, lineHeightGuides } = useBuilderStore();

  return (
    <div className={styles.root}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Headings</h2>
        <WeightGrid
          steps={HEADING_STEPS}
          fontVar="var(--type-font-heading)"
          weightVars={HEADING_WEIGHT_VARS}
          weights={headingWeights}
          sizes={typeScaleSteps}
          guides={lineHeightGuides}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Body &amp; Caption</h2>
        <WeightGrid
          steps={BODY_STEPS}
          fontVar="var(--type-font-body)"
          weightVars={BODY_WEIGHT_VARS}
          weights={bodyWeights}
          sizes={typeScaleSteps}
          guides={lineHeightGuides}
        />
      </section>
    </div>
  );
}
