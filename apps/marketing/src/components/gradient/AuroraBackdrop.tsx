import "./aurora-backdrop.css";

/**
 * Four blurred, screen-blended brand fields that drift behind the hero
 * (SITE.md §6). Drift is pure CSS keyframes, disabled under reduced motion —
 * the colored fields stay, they just stop moving. Decorative.
 */
export function AuroraBackdrop() {
  return (
    <div className="aurora" aria-hidden="true">
      <i className="aurora__field aurora__field--coral" />
      <i className="aurora__field aurora__field--cobalt" />
      <i className="aurora__field aurora__field--magenta" />
      <i className="aurora__field aurora__field--sun" />
    </div>
  );
}
