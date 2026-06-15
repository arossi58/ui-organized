import {
  coreColors,
  BRAND_FAMILY_NAMES,
  CORE_STEPS,
  NEUTRAL_FAMILY_NAMES,
} from "@ui-organized/utils";
import "./core-colors.css";

/**
 * The full core palette — every authored family as a 24-step OKLCH ramp,
 * straight from `coreColors` in @ui-organized/utils. Grouped into neutrals and
 * brand/accent hues. Chrome is theme-agnostic (inherits the docs text colour);
 * swatch colours are the authored hexes, so they're correct regardless of the
 * docs theme.
 */

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const FAMILY_COUNT = NEUTRAL_FAMILY_NAMES.length + BRAND_FAMILY_NAMES.length;

function FamilyRamp({ family }: { family: string }) {
  const ramp = coreColors[family];
  if (!ramp) return null;
  return (
    <div className="core-colors__row">
      <div className="core-colors__name">{titleCase(family)}</div>
      <div className="core-colors__ramp">
        {CORE_STEPS.map((step) => {
          const swatch = ramp[step];
          return (
            <span
              key={step}
              className="core-colors__swatch"
              style={{ background: swatch?.hex }}
              title={`${titleCase(family)} ${step}\n${swatch?.hex}\n${swatch?.oklch}`}
            />
          );
        })}
      </div>
    </div>
  );
}

export function CoreColorTable() {
  return (
    <div className="core-colors">
      <p className="core-colors__lede">
        The core palette is deliberately large — {FAMILY_COUNT} families, each a{" "}
        {CORE_STEPS.length}-step ramp — so you can theme expressively without ever leaving the
        system. Every ramp is a hand-tuned <strong>OKLCH</strong> palette with even, perceptually
        spaced steps, so you get production-ready, accessible colour <em>out of the box</em>. There's
        no need to reverse-engineer how a ramp was built to make a new colour — just pick a family
        and a step. Hover any swatch for its hex and OKLCH value.
      </p>
      <p className="core-colors__axis">
        Each family runs <code>100</code> (lightest) → <code>2400</code> (darkest).
      </p>

      <section className="core-colors__group">
        <h3 className="core-colors__heading">Neutrals</h3>
        <p className="core-colors__blurb">
          Low-chroma tinted greys — they drive surfaces, borders, and text. Choosing one as your
          neutral subtly warms or cools the entire UI.
        </p>
        {NEUTRAL_FAMILY_NAMES.map((family) => (
          <FamilyRamp key={family} family={family} />
        ))}
      </section>

      <section className="core-colors__group">
        <h3 className="core-colors__heading">Brand &amp; accent hues</h3>
        <p className="core-colors__blurb">
          Saturated families — any can serve as the brand colour or an accent. The theme menu and the
          builder pick one of these as the brand, and the semantic tokens resolve <code>brand.*</code>{" "}
          against it.
        </p>
        {BRAND_FAMILY_NAMES.map((family) => (
          <FamilyRamp key={family} family={family} />
        ))}
      </section>
    </div>
  );
}
