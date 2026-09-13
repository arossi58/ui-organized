/**
 * Where focus goes when a surface opens, and where it comes back to.
 *
 * ── Why the CDK's `FocusTrap` is not asked this ─────────────────────────────
 *
 * `FocusTrap.focusInitialElement()` finds the first tabbable element through
 * `InteractivityChecker`, which asks the element whether it is *visible* —
 * `offsetWidth`, `offsetHeight`, `getClientRects()`. That is the right question
 * in a browser and unanswerable in jsdom, where every element measures zero, so
 * a trap consulted in a unit test reports that a dialog full of buttons has
 * nothing to focus. The trap is still what holds Tab inside the surface; this is
 * only the opening move, and it is deliberately structural so that the behaviour
 * a spec asserts is the behaviour a browser performs.
 */

/**
 * Elements that take focus by default, in DOM order.
 *
 * `[tabindex]:not([tabindex="-1"])` rather than every `[tabindex]`, because
 * `-1` means "focusable by script, not by Tab" — the popup itself carries one,
 * and landing on it would skip the close button a user expects.
 */
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
]
  .map((selector) => `${selector}:not([aria-hidden="true"])`)
  .join(",");

export function firstFocusable(root: HTMLElement): HTMLElement | null {
  return root.querySelector<HTMLElement>(FOCUSABLE);
}

/**
 * Focus the first thing inside `root`, falling back to `root` itself.
 *
 * The fallback is why every popup in this library carries `tabindex="-1"`: a
 * dialog with nothing focusable in it still has to take focus, or the next Tab
 * starts from the top of the page and walks straight past the dialog.
 */
export function focusInside(root: HTMLElement): void {
  (firstFocusable(root) ?? root).focus({ preventScroll: true });
}

/**
 * Give focus back to whatever opened the surface.
 *
 * Guarded on the element still being in the document: a menu item that removes
 * its own trigger would otherwise focus a detached node, which silently sends
 * focus to `<body>` and loses the user's place entirely.
 */
export function restoreFocus(trigger: HTMLElement | null): void {
  if (trigger?.isConnected) trigger.focus({ preventScroll: true });
}
