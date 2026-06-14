import "./grain.css";

/**
 * Fixed full-page film-grain overlay (SITE.md §6) — rendered once at the app
 * root. Static (no motion), so it stays on under reduced motion. Decorative.
 */
export function Grain() {
  return <div className="grain" aria-hidden="true" />;
}
