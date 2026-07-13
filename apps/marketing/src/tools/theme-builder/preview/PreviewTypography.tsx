import { useState, type CSSProperties } from "react";
import { SegmentedControl } from "@ui-organized/react";
import { useBuilderStore, DEFAULT_HEADING_PREVIEW, DEFAULT_BODY_PREVIEW } from "../state/themeState";
import { PreviewTypeSpecimens } from "./PreviewTypeSpecimens";
import styles from "./PreviewTypography.module.css";

// CSS custom properties aren't in React.CSSProperties — cast inline style objects with this.
type LooseStyle = CSSProperties & Record<string, string>;

// Scale steps grouped by role
const HEADING_STEPS = ["display-xlarge", "display-large", "display-medium", "heading-large", "heading-medium", "heading-small"] as const;
const BODY_STEPS    = ["body-large", "body-medium", "body-small", "caption"] as const;

// Weight roles, in column order, mapped to the themed weight custom properties.
const WEIGHTS = [
  { key: "default",  label: "Default" },
  { key: "emphasis", label: "Emphasis" },
  { key: "strong",   label: "Strong" },
  { key: "heavy",    label: "Heavy" },
] as const;

const HEADING_WEIGHT_VARS: Record<string, string> = {
  default:  "var(--type-weight-heading-default)",
  emphasis: "var(--type-weight-heading-emphasis)",
  strong:   "var(--type-weight-heading-strong)",
  heavy:    "var(--type-weight-heading-heavy)",
};

const BODY_WEIGHT_VARS: Record<string, string> = {
  default:  "var(--type-weight-body-default)",
  emphasis: "var(--type-weight-body-emphasis)",
  strong:   "var(--type-weight-body-strong)",
  heavy:    "var(--type-weight-body-heavy)",
};

// Body text below this size is hard to read; flag it in the preview.
const MIN_READABLE_SIZE = 10;

function WeightGrid({
  steps,
  fontVar,
  weightVars,
  weights,
  sizes,
  leadings,
  guides,
  sample,
  flagSmallSizes = false,
}: {
  steps: readonly string[];
  fontVar: string;
  weightVars: Record<string, string>;
  weights: Record<string, number>;
  sizes: Record<string, number>;
  leadings: Record<string, number>;
  guides: boolean;
  sample: string;
  flagSmallSizes?: boolean;
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

      {steps.map((step) => {
        const tooSmall = flagSmallSizes && (sizes[step] ?? 0) < MIN_READABLE_SIZE;
        return (
        <div key={step} className={styles.row}>
          <div className={styles.meta}>
            <span className={styles.stepName}>{step}</span>
            <span className={styles.stepSize}>{sizes[step] ?? 0}px</span>
            <span className={styles.stepLeading}>
              {(() => {
                const size = sizes[step] ?? 0;
                const leading = leadings[step] ?? 0;
                const ratio = size ? +(leading / size).toFixed(2) : 0;
                return `${ratio}× · ${leading}px`;
              })()}
            </span>
            {tooSmall && (
              <span className={styles.sizeCaution} role="note">
                <svg width="11" height="11" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path
                    fill="currentColor"
                    d="M8 1.2 15.2 14a.9.9 0 0 1-.78 1.35H1.58A.9.9 0 0 1 .8 14L8 1.2Zm0 3.9a.85.85 0 0 0-.85.9l.2 3.5a.65.65 0 0 0 1.3 0l.2-3.5A.85.85 0 0 0 8 5.1Zm0 6.05a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z"
                  />
                </svg>
                Below 10px — too small for body text
              </span>
            )}
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
              {sample}
            </span>
          ))}
        </div>
        );
      })}
    </div>
  );
}

const TAB_ITEMS = [
  { value: "specs", label: "Specs" },
  { value: "examples", label: "Examples" },
];

type TypeTab = "specs" | "examples";

export function PreviewTypography() {
  const {
    headingWeights,
    bodyWeights,
    typeScaleSteps,
    leadingSteps,
    lineHeightGuides,
    headingPreviewText,
    bodyPreviewText,
  } = useBuilderStore();
  const [tab, setTab] = useState<TypeTab>("specs");

  return (
    <div className={styles.root}>
      <SegmentedControl
        className={styles.tabs}
        aria-label="Typography view"
        items={TAB_ITEMS}
        value={tab}
        onValueChange={(v) => setTab(v as TypeTab)}
      />

      {tab === "examples" ? (
        <PreviewTypeSpecimens />
      ) : (
        <>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Headings</h2>
        <WeightGrid
          steps={HEADING_STEPS}
          fontVar="var(--type-font-heading)"
          weightVars={HEADING_WEIGHT_VARS}
          weights={headingWeights}
          sizes={typeScaleSteps}
          leadings={leadingSteps}
          guides={lineHeightGuides}
          sample={headingPreviewText || DEFAULT_HEADING_PREVIEW}
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
          leadings={leadingSteps}
          guides={lineHeightGuides}
          sample={bodyPreviewText || DEFAULT_BODY_PREVIEW}
          flagSmallSizes
        />
      </section>
        </>
      )}
    </div>
  );
}
