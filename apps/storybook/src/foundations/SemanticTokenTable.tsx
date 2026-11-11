import { getCoreFamily, resolveSemanticColors, semanticColorMap } from "@ui-organized/utils";
import "./semantic-tokens.css";

/**
 * Live reference table for every semantic color token, generated straight from
 * `semanticColorMap` in @ui-organized/utils — the single source of truth the shipped
 * library CSS, the builder, and the theme export all read from. So this page can
 * never drift from the real tokens.
 *
 * Swatch colors are resolved in JS (not via `var(--token)`) because a docs page
 * renders its MDX content outside the story theme decorator — there's no
 * `data-theme` ancestor, so the CSS cascade would fall back to one mode. We show
 * BOTH the light and dark resolution next to each assignment, always correct
 * regardless of the toolbar. The chrome inherits the docs text color + neutral
 * rgba, so it stays legible on a light or dark docs background.
 */

const { light, dark } = semanticColorMap;

const CATEGORIES: Array<{ key: string; label: string; blurb: string }> = [
  {
    key: "surface",
    label: "Surface",
    blurb: "Backgrounds — from the app canvas to raised overlays and the modal scrim.",
  },
  {
    key: "content",
    label: "Content",
    blurb:
      "Foreground text and icons by emphasis, plus placeholder, inverse, and fixed light/dark variants.",
  },
  {
    key: "border",
    label: "Border",
    blurb: "Dividers, container outlines, and form-control edges.",
  },
  {
    key: "interactive",
    label: "Interactive",
    blurb: "Control fills and foregrounds across action emphases and states.",
  },
  {
    key: "status",
    label: "Status",
    blurb:
      "Feedback colors — each with a base tone, a tinted background, and an on-background content tone.",
  },
];

/** Role of each semantic group (longest matching prefix of the token name). */
const GROUP_ROLES: Record<string, string> = {
  "surface-base": "App canvas — the furthest-back page background.",
  "surface-primary": "Primary panel / card surface.",
  "surface-secondary": "Secondary, inset surface.",
  "surface-overlay": "Raised overlay surfaces — menus, popovers, tooltips.",
  "surface-curtain": "Scrim behind modals and drawers.",

  "content-primary": "Primary body, heading, and icon foreground.",
  "content-secondary": "Secondary, lower-emphasis text and icons.",
  "content-tertiary": "Tertiary / muted text and icons.",
  "content-placeholder": "Input placeholder text.",
  "content-inverse": "Content on inverted / brand-filled surfaces.",
  "content-dark": "Always-dark content, regardless of theme.",
  "content-light": "Always-light content, regardless of theme.",

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
  "interactive-focus": "Focus-ring color.",
  "interactive-inactive": "Disabled / inactive control fills (01 strongest → 03 faintest).",

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
    const raw =
      typeof localStorage !== "undefined" ? localStorage.getItem("ui-org-site-theme") : null;
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
      <p className="sem-tokens__blurb sem-tokens__blurb--wide">
        Each token points at a step on a color ramp, like <code>brand.1400</code>, rather than a
        fixed hex. <code>brand.*</code> follows the brand you pick, <code>grey.*</code> follows
        your neutral, and every other family stays fixed. Light and dark mode each have their own
        mapping, shown below. Use tokens through <code>var(--color-…)</code>, never a primitive
        directly.
      </p>

      {CATEGORIES.filter((c) => byCategory.has(c.key)).map((cat) => (
        <section className="sem-tokens__group" key={cat.key}>
          <h3 className="sem-tokens__heading">{cat.label}</h3>
          <p className="sem-tokens__blurb">{cat.blurb}</p>
          {/* Four columns of nowrap token names don't fit a phone. Scroll the
              table rather than let it overflow the page — the marketing docs
              render this inside a body that hides horizontal overflow, so
              without the wrapper the Role column was simply unreachable.
              `tabIndex` because nothing inside is focusable, so without it a
              keyboard user has no way to reach the columns off to the right. */}
          <div
            className="sem-tokens__scroll"
            tabIndex={0}
            role="region"
            aria-label="Semantic tokens table, scrollable"
          >
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
          </div>
        </section>
      ))}
    </div>
  );
}
