/**
 * Warn that a dismissible chip shipped without an accessible name.
 *
 * The dismiss button is icon-only, so `removeLabel` is its entire accessible
 * name — without one it fails axe's `button-name`, and the failure is invisible
 * on screen. This is the exact shape of bug the `Listbox`/`aria-label` gap had:
 * a prop that looks optional, and a violation nothing on the page shows you.
 *
 * It lives in its own `.ts` module rather than inline in `Chip.tsx` because
 * `process.env` in a `.tsx` file fails the package's declaration build (`TS2580:
 * Cannot find name 'process'`) while the same line in a `.ts` file compiles —
 * which is also why `warnMissingIconSet` is shaped this way.
 */
export function warnMissingRemoveLabel(): void {
  if (process.env.NODE_ENV === "production") return;
  console.warn(
    "[@ui-organized/react] <Chip> has `onRemove` but no `removeLabel`. The dismiss " +
      "button is icon-only, so without one it ships unnamed and fails `button-name`. " +
      'Name the whole action — "Remove filter: Role is any of Admin" — not just "Remove": ' +
      "a row of chips otherwise gives assistive tech six identical buttons.",
  );
}
