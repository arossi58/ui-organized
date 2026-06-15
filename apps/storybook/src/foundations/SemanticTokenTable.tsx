import { getCoreFamily, resolveSemanticColors, semanticColorMap } from "@ui-organized/utils";
import "./semantic-tokens.css";

/**
 * Live reference table for every semantic colour token, generated straight from
 * `semanticColorMap` in @ui-organized/utils — the single source of truth the shipped
 * library CSS, the builder, and the theme export all read from. So this page can
 * never drift from the real tokens.
 *
 * Swatch colours are resolved in JS (not via `var(--token)`) because a docs page
 * renders its MDX content outside the story theme decorator — there's no
 * `data-theme` ancestor, so the CSS cascade would fall back to one mode. We show
 * BOTH the light and dark resolution next to each assignment, always correct
 * regardless of the toolbar. The chrome inherits the docs text colour + neutral
 * rgba, so it stays legible on a light or dark docs background.
 */

const { light, dark } = semanticColorMap;

const CATEGORIES: Array<{ key: string; label: string; blurb: string }> = [
  { key: "surface", label: "Surface", blurb: "Backgrounds — from the app canvas to raised overlays and the modal scrim." },
  { key: "text", label: "Text", blurb: "Foreground text by emphasis, plus fixed and inverse variants." },
  { key: "border", label: "Border", blurb: "Dividers, container outlines, and form-control edges." },
  { key: "interactive", label: "Interactive", blurb: "Control fills and foregrounds across action emphases and states." },
  { key: "icon", label: "Icon", blurb: "Icon colours by emphasis, plus fixed light/dark variants." },
  { key: "status", label: "Status", blurb: "Feedback colours — each with a base tone, a tinted background, and an on-background content tone." },
];

/** Role of each semantic group (longest matching prefix of the token name). */
const GROUP_ROLES: Record<string, string> = {
  "surface-base": "App canvas — the furthest-back page background.",
  "surface-primary": "Primary panel / card surface.",
  "surface-secondary": "Secondary, inset surface.",
  "surface-overlay": "Raised overlay surfaces — menus, popovers, tooltips.",
  "surface-curtain": "Scrim behind modals and drawers.",

  "text-text-primary": "Primary body and heading text.",
  "text-text-secondary": "Secondary, lower-emphasis text.",
  "text-text-tertiary": "Tertiary / muted text and captions.",
  "text-text-placeholder": "Input placeholder text.",
  "text-text-inverse": "Text on inverted / brand-filled surfaces.",
  "text-text-dark": "Always-dark text, regardless of theme.",
  "text-text-light": "Always-light text, regardless of theme.",

  "border-primary": "Default container and divider outline.",
  "border-secondary": "Subtler hairline borders.",
  "border-data-entry": "Outlines for inputs and form controls.",

  "interactive-primary": "Primary action — brand-filled buttons and key CTAs.",
  "interactive-secondary": "Secondary action — neutral / outline buttons.",
  "interactive-tertiary": "Tertiary action — low-emphasis, link-like buttons.",
  "interactive-ghost": "Ghost action — transparent until hovered or pressed.",
  "interactive-destructive": "Destructive action — delete and irreversible operations.",
  "interactive-contents": "Foreground (label + icon) on a filled brand control.",
  "interactive-ui": "Generic UI-control fills — toggles, checkboxes, small chrome.",
  "interactive-focus": "Focus-ring colour.",
  "interactive-inactive": "Disabled / inactive control fills (01 strongest → 03 faintest).",

  "icon-icon-primary": "Primary-emphasis icons.",
  "icon-icon-secondary": "Secondary-emphasis icons.",
  "icon-icon-tertiary": "Tertiary / muted icons.",
  "icon-icon-light": "Always-light icons.",
  "icon-icon-dark": "Always-dark icons.",

  "status-success": "Success / positive status.",
  "status-info-secondary": "Secondary informational status.",
  "status-info": "Informational status.",
  "status-caution": "Caution status.",
  "status-warning": "Warning status.",
  "status-error": "Error / danger status.",
};

