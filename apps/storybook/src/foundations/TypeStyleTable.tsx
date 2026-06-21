import { TYPE_SCALE_STEP_NAMES } from "@ui-organized/utils";
import { typeSizeTokens, typeLeadingTokens } from "@ui-organized/tokens";
import "./type-styles.css";

/**
 * Every global type style — the 40 `.text-{weight}-{step}` utilities — rendered
 * as living documentation, grouped by weight like the Figma type-style panel.
 * Each row previews the style with "UI Organized" and shows its class name plus
 * the canonical size/line-height. The previews resolve `--type-*` tokens and the
 * metrics read the same `@ui-organized/tokens` source the CSS is generated from,
 * so this table stays 1:1 with the shipped design system (and the Theme Builder).
 */

// The four semantic weight roles the type styles expose. (Not WEIGHT_ROLES from
// utils, which is the 9-step primitive CSS-weight scale.)
const WEIGHTS = ["default", "emphasis", "strong", "heavy"] as const;

const PREVIEW = "UI Organized";

function TypeRow({ weight, step }: { weight: string; step: string }) {
  const cls = `text-${weight}-${step}`;
  const size = typeSizeTokens[step];
  const leading = typeLeadingTokens[step];
  return (
    <div className="type-styles__row">
      <span className={cls}>{PREVIEW}</span>
      <span className="type-styles__meta">
        <span className="type-styles__metrics" title="font-size / line-height">
          {size}<span className="type-styles__metricsDiv">/</span>{leading}px
        </span>
        <code className="type-styles__name">{cls}</code>
      </span>
    </div>
  );
}

export function TypeStyleTable() {
  return (
    // `sb-unstyled` opts the subtree out of Storybook's docs typography reset,
    // which otherwise forces every element to the docs base font-size and would
    // flatten the type scale (all previews rendering at ~16px).
    <div className="type-styles sb-unstyled">
      {WEIGHTS.map((weight) => (
        <section key={weight} className="type-styles__group">
          <h3 className="type-styles__heading text-strong-heading-small">{weight}</h3>
          {TYPE_SCALE_STEP_NAMES.map((step) => (
            <TypeRow key={`${weight}-${step}`} weight={weight} step={step} />
          ))}
        </section>
      ))}
    </div>
  );
}
