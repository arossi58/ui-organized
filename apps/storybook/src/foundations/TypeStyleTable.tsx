import { TYPE_SCALE_STEP_NAMES } from "@ui-organized/utils";
import "./type-styles.css";

/**
 * Every global type style — the 40 `.text-{weight}-{step}` utilities — rendered
 * as living documentation, grouped by weight like the Figma type-style panel.
 * Each row previews the style with "UI Organized" and shows its class name.
 * The classes resolve `--type-*` tokens, so the previews track the active theme.
 */

// The four semantic weight roles the type styles expose. (Not WEIGHT_ROLES from
// utils, which is the 9-step primitive CSS-weight scale.)
const WEIGHTS = ["default", "emphasis", "strong", "heavy"] as const;

const PREVIEW = "UI Organized";

function TypeRow({ weight, step }: { weight: string; step: string }) {
  const cls = `text-${weight}-${step}`;
  return (
    <div className="type-styles__row">
      <span className={cls}>{PREVIEW}</span>
      <code className="type-styles__name">{cls}</code>
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