/** Refinement appended for a recognised state / variant suffix. */
const STATE: Record<string, string> = {
  hover: "Hover state.",
  active: "Active / pressed state.",
  selected: "Selected state.",
  bg: "Tinted background fill.",
  content: "Text / icon shown on the status background.",
  message: "Inline message text.",
};

function categoryOf(token: string): string {
  return token.replace("--color-", "").split("-")[0]!;
}

function roleFor(token: string): string {
  const name = token.replace("--color-", "");
  let base = "";
  for (const key of Object.keys(GROUP_ROLES)) {
    if ((name === key || name.startsWith(`${key}-`)) && key.length > base.length) base = key;
  }
  const role = GROUP_ROLES[base] ?? "";
  const suffix = base ? name.slice(base.length).replace(/^-/, "") : name;
  const extra = STATE[suffix];
  return extra ? `${role} ${extra}` : role;
}

/** The brand chosen on the site (shared via localStorage), default `mars`. */
function activeBrand(): string {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem("ui-org-site-theme") : null;
    if (raw) {
      const parsed = JSON.parse(raw) as { brand?: unknown };
      if (typeof parsed.brand === "string") return parsed.brand;
    }
  } catch {
    /* storage unavailable — fall through to default */
  }
  return "mars";
}

function Swatch({ color }: { color?: string }) {
  // Checkerboard behind a translucent fill (e.g. the curtain scrim) reads true.
  return (
    <span className="sem-tokens__chip">
      <span className="sem-tokens__fill" style={{ background: color }} />
    </span>
  );
}

export function SemanticTokenTable() {
  const opts = { brandRamp: getCoreFamily(activeBrand()), neutralRamp: getCoreFamily("grey") };
  const lightVars = resolveSemanticColors("light", opts);
  const darkVars = resolveSemanticColors("dark", opts);

  const byCategory = new Map<string, string[]>();
  for (const token of Object.keys(light)) {
    const cat = categoryOf(token);
    (byCategory.get(cat) ?? byCategory.set(cat, []).get(cat)!).push(token);
  }

  return (
    <div className="sem-tokens">
      <p className="sem-tokens__lede">
        Semantic tokens are the colour vocabulary every component speaks. A component never names a
        raw colour — it references a <strong>role</strong> (<code>--color-surface-primary</code>,{" "}
        <code>--color-text-text-secondary</code>), and the active theme decides what that role
        resolves to.
      </p>
      <p className="sem-tokens__blurb sem-tokens__blurb--wide">
        Each token points at a primitive reference — a <code>family.step</code> pair — not a fixed
        hex: <code>brand.*</code> resolves to the selected brand family, <code>grey.*</code> to the
        selected neutral family, any other family to its fixed core ramp, and raw values pass through
        unchanged. Light and dark each carry their own assignment (both shown below). This map lives
        in <code>semanticColorMap</code> (@ui-organized/utils) — the single source of truth this table is
        generated from, so it can't drift. Consume a token with{" "}
        <code>var(--color-…)</code>; never a primitive directly.
      </p>

      {CATEGORIES.filter((c) => byCategory.has(c.key)).map((cat) => (
        <section className="sem-tokens__group" key={cat.key}>
          <h3 className="sem-tokens__heading">{cat.label}</h3>
          <p className="sem-tokens__blurb">{cat.blurb}</p>
          <table className="sem-tokens__table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Light</th>
                <th>Dark</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {byCategory.get(cat.key)!.map((token) => (
                <tr key={token}>
                  <td>
                    <code>{token}</code>
                  </td>
                  <td>
                    <div className="sem-tokens__cell">
                      <Swatch color={lightVars[token]} />
                      <code>{light[token]}</code>
                    </div>
                  </td>
                  <td>
                    <div className="sem-tokens__cell">
                      <Swatch color={darkVars[token]} />
                      <code>{dark[token]}</code>
                    </div>
                  </td>
                  <td className="sem-tokens__role">{roleFor(token)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
