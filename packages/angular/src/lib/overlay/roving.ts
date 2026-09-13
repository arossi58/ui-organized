/**
 * Moving a highlight over a list of options with the keyboard.
 *
 * ── Why this is not `ActiveDescendantKeyManager` ────────────────────────────
 *
 * The CDK ships exactly the right manager for this pattern, and it does not fit
 * either of the two lists in this library.
 *
 * `ListKeyManager` and its subclasses take a `QueryList`, an array, or a signal
 * of **objects implementing `Highlightable`** — `setActiveStyles()` and
 * `setInactiveStyles()`, imperative methods each item uses to style itself.
 * Select's options are not objects at all: they are the `options` input, plain
 * data rendered by a `@for`, and there is nothing to call a method on. Menu's
 * items *are* directives, but they report their highlight through a
 * `data-highlighted` binding read off the parent's state — which is how Ark does
 * it, and which the shared stylesheet requires — so `setActiveStyles` would have
 * to write the attribute a binding already owns, and the two would fight on
 * every change-detection pass.
 *
 * What is left of the manager once those are removed is the index arithmetic,
 * which is this file. It is small, it is the same in both components, and it
 * skips disabled options — the one piece of that arithmetic that is easy to get
 * wrong and invisible when it is: a menu that highlights a disabled item looks
 * fine and does nothing when Enter is pressed.
 */

export interface Navigable {
  disabled: boolean;
}

/**
 * The first selectable index at or after `from`, walking in `step`'s direction.
 *
 * Returns -1 when every option is disabled, which is a real state — a menu whose
 * actions are all unavailable — and has to leave the highlight where it was
 * rather than land on something that cannot be chosen.
 */
export function firstEnabled(items: readonly Navigable[], from: number, step: number): number {
  for (let index = from; index >= 0 && index < items.length; index += step) {
    if (!items[index]?.disabled) return index;
  }
  return -1;
}

/**
 * The next selectable index from `current`, wrapping at the ends.
 *
 * `current` of -1 means nothing is highlighted yet, which is the state a menu
 * opens in: the first ArrowDown lands on the first option and the first ArrowUp
 * on the last, in every library here.
 */
export function moveHighlight(
  items: readonly Navigable[],
  current: number,
  step: number,
): number {
  if (!items.length) return -1;
  if (current === -1) {
    return step > 0 ? firstEnabled(items, 0, 1) : firstEnabled(items, items.length - 1, -1);
  }
  const forward = firstEnabled(items, current + step, step);
  if (forward !== -1) return forward;
  // Wrapped: start again from the far end. A list with one enabled option
  // therefore stays on it rather than losing the highlight.
  return step > 0 ? firstEnabled(items, 0, 1) : firstEnabled(items, items.length - 1, -1);
}

/**
 * Sort by where the elements actually are.
 *
 * Items register themselves as they are constructed, and construction order is
 * template order only until something conditional appears above them. Arrow keys
 * that move in registration order rather than reading order are the kind of bug
 * that survives every test written against a static list.
 */
export function inDomOrder<T extends { element: HTMLElement }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) =>
    a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
  );
}
